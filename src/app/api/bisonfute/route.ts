import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

export async function GET() {
  try {
    const response = await fetch('https://tipi.bison-fute.gouv.fr/bison-fute-ouvert/publicationsDIR/Evenementiel-DIR/grt/RRN/content.xml', {
      cache: 'no-store'
    });

    const xmlText = await response.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
    const jsonObj = parser.parse(xmlText);

    // Extraction sécurisée de la liste des situations
    let situations = jsonObj?.d2LogicalModel?.payloadPublication?.situation;
    
    // Si une seule situation, elle n'est pas dans un tableau, on la transforme
    if (situations && !Array.isArray(situations)) {
      situations = [situations];
    }

    return NextResponse.json(situations || []);
  } catch (error) {
    console.error("Erreur API:", error);
    return NextResponse.json({ error: "Erreur de chargement" }, { status: 500 });
  }
}