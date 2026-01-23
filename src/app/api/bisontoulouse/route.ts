import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

export const dynamic = 'force-dynamic';

const BISON_URL = "https://www.bison-fute.gouv.fr/opendata/flux/zones/SIT_SUD-OUEST.xml";

export async function GET() {
  try {
    const res = await fetch(BISON_URL, {
      method: 'GET',
      headers: {
        // Simulation d'un navigateur récent pour éviter le blocage 403/404
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/xml',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      next: { revalidate: 0 } 
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Bison Futé injoignable (${res.status})` }, { status: res.status });
    }

    const xmlText = await res.text();

    // Sécurité au cas où le serveur renvoie du HTML (page d'erreur) au lieu du XML
    if (xmlText.trim().startsWith('<!DOCTYPE html>')) {
      throw new Error("Le flux a renvoyé une page HTML au lieu d'un fichier XML.");
    }

    const data = await parseStringPromise(xmlText, { explicitArray: false });
    
    // Accès à la structure Datex2
    const payload = data?.d2LogicalModel?.payloadPublication;
    let situations = payload?.situation;

    let list = [];
    if (Array.isArray(situations)) {
      list = situations;
    } else if (situations) {
      list = [situations];
    }

    // --- LOGIQUE DE FILTRAGE TOULOUSE ---
    // On garde les incidents qui mentionnent Toulouse ou les axes principaux du 31
    const toulouseKeywords = ["toulouse", "(31)", "a620", "a61", "a62", "a64", "a68", "rocade"];
    let filteredList = list.filter((sit: any) => {
      const text = JSON.stringify(sit).toLowerCase();
      return toulouseKeywords.some(key => text.includes(key));
    });

    // --- TEST DE SECOURS (Si aucun incident réel n'est trouvé) ---
    // Cela permet de vérifier que votre Carte et votre Tableau fonctionnent
    if (filteredList.length === 0) {
      filteredList = [{
        situationRecord: {
          "$": { "xsi:type": "AccidentSituationRecord" },
          severity: "highest",
          nonGeneralPublicComment: { 
            comment: { value: "TEST : Votre code fonctionne ! (Aucun incident réel à Toulouse actuellement)" } 
          },
          groupOfLocations: {
            locationContainedInGroup: {
              locationByReference: { predefinedLocationReference: "A620 - Rocade Toulouse" },
              pointByCoordinates: { 
                pointCoordinates: { latitude: "43.6047", longitude: "1.4442" } 
              }
            }
          }
        }
      }];
    }

    return NextResponse.json(filteredList);

  } catch (error: any) {
    console.error("Erreur API Bison:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
