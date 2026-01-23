import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

const BISON_URL = "https://www.bison-fute.gouv.fr/opendata/flux/zones/SIT_SUD-OUEST.xml";

export async function GET() {
  try {
    const res = await fetch(BISON_URL, { 
      method: 'GET',
      headers: {
        // On simule un vrai navigateur pour ne pas être bloqué
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/xml',
        'Cache-Control': 'no-cache'
      },
      next: { revalidate: 0 } // Pas de cache Next.js pour le test
    });

    if (!res.ok) {
        return NextResponse.json({ error: `Bison Futé refuse l'accès (${res.status})` }, { status: res.status });
    }

    const xmlText = await res.text();
    
    // Si le XML est vide ou contient une erreur HTML
    if (xmlText.includes('<!DOCTYPE html>')) {
        return NextResponse.json({ error: "Le site Bison Futé a renvoyé une page d'erreur au lieu du XML" }, { status: 500 });
    }

    const data = await parseStringPromise(xmlText, { explicitArray: false });
    const situations = data?.d2LogicalModel?.payloadPublication?.situation;
    
    let list = [];
    if (Array.isArray(situations)) list = situations;
    else if (situations) list = [situations];

    // --- TEST DE SECOURS ---
    // Si la liste est vide (pas d'accidents aujourd'hui), on crée un faux incident
    // juste pour vérifier que ta CARTE et ton TABLEAU fonctionnent.
    if (list.length === 0) {
      list = [{
        situationRecord: {
          "$": { "xsi:type": "AccidentSituationRecord" },
          severity: "highest",
          nonGeneralPublicComment: { comment: { value: "TEST : Si vous voyez ce message, votre code fonctionne ! (Aucun incident réel à Toulouse)" } },
          groupOfLocations: {
            locationContainedInGroup: {
              locationByReference: { predefinedLocationReference: "A620 - Rocade Ouest" },
              pointByCoordinates: { pointCoordinates: { latitude: "43.6047", longitude: "1.4442" } }
            }
          }
        }
      }];
    }

    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
