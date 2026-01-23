import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

export const dynamic = 'force-dynamic';

// Nouvelle URL Tipi pour le Sud-Ouest
const BISON_URL = "https://tipi.bison-fute.gouv.fr/bison-fute-ouvert/publicationsDIR/Evenementiel-DIR/grt/RRN/SIT_SUD-OUEST.xml";

export async function GET() {
  try {
    const res = await fetch(BISON_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/xml',
      },
      next: { revalidate: 0 } 
    });

    if (!res.ok) {
      throw new Error(`Erreur serveur Bison Futé: ${res.status}`);
    }

    const xmlText = await res.text();

    // Si on reçoit du HTML au lieu du XML, c'est qu'on pointe sur un dossier, pas un fichier
    if (xmlText.includes("<!DOCTYPE html>") || xmlText.includes("<html")) {
      return NextResponse.json({ error: "L'URL pointe sur une page web, pas sur le fichier de données." }, { status: 500 });
    }

    const data = await parseStringPromise(xmlText, { explicitArray: false });
    const situations = data?.d2LogicalModel?.payloadPublication?.situation;

    let list = [];
    if (Array.isArray(situations)) list = situations;
    else if (situations) list = [situations];

    // Filtrage pour ne garder que la zone de Toulouse
    const toulouseKeywords = ["toulouse", "(31)", "a620", "a61", "a62", "a64", "a68", "rocade"];
    const filtered = list.filter((sit: any) => {
      const text = JSON.stringify(sit).toLowerCase();
      return toulouseKeywords.some(key => text.includes(key));
    });

    // TEST : Si aucun incident réel, on renvoie au moins un faux pour tester l'affichage
    if (filtered.length === 0) {
      return NextResponse.json([{
        situationRecord: {
          "$": { "xsi:type": "AccidentSituationRecord" },
          severity: "highest",
          nonGeneralPublicComment: { comment: { value: "Connexion réussie au serveur Tipi ! Aucun incident réel à Toulouse." } },
          groupOfLocations: {
            locationContainedInGroup: {
              locationByReference: { predefinedLocationReference: "Rocade Toulouse" },
              pointByCoordinates: { pointCoordinates: { latitude: "43.6047", longitude: "1.4442" } }
            }
          }
        }
      }]);
    }

    return NextResponse.json(filtered);

  } catch (error: any) {
    console.error("Erreur API:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
