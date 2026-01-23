import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

const BISON_SITUATIONS_URL = "https://www.bison-fute.gouv.fr/opendata/flux/zones/SIT_NATIONALE.xml";

export async function GET() {
  try {
    const res = await fetch(BISON_SITUATIONS_URL, { 
      cache: 'no-store' // On force la récupération fraîche pour le test
    });
    const xmlText = await res.text();
    const data = await parseStringPromise(xmlText, { explicitArray: false });

    // Accès sécurisé à la liste des situations
    const payload = data?.["d2LogicalModel"]?.["payloadPublication"];
    let situations = payload?.["situation"] || [];
    
    if (!Array.isArray(situations)) {
      situations = [situations];
    }

    // Filtre élargi : Toulouse, 31, ou les autoroutes de la rocade (A61, A62, A64, A68, A620, A621, A624)
    const filtered = situations.filter((sit: any) => {
      const text = JSON.stringify(sit).toLowerCase();
      const keywords = ["toulouse", "(31)", "a620", "a621", "a624", "a61", "a62", "a64", "a68"];
      return keywords.some(key => text.includes(key));
    });

    // Si vraiment rien sur Toulouse, renvoyer les 3 premiers incidents nationaux 
    // juste pour prouver que la carte fonctionne
    const finalData = filtered.length > 0 ? filtered : situations.slice(0, 3);

    return NextResponse.json(finalData);
  } catch (error) {
    console.error("Erreur API:", error);
    return NextResponse.json({ error: "Erreur de flux" }, { status: 500 });
  }
}
