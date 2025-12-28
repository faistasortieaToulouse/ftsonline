// scripts/fetchWikipedia.ts
import fs from "fs";
import path from "path";
import fetch from "node-fetch"; // npm install node-fetch@2

// Chemins
const voiesPath = path.join(__dirname, "../data/mairie/nomenclature-des-voies.json");
const outputPath = path.join(__dirname, "../data/mairie/wikipedia-enrichments.json");

// Charger les voies
const voies: { id: number; libelle: string }[] = JSON.parse(fs.readFileSync(voiesPath, "utf-8"));

async function fetchWikipediaSummary(title: string): Promise<string | null> {
  try {
    // Encode le titre pour l’URL
    const url = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.extract || null;
  } catch (err) {
    console.error(`Erreur Wikipédia pour ${title}:`, err);
    return null;
  }
}

async function enrichVoies() {
  const enrichments: { id: number; wikipedia?: string | null }[] = [];

  for (const voie of voies) {
    // Titre de recherche : le nom de la rue + "Toulouse" pour être précis
    const title = `${voie.libelle} Toulouse`;
    const summary = await fetchWikipediaSummary(title);

    enrichments.push({
      id: voie.id,
      wikipedia: summary || null,
    });

    console.log(`✅ ${voie.libelle} -> ${summary ? "Résumé récupéré" : "Aucun résumé"}`);
    // Pause de 500ms pour ne pas saturer l'API
    await new Promise(r => setTimeout(r, 500));
  }

  // Écriture du fichier final
  fs.writeFileSync(outputPath, JSON.stringify(enrichments, null, 2), "utf-8");
  console.log(`📄 Fichier généré : ${outputPath}`);
}

enrichVoies();
