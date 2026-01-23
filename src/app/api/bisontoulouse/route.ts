import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

export const dynamic = 'force-dynamic';

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
    const data = await parseStringPromise(xmlText, { 
        explicitArray: false,
        tagNameProcessors: [(name) => name.replace('soap:', '').replace('xsi:', '')] // On nettoie les préfixes
    });

    // NAVIGATION DANS LA STRUCTURE SOAP DÉTECTÉE :
    // Envelope -> Body -> d2LogicalModel -> payloadPublication -> situation
    const envelope = data["Envelope"] || data["soap:Envelope"];
    const body = envelope?.Body || envelope?.["soap:Body"];
    const model = body?.d2LogicalModel;
    const situations = model?.payloadPublication?.situation;

    let list = [];
    if (Array.isArray(situations)) list = situations;
    else if (situations) list = [situations];

    // Filtrage pour Toulouse
    const toulouseKeywords = ["toulouse", "(31)", "a620", "a61", "a62", "a64", "a68", "rocade"];
    const filtered = list.filter((sit: any) => {
      const text = JSON.stringify(sit).toLowerCase();
      return toulouseKeywords.some(k => text.includes(k));
    });

    // Sécurité : si le filtre est vide, on renvoie les 3 premiers du flux pour tester
    const finalData = filtered.length > 0 ? filtered : list.slice(0, 3);

    return NextResponse.json(finalData);

  } catch (error: any) {
    console.error("Erreur API:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
