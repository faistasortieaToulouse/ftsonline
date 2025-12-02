import { NextResponse } from "next/server";
import xml2js from "xml2js";

const OWNER = "faistasortieaToulouse";
const REPO = "ftsdatatoulouse";
const PATH = "data/podmarathon-cache.json";
const BRANCH = "main";
const GITHUB_API = "[https://api.github.com](https://api.github.com)";

const RSS_URL = "https://feed.ausha.co/BnYn5Uw5W3WO";

if (!process.env.GITHUB_TOKEN) {
throw new Error("GITHUB_TOKEN non défini dans les variables d'environnement.");
}

interface Episode {
titre: string;
date: string;
description: string;
audioUrl: string;
}

async function getFileSha(): Promise<string | null> {
const res = await fetch(`${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${PATH}?ref=${BRANCH}`, {
headers: {
Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
Accept: "application/vnd.github+json",
},
});

if (!res.ok) return null;
const data = await res.json();
return data.sha;
}

export async function GET() {
try {
// 1️⃣ Télécharger et parser le flux RSS
const res = await fetch(RSS_URL);
if (!res.ok) throw new Error("Impossible de récupérer le flux RSS.");
const xml = await res.text();
const parsed = await xml2js.parseStringPromise(xml);
const items = parsed.rss.channel[0].item || [];

const episodes: Episode[] = items.map((item: any) => ({
  titre: item.title?.[0] ?? "",
  date: item.pubDate?.[0] ?? "",
  description: item["content:encoded"]?.[0] || item.description?.[0] || "",
  audioUrl: item.enclosure?.[0]?.$.url || "",
}));

// 2️⃣ Préparer le contenu pour GitHub
const updateBody = { data: episodes };
const contentBase64 = Buffer.from(JSON.stringify(updateBody, null, 2)).toString("base64");

// 3️⃣ Récupérer SHA si fichier existant
const sha = await getFileSha();

// 4️⃣ Mettre à jour GitHub
const updateRes = await fetch(`${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${PATH}`, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  },
  body: JSON.stringify({
    message: `Mise à jour podmarathon (${new Date().toISOString()})`,
    content: contentBase64,
    sha: sha || undefined,
    branch: BRANCH,
  }),
});

if (!updateRes.ok) {
  const errText = await updateRes.text();
  throw new Error("Erreur lors de la mise à jour GitHub : " + errText);
}

const result = await updateRes.json();

return NextResponse.json({ totalEpisodes: episodes.length, github: result });

} catch (err: any) {
console.error("Erreur update-cache :", err);
return NextResponse.json({ error: err.message }, { status: 500 });
}
}
