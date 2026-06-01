import { NextResponse } from "next/server";

interface Mairie {
  nom: string;
  ville: string;
  url: string;
  coordonnees: {
    latitude: number;
    longitude: number;
  };
}

export async function GET() {
  try {
    // Importation dynamique : Webpack inclut le fichier JSON directement dans le bundle de l'API.
    // Plus besoin de fs, de path ou de process.cwd(). Fiabilité 100% sur Vercel.
    const mairiesModule = await import("@/../data/territoire/hoteldeville.json");
    
    // Suivant la configuration, les données sont dans .default ou directement à la racine du module
    const mairies = mairiesModule.default ? mairiesModule.default : mairiesModule;

    // Sécurité & Filtrage : On extrait et on valide les données sous forme de tableau
    const dataList = Array.isArray(mairies) ? mairies : Object.values(mairies);

    const filteredMairies = dataList.filter(
      (m: any) =>
        m?.coordonnees &&
        typeof m.coordonnees.latitude === "number" &&
        typeof m.coordonnees.longitude === "number"
    );

    // Tri par ordre alphabétique
    filteredMairies.sort((a: Mairie, b: Mairie) => {
      const nomA = a?.nom || "";
      const nomB = b?.nom || "";
      return nomA.localeCompare(nomB, "fr", { sensitivity: "base" });
    });

    return NextResponse.json(filteredMairies);
  } catch (err) {
    console.error("❌ Erreur de bundle/lecture hoteldeville.json :", err);
    return NextResponse.json(
      { error: "Impossible de charger les hôtels de ville via le bundle." },
      { status: 500 }
    );
  }
}
