/**
 * scripts/enrich-wikipedia.ts
 * 
 * Usage :
 * 1. Place ce fichier dans le dossier `scripts` de ton projet.
 * 2. Lance : `ts-node scripts/enrich-wikipedia.ts` ou compile avec `tsc`.
 * 3. Le fichier `wikipedia-enrichments.json` sera créé dans `data/mairie`.
 */

import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const voiesPath = path.join(process.cwd(), "data", "mairie", "nomenclature-des-voies.json");
const wikiPath = path.join(process.cwd(), "data", "mairie", "wikipedia-enrichments.json");

interface Voie {
  id: number;
  libelle: string;
  libelle_occitan?: string | null;
  quartier: string;
  territoire: string;
  complement?: string | null;
  complement_occitan?: string | null;
  sti: number;
}

interface Enrichment {
  id: number;
  wikipedia?: string | null;
}

/**
 * Interroge l'API REST de Wikipédia pour récupérer le résumé d'un article
 */
const fetchWikipediaSummary = async (title: string): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.extract || null;
  } catch (error) {
    console.error(`Erreur Wikipédia pour "${title}":`, error);
    return null;
  }
};

/**
 * Script principal
 */
(async () => {
  if (!fs.existsSync(voiesPath)) {
    console.error("Fichier introuvable :", voiesPath);
    return;
  }

  const voies: Voie[] = JSON.parse(fs.readFileSync(voiesPath, "utf-8"));
  const enrichments: Enrichment[] = [];

  for (const voie of voies) {
    // Priorité : complément (origine du nom) > libelle de la rue
    const title = voie.complement || voie.libelle;
    console.log(`Recherche Wikipédia pour : "${title}"`);

    const summary = await fetchWikipediaSummary(title);
    enrichments.push({
      id: voie.id,
      wikipedia: summary || null,
    });

    // Attente pour éviter de spammer l'API
    await new Promise(r => setTimeout(r, 300));
  }

  fs.writeFileSync(wikiPath, JSON.stringify(enrichments, null, 2), "utf-8");
  console.log(`Fichier wikipedia-enrichments.json créé avec ${enrichments.length} entrées !`);
})();
