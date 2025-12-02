import { NextResponse } from "next/server";
import xml2js from "xml2js";

const OWNER = "faistasortieaToulouse";
const REPO = "ftsdatatoulouse";
const PATH = "data/podmarathon-cache.json";
const BRANCH = "main";
const GITHUB_API = "[https://api.github.com](https://api.github.com)";

const RSS_URL = "[https://feeds.acast.com/public/shows/le-marathon-des-mots](https://feeds.acast.com/public/shows/le-marathon-des-mots)"; // URL correcte

if (!process.env.GITHUB_TOKEN) {
throw new Error("GITHUB_TOKEN non défini dans les variables d'environnement.");
}

export async function GET() {
try {
// 1️⃣ Télécharger flux RSS
const res = await fetch(RSS_URL);
if (!res.ok) throw new Error("Impossible de récupérer le flux RSS.");
const xml = await res.text();

// 2️⃣ Parser XML
const parsed = await xml2js.parseStringPromise(xml);
const items = parsed.rss.channel[0].item || [];

const episodes = items.map((item: any) => ({
  titre: item.title?.[0] ?? "",
  date: item.pubDate?.[0] ?? "",
  description:
    item["content:encoded"]?.[0] ||
    item.description?.[0] ||
    "",
  audioUrl: item.enclosure?.[0]?.$.url || "",
}));

// 3️⃣ Récupérer SHA du fichier existant
const getUrl = `${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${PATH}?ref=${BRANCH}`;
const getRes = await fetch(getUrl, {
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  },
});

if (!getRes.ok) throw new Error("Impossible de récupérer le fichier GitHub");
const fileData = await getRes.json();
const sha = fileData.sha;

// 4️⃣ Mise à jour GitHub — FORMAT CORRECT ⬅️⬅️⬅️ IMPORTANT
const updateBody = {
  data: episodes,
};

const updateRes = await fetch(`${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${PATH}`, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  },
  body: JSON.stringify({
    message: `Mise à jour podmarathon (${new Date().toISOString()})`,
    content: Buffer.from(JSON.stringify(updateBody, null, 2)).toString("base64"),
    sha,
    branch: BRANCH,
  }),
});

if (!updateRes.ok) throw new Error("Erreur lors de la mise à jour GitHub");
const result = await updateRes.json();

return NextResponse.json({ totalEpisodes: episodes.length, github: result });

} catch (err: any) {
console.error("Erreur update-cache :", err);
return NextResponse.json({ error: err.message }, { status: 500 });
}
}
