import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

const BISON_SITUATIONS_URL = "https://www.bison-fute.gouv.fr/opendata/flux/zones/SIT_NATIONALE.xml";

export async function GET() {
  try {
    const res = await fetch(BISON_SITUATIONS_URL, { next: { revalidate: 300 } });
    const xmlText = await res.text();
    const data = await parseStringPromise(xmlText, { explicitArray: false });

    let situations = data?.d2LogicalModel?.payloadPublication?.situation || [];
    if (!Array.isArray(situations)) situations = [situations];

    // On filtre sur "Toulouse" ou "31" (Haute-Garonne)
    const filtered = situations.filter((sit: any) => {
      const text = JSON.stringify(sit).toLowerCase();
      return text.includes("toulouse") || text.includes("(31)");
    });

    return NextResponse.json(filtered);
  } catch (error) {
    return NextResponse.json({ error: "Erreur de flux" }, { status: 500 });
  }
}
