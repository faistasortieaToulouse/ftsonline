import { NextResponse } from "next/server";
import xml2js from "xml2js";

const OWNER = "faistasortieaToulouse";
const REPO = "ftsdatatoulouse";
const PATH = "data/podmarathon-cache.json";
const BRANCH = "main";
const GITHUB_API = "[https://api.github.com](https://api.github.com)";

const RSS_URL = "[https://feed.ausha.co/BnYn5Uw5W3WO](https://feed.ausha.co/BnYn5Uw5W3WO)";

if (!process.env.GITHUB_TOKEN) {
throw new Error("GITHUB_TOKEN non défini dans les variables d'environnement.");
}

async function fetchRSSPage(page) {
const url = `${RSS_URL}?page=${page}`;
const res = await fetch(url);
if (!res.ok) return [];

const text = await res.text();
const parsed = await xml2js.parseStringPromise(text);
return parsed?.rss?.channel?.[0]?.item || [];
}

export async function GET() {
try {

// 1️⃣ Récupérer TOUTES les pages RSS
let page = 1;
let allItems = [];

while (true) {
  const items = await fetchRSSPage(page);
  if (!items || items.length === 0) break;
  allItems = allItems.concat(items);
  page++;
}

const episodes = allItems.map((item) => ({
  titre: item.title?.[0] || "Sans titre",
  date: item.pubDate?.[0] || "",
  description: item["content:encoded"]?.[0] || item.description?.[0] || "",
  audioUrl: item.enclosure?.[0]?.$.url || "",
}));

// 2️⃣ Récupérer le SHA du fichier existant sur GitHub
const getUrl = `${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${PATH}?ref=${BRANCH}`;
const getRes = await fetch(getUrl, {
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  },
});

if (!getRes.ok) {
  throw new Error(`Impossible de récupérer le fichier GitHub : ${getRes.statusText}`);
}

const fileData = await getRes.json();

// 3️⃣ Mettre à jour le fichier sur GitHub
const updateUrl = `${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${PATH}`;
const updateRes = await fetch(updateUrl, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  },
  body: JSON.stringify({
    message: `Mise à jour du cache complet (${episodes.length} épisodes)`,
    content: Buffer.from(JSON.stringify(episodes, null, 2)).toString("base64"),
    sha: fileData.sha,
    branch: BRANCH,
  }),
});

if (!updateRes.ok) {
  throw new Error(`Erreur lors de la mise à jour : ${updateRes.statusText}`);
}

const result = await updateRes.json();

return NextResponse.json({
  ok: true,
  totalEpisodes: episodes.length,
  pagesFetched: page - 1,
  github: result,
});

} catch (err: any) {
console.error("Erreur update-cache :", err);
return NextResponse.json({ error: err.message }, { status: 500 });
}
}
