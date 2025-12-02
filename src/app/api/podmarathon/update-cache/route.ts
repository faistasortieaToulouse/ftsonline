import { NextResponse } from "next/server";
import xml2js from "xml2js";

const RSS_URL = "[https://feed.ausha.co/BnYn5Uw5W3WO](https://feed.ausha.co/BnYn5Uw5W3WO)";
const OWNER = "faistasortieaToulouse";
const REPO = "ftsdatatoulouse";
const PATH = "data/podmarathon-cache.json";
const BRANCH = "main";

if (!process.env.GITHUB_TOKEN) {
throw new Error("GITHUB_TOKEN non défini dans les variables d'environnement.");
}

const GITHUB_API = "[https://api.github.com](https://api.github.com)";

export async function GET() {
try {
// 1️⃣ Récupérer le flux RSS
const res = await fetch(RSS_URL);
if (!res.ok) throw new Error("Impossible de récupérer le flux RSS.");
const text = await res.text();

// 2️⃣ Parser le XML
const parsed = await xml2js.parseStringPromise(text);
const items = parsed.rss.channel[0].item || [];

const episodes = items.map((item: any) => ({
  titre: item.title[0] || "Sans titre",
  date: item.pubDate[0] || "",
  description: item["content:encoded"]?.[0] || item.description?.[0] || "",
  audioUrl: item.enclosure?.[0]?.$.url || "",
}));

// 3️⃣ Récupérer le SHA du fichier existant sur GitHub
const getRes = await fetch(`${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${PATH}?ref=${BRANCH}`, {
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  },
});

if (!getRes.ok) throw new Error(`Impossible de récupérer le fichier GitHub : ${getRes.statusText}`);
const fileData = await getRes.json();
const sha = fileData.sha;

// 4️⃣ Mettre à jour le fichier sur GitHub
const updateRes = await fetch(`${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${PATH}`, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  },
  body: JSON.stringify({
    message: `Mise à jour du cache podmarathon (${new Date().toISOString()})`,
    content: Buffer.from(JSON.stringify(episodes, null, 2)).toString("base64"),
    sha,
    branch: BRANCH,
  }),
});

if (!updateRes.ok) throw new Error(`Erreur lors de la mise à jour : ${updateRes.statusText}`);
const result = await updateRes.json();

return NextResponse.json({ totalEpisodes: episodes.length, github: result });

} catch (err: any) {
console.error("Erreur update-cache :", err);
return NextResponse.json({ error: err.message }, { status: 500 });
}
}
