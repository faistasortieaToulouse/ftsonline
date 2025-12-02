import { NextResponse } from "next/server";

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
const res = await fetch(`${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${PATH}?ref=${BRANCH}`, {
headers: {
Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
Accept: "application/vnd.github+json",
},
});

if (!res.ok) {
  throw new Error(`Impossible de récupérer le cache GitHub : ${res.status} ${res.statusText}`);
}

const fileData = await res.json();
const content = Buffer.from(fileData.content, "base64").toString("utf-8");
const episodes = JSON.parse(content);

return NextResponse.json({ data: episodes });

} catch (err: any) {
console.error("Erreur GET /podmarathon :", err);
return NextResponse.json({ data: [], error: err.message }, { status: 500 });
}
}
