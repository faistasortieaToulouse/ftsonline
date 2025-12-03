import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import ical, { VEvent } from "ical";

// --- Configuration des flux iCalendar ---
const ICAL_URLS = [
"[https://www.meetup.com/fr-FR/colocation-logement-hebergement-emploi-job-stage-toulouse/events/ical/](https://www.meetup.com/fr-FR/colocation-logement-hebergement-emploi-job-stage-toulouse/events/ical/)"
];

// --- Horaires de rafraîchissement ---
const REFRESH_TIMES = [
{ hour: 4, minute: 0 },
{ hour: 16, minute: 0 }
];

// --- GitHub config ---
const GITHUB_OWNER = "faistasortieaToulouse";
const GITHUB_REPO = "ftsdatatoulouse";
const FILE_PATH = "data/meetup-coloc.json";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// --- Type d'événement ---
type MeetupEventItem = {
title: string;
link: string;
startDate: Date;
location: string;
fullAddress: string;
description: string;
coverImage?: string;
};

// --- Scraping pour image + adresse JSON-LD ---
async function scrapeEventData(url: string): Promise<{ coverImage?: string; fullAddress?: string }> {
try {
const res = await fetch(url);
if (!res.ok) return {};

const html = await res.text();
const $ = cheerio.load(html);

const ogImage = $('meta[property="og:image"]').attr('content');

let fullAddress: string | undefined;
$('script[type="application/ld+json"]').each((i, elem) => {
  try {
    const json = $(elem).html();
    if (!json) return;
    const data = JSON.parse(json);
    if (data['@type'] === 'Event' || data['@type'] === 'FoodEvent') {
      const addr = data.location?.address;
      if (addr?.streetAddress) {
        fullAddress = `${addr.streetAddress}, ${addr.addressLocality || ''}`
          .trim()
          .replace(/,$/, '')
          .trim();
        return false;
      }
    }
  } catch {}
});

return { coverImage: ogImage, fullAddress };

} catch {
return {};
}
}

// --- Fonction pour push sur GitHub ---
async function pushToGitHub(content: any) {
if (!GITHUB_TOKEN) throw new Error("GITHUB_TOKEN non défini");

const base64Content = Buffer.from(JSON.stringify(content, null, 2)).toString("base64");

// Récupérer SHA si fichier existe
let sha: string | undefined;
const getRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
});
if (getRes.ok) {
const data = await getRes.json();
sha = data.sha;
}

// PUT pour créer ou mettre à jour
const putRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
method: "PUT",
headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
body: JSON.stringify({
message: "Mise à jour automatique meetup-coloc.json",
content: base64Content,
sha,
}),
});

if (!putRes.ok) {
const errText = await putRes.text();
throw new Error(`GitHub API error: ${errText}`);
}

return putRes.json();
}

// --- Route API ---
export async function GET() {
try {
// 1️⃣ Récupération iCal
const fetchPromises = ICAL_URLS.map(async url => {
const res = await fetch(url);
if (!res.ok) throw new Error("Erreur iCal");
return ical.parseICS(await res.text());
});

const allCalendars = await Promise.all(fetchPromises);

// 2️⃣ Déduplication
const unique = new Map<string, VEvent>();
for (const calendar of allCalendars) {
  for (const key in calendar) {
    const e = calendar[key] as VEvent;
    if (e.type === "VEVENT" && e.start) {
      const id = e.uid || e.summary + e.start.toISOString();
      unique.set(id, e);
    }
  }
}
const uniqueEvents = Array.from(unique.values());

// 3️⃣ Scraping + normalisation
const processed = uniqueEvents.map(async e => {
  let url: string | undefined;
  if (typeof e.url === "string" && e.url.startsWith("http")) url = e.url;
  else if (typeof e.url === "object" && e.url?.val?.startsWith("http")) url = e.url.val;
  else url = e.uid ? `https://www.meetup.com/fr-FR/events/${e.uid}/` : undefined;

  let extra = {};
  if (url) extra = await scrapeEventData(url);

  const icalAddress = (e.location || "").trim();
  const jsonLdAddress = (extra as any).fullAddress || "";
  const finalAddress = icalAddress || jsonLdAddress || "Lieu non spécifié";

  return {
    title: e.summary || "Événement sans titre",
    link: url || "",
    startDate: new Date(e.start),
    location: e.location?.split(",")[0] || finalAddress,
    fullAddress: finalAddress,
    description: String(e.description || "Pas de description"),
    coverImage: (extra as any).coverImage,
  } as MeetupEventItem;
});

let finalEvents = await Promise.all(processed);

// 4️⃣ Filtrage sur les 31 prochains jours
const now = new Date();
const startFilter = new Date(now);
startFilter.setHours(0, 0, 0, 0);
const endFilter = new Date(startFilter.getTime() + 31 * 86400000);

finalEvents = finalEvents.filter(e => e.startDate >= startFilter && e.startDate < endFilter);
finalEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
const totalEvents = finalEvents.length;

// 5️⃣ Push sur GitHub
await pushToGitHub({ events: finalEvents, totalEvents });

// 6️⃣ Cache côté serveur (headers)
const futureTriggers = REFRESH_TIMES.map(t => {
  const d = new Date(now);
  d.setHours(t.hour, t.minute, 0, 0);
  if (d <= now) d.setDate(d.getDate() + 1);
  return d;
}).sort((a, b) => a.getTime() - b.getTime());

const nextRefresh = futureTriggers[0];
const secondsUntilRefresh = Math.floor((nextRefresh.getTime() - now.getTime()) / 1000);

const headers = {
  "Cache-Control": `public, s-maxage=${secondsUntilRefresh}, stale-while-revalidate=43200`
};

return NextResponse.json({ events: finalEvents, totalEvents }, { status: 200, headers });

} catch (err: any) {
console.error(err);
return NextResponse.json({ error: err.message || "Erreur lors de la récupération des iCal" }, { status: 500 });
}
}
