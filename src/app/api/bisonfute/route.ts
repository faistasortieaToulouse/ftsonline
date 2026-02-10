import { NextResponse } from "next/server";
import xml2js from "xml2js";

const BISON_XML_URL = "https://www.bison-fute.gouv.fr/opendata/Datex2/SudOuest/Situation.xml";

export async function GET() {
  try {
    const res = await fetch(BISON_XML_URL, {
      next: { revalidate: 300 },
      headers: { "Accept": "application/xml" }
    });

    if (!res.ok) return NextResponse.json([]);

    const xmlText = await res.text();
    
    // CONFIGURATION CRUCIALE : stripPrefix enlève les "d2:" qui bloquent la lecture
    const parser = new xml2js.Parser({ 
      explicitArray: false, 
      tagNameProcessors: [xml2js.processors.stripPrefix] 
    });

    const data = await parser.parseStringPromise(xmlText);

    // On cherche les situations peu importe où elles sont dans l'arborescence
    const payload = data?.d2LogicalModel?.payloadPublication || data?.payloadPublication;
    const situations = payload?.situation;

    let events = [];
    if (situations) {
      events = Array.isArray(situations) ? situations : [situations];
    }

    return NextResponse.json(events);
  } catch (error) {
    console.error("Erreur Bison Futé:", error);
    return NextResponse.json([]);
  }
}
