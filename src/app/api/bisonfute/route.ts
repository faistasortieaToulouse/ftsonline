import { NextResponse } from "next/server";
import xml2js from "xml2js";

// On utilise l'URL officielle pour le Sud-Ouest (inclut Toulouse)
const BISON_XML_URL = "https://www.bison-fute.gouv.fr/opendata/Datex2/SudOuest/Situation.xml";

export async function GET() {
  try {
    const res = await fetch(BISON_XML_URL, {
      next: { revalidate: 300 } // Rafraîchir toutes les 5 minutes
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Lien Bison Futé indisponible" }, { status: res.status });
    }

    const xmlText = await res.text();
    const parser = new xml2js.Parser({ explicitArray: false });
    const data = await parser.parseStringPromise(xmlText);

    // Extraction des situations (Structure Datex2 officielle)
    // On descend dans l'arborescence : d2LogicalModel -> payloadPublication -> situation
    const situations = data?.d2LogicalModel?.payloadPublication?.situation;

    // On s'assure de toujours renvoyer un tableau
    let events = [];
    if (situations) {
      events = Array.isArray(situations) ? situations : [situations];
    }

    return NextResponse.json(events);
  } catch (error: any) {
    console.error("Erreur API BisonFute:", error);
    // On renvoie un tableau vide pour éviter que le front-end ne plante avec JSON.parse
    return NextResponse.json([]);
  }
}