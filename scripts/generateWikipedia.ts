import fs from "fs";
import path from "path";
import fetch from "node-fetch"; // si Node 18+ fetch est natif

// Chemin vers le fichier source des voies
const voiesFile = path.join(process.cwd(), "data", "mairie", "nomenclature-des-voies-libelles-officiels-et-en-occitan.json");
// Chemin de sortie pour les enrichissements Wikipedia
const outputFile = path.join(process.cwd(), "data", "mairie", "wikipedia-enrichments.json");

// Charge les voies
const rawVoies = JSON.parse(fs.readFileSync(voiesFile, "utf-8"));

interface WikipediaEnrichment {
  id: number;
  wikipedia?: string | null;
}

// Fonction pour récupérer le résumé Wikipédia d’un titre
async function fetchWikipediaSummary(title: string): Promise<string | null> {
  try {
    const url = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.extract ?? null;
  } catch (err) {
    console.error(`Erreur pour ${title}:`, err);
    return null;
  }
}

async function main() {
  const enrichments: WikipediaEnrichment[] = [];

  for (let i = 0; i < rawVoies.length; i++) {
    const voie = rawVoies[i];
    const title = voie.libelle; // ou une variante plus pertinente pour Wikipédia
    console.log(`Récupération Wikipédia pour ${title} (${i + 1}/${rawVoies.length})`);

    const summary = await fetchWikipediaSummary(title);
    enrichments.push({ id: i, wikipedia: summary });

    // Petite pause pour éviter de saturer l’API
    await new Promise(res => setTimeout(res, 200));
  }

  fs.writeFileSync(outputFile, JSON.stringify(enrichments, null, 2), "utf-8");
  console.log("Fichier wikipedia-enrichments.json généré !");
}

main().catch(console.error);
