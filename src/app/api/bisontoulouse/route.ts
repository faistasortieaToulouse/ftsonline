import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

export const dynamic = 'force-dynamic';

// On utilise le flux QTV (Quotidien) qui est un index centralisé
const BISON_URL = "https://tipi.bison-fute.gouv.fr/bison-fute-ouvert/publicationsDIR/QTV-DIR/qtvDir.xml";

export async function GET() {
  try {
    const res = await fetch(BISON_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/xml',
      },
      next: { revalidate: 0 }
    });

    if (!res.ok) throw new Error(`Erreur Bison: ${res.status}`);

    const xmlText = await res.text();
    const data = await parseStringPromise(xmlText, { explicitArray: false });

    // Dans qtvDir.xml, la structure est différente :
    // d2LogicalModel -> payloadPublication -> situation
    let situations = data?.d2LogicalModel?.payloadPublication?.situation;

    let list = [];
    if (Array.isArray(situations)) list = situations;
    else if (situations) list = [situations];

    // FILTRAGE : On cherche Toulouse ou les routes du 31
    const toulouseKeywords = ["toulouse", "(31)", "a620", "a61", "a62", "a64", "a68", "rocade"];
    
    let filtered = list.filter((sit: any) => {
      const text = JSON.stringify(sit).toLowerCase();
      return toulouseKeywords.some(k => text.includes(k));
    });

    // TEST DE SECOURS : Si rien à Toulouse, on affiche les 3 premiers incidents du flux
    // pour prouver que la connexion fonctionne.
    const finalData = filtered.length > 0 ? filtered : list.slice(0, 3);

    return NextResponse.json(finalData);

  } catch (error: any) {
    console.error("Erreur API:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
