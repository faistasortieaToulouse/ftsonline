import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import ical, { VEvent } from "ical";

// --- iCal source Meetup ---
const ICAL_URLS = [
  "https://www.meetup.com/fr-FR/colocation-logement-hebergement-emploi-job-stage-toulouse/events/ical/"
];

// --- GitHub config ---
const GITHUB_OWNER = "faistasortieaToulouse";
const GITHUB_REPO = "ftsdatatoulouse";
const FILE_PATH = "data/meetup-coloc.json";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

type MeetupEventItem = {
  title: string;
  link: string;
  startDate: Date;
  location: string;
  fullAddress: string;
  description: string;
  coverImage?: string;
};

// --- Scraping HTML Meetup pour image / adresse ---
async function scrapeEventData(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) return {};

    const html = await res.text();
    const $ = cheerio.load(html);

    const ogImage = $('meta[property="og:image"]').attr("content");

    let fullAddress: string | undefined;
    $("script[type='application/ld+json']").each((_, el) => {
      try {
        const json = $(el).html();
        if (!json) return;
        const data = JSON.parse(json);
        if (data["@type"] === "Event") {
          const addr = data.location?.address;
          if (addr?.streetAddress) {
            fullAddress = `${addr.streetAddress}, ${addr.addressLocality || ""}`
              .trim()
              .replace(/,$/, "");
          }
        }
      } catch {}
    });

    return { coverImage: ogImage, fullAddress };
  } catch {
    return {};
  }
}

// --- Push vers GitHub ---
async function pushToGitHub(content: any) {
  if (!GITHUB_TOKEN) throw new Error("GITHUB_TOKEN manquant");

  const base64Content = Buffer.from(JSON.stringify(content, null, 2)).toString("base64");

  // Vérifier si le fichier existe
  let sha: string | undefined;
  const getRes = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`,
    { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } }
  );

  if (getRes.ok) {
    const data = await getRes.json();
    sha = data.sha;
  }

  // Put final
  const putRes = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Mise à jour automatique meetup-coloc.json",
        content: base64Content,
        sha,
      }),
    }
  );

  if (!putRes.ok) throw new Error(await putRes.text());
}

// --- Route API ---
export async function GET() {
  try {
    console.log("Récupération iCal depuis Meetup...");

    // 1. Récup iCal
    const calendars = await Promise.all(
      ICAL_URLS.map(async url => {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Erreur iCal");
        return ical.parseICS(await res.text());
      })
    );

    // 2. Extraction & déduplication
    const unique = new Map<string, VEvent>();
    for (const calendar of calendars) {
      for (const key in calendar) {
        const e = calendar[key] as VEvent;

        // ✅ Correction ici : on utilise dtstart au lieu de e.type
        if ("dtstart" in e && e.dtstart) {
          const id = e.uid || e.summary + e.dtstart.toISOString();
          unique.set(id, e);
        }
      }
    }

    const rawEvents = Array.from(unique.values());
    console.log(`Événements extraits depuis iCal : ${rawEvents.length}`);

    // 3. Scraping + normalisation
    const processed: MeetupEventItem[] = await Promise.all(
      rawEvents.map(async e => {
        let url: string | undefined;

        if (typeof e.url === "string") url = e.url;
        else if (typeof e.url === "object" && e.url.val) url = e.url.val;

        const extra = url ? await scrapeEventData(url) : {};

        const fullAddress = extra.fullAddress || (e.location ?? "Lieu non spécifié");

        return {
          title: e.summary || "Événement sans titre",
          link: url || "",
          startDate: new Date(e.dtstart),
          location: e.location || "",
          fullAddress,
          description: String(e.description || ""),
          coverImage: extra.coverImage,
        };
      })
    );

    // 4. Conversion → format final
    const final = processed.map(ev => ({
      guid: ev.link || ev.title,
      titre: ev.title,
      date: ev.startDate.toISOString(),
      description: ev.description,
      image: ev.coverImage,
      lieu: ev.location,
      address: ev.fullAddress,
      link: ev.link,
    }));

    console.log(`Événements transformés : ${final.length}`);

    // 5. Envoi sur GitHub
    await pushToGitHub(final);

    return NextResponse.json({ ok: true, total: final.length });
  } catch (e: any) {
    console.error("Erreur lors de la mise à jour des événements :", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
