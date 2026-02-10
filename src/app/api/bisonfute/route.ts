import { NextResponse } from "next/server";
import xml2js from "xml2js";

const BISON_XML_URL = "https://www.bison-fute.gouv.fr/opendata/Datex2/SudOuest/Situation.xml";

export async function GET() {
  try {
    const res = await fetch(BISON_XML_URL, {
      next: { revalidate: 300 },
      headers: { "Accept": "application/xml" }
    });

    if (!res.ok) return NextResponse.json([], { status: res.status });

    const xmlText = await res.text();
    const parser = new xml2js.Parser({ 
      explicitArray: false, 
      tagNameProcessors: [xml2js.processors.stripPrefix] // Supprime les "d2:" pour lire facilement
    });
    
    const data = await parser.parseStringPromise(xmlText);

    // Recherche récursive de la publication ou des situations
    const publication = data?.d2LogicalModel?.payloadPublication || data?.payloadPublication;
    const situations = publication?.situation;

    let events = [];
    if (situations) {
      events = Array.isArray(situations) ? situations : [situations];
    }

    // DEBUG: Affiche le nombre d'événements trouvés dans la console du terminal
    console.log(`Bison Futé: ${events.length} événements trouvés`);

    return NextResponse.json(events);
  } catch (error) {
    console.error("Erreur API BisonFute:", error);
    return NextResponse.json([]);
  }
}
