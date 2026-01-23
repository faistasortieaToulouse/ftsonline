import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

// Flux spécifique Zone Sud-Ouest (plus fiable et inclut Toulouse/31)
const BISON_URL = "https://www.bison-fute.gouv.fr/opendata/flux/zones/SIT_SUD-OUEST.xml";

export async function GET() {
  try {
    const res = await fetch(BISON_URL, { 
      cache: 'no-store',
      headers: { 'Accept': 'application/xml' }
    });

    if (!res.ok) throw new Error(`Bison Fute API répond: ${res.status}`);

    const xmlText = await res.text();
    const data = await parseStringPromise(xmlText, { explicitArray: false });

    // Structure Datex2 : d2LogicalModel -> payloadPublication -> situation
    const payload = data?.d2LogicalModel?.payloadPublication;
    let situations = payload?.situation || [];
    
    if (!Array.isArray(situations)) {
      situations = [situations];
    }

    // Filtrage intelligent pour Toulouse et ses autoroutes
    const toulouseKeywords = ["toulouse", "(31)", "a620", "a61", "a62", "a64", "a68", "rocade"];
    
    const filtered = situations.filter((sit: any) => {
      const text = JSON.stringify(sit).toLowerCase();
      return toulouseKeywords.some(key => text.includes(key));
    });

    // Si on est un dimanche ou jour calme et que "filtered" est vide, 
    // on renvoie les 5 premiers de la zone Sud-Ouest pour vérifier que ça marche
    const finalData = filtered.length > 0 ? filtered : situations.slice(0, 5);

    return NextResponse.json(finalData);
  } catch (error: any) {
    console.error("Erreur API Bison:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
