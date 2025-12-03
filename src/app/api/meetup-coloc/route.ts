import { NextResponse } from "next/server";

const GITHUB_OWNER = "faistasortieaToulouse";
const GITHUB_REPO = "ftsdatatoulouse";
const FILE_PATH = "data/meetup-coloc.json";

export const dynamic = "force-static";
export const revalidate = 3600; // 1h, tu peux mettre false si tu veux

export async function GET() {
try {
const res = await fetch(
`https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${FILE_PATH}`,
{ next: { revalidate: 3600 } }
);

if (!res.ok) {
  return NextResponse.json(
    { error: "Impossible de lire meetup-coloc.json sur GitHub" },
    { status: 500 }
  );
}

const json = await res.json();
return NextResponse.json(json);

} catch (err) {
return NextResponse.json(
{ error: "Erreur interne : " + (err as Error).message },
{ status: 500 }
);
}
}
