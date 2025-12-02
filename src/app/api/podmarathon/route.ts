import { NextResponse } from "next/server";

const OWNER = "faistasortieaToulouse";
const REPO = "ftsdatatoulouse";
const PATH = "data/podmarathon-cache.json";
const BRANCH = "main";
const GITHUB_API = "https://api.github.com";

if (!process.env.GITHUB_TOKEN) {
throw new Error("GITHUB_TOKEN non défini dans les variables d'environnement.");
}

export async function GET() {
try {
const url = `${GITHUB_API}/repos/${OWNER}/${REPO}/contents/${PATH}?ref=${BRANCH}`;
const res = await fetch(url, {
headers: {
Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
Accept: "application/vnd.github+json",
},
});

if (!res.ok) throw new Error(`Impossible de récupérer le cache : ${res.statusText}`);
const fileData = await res.json();

// Le contenu est en base64 sur GitHub
const decoded = Buffer.from(fileData.content, "base64").toString("utf-8");
const data = JSON.parse(decoded);

return NextResponse.json({ data });

} catch (err: any) {
console.error("Erreur GET /podmarathon :", err);
return NextResponse.json({ data: [], error: err.message }, { status: 500 });
}
}
