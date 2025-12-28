import fs from "fs";
import path from "path";
import fetch from "node-fetch"; // Node 18+ fetch est natif

// ===== Chemins des fichiers =====
const voiesFile = path.join(
  process.cwd(),
  "data",
  "mairie",
  "nomenclature-des-voies-libelles-officiels-et-en-occitan.json"
);
const outputFile = path.join(
  process.cwd(),
  "data",
  "mairie",
  "wikipedia-enrichments.json"
);

// Charge les voies
const rawVoies = JSON.parse(fs.readFileSync(voiesFile, "utf-8"));

// ===== Utilitaires =====
function normalizeTitle(libelle) {
  // Supprime les préfixes RUE, ALL, PL, PROM...
  return libelle.replace(/^(RUE|ALL|PL|PROM|CHEM|PRV|ESPA|RPT)\s+/i, "").trim();
}

// ===== Requête Wikipédia =====
async function fetchWikipediaSummary(title) {
  try {
    // Première tentative : page exacte
    let url = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    let res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return data.extract ?? null;
    }

    // Si page exacte non trouvée, chercher via l'API de recherche
    url = `https://fr.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(title)}&utf8=&format=json`;
    res = await fetch(url);
    if (!res.ok) return null;
    const searchData = await res.json();
    const first = searchData.query?.search?.[0]?.title;
    if (!first) return null;

    // Récupérer le résumé de la page trouvée
    url = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(first)}`;
    res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.extract ?? null;

  } catch (err) {
    console.error(`Erreur pour "${title}":`, err);
    return null;
  }
}

// ===== Script principal =====
async function main() {
  const enrichments = [];

  for (let i = 0; i < rawVoies.length; i++) {
    const voie = rawVoies[i];
    const title = normalizeTitle(voie.libelle);

    console.log(`(${i + 1}/${rawVoies.length}) Recherche Wikipédia pour: "${title}"`);
    const summary = await fetchWikipediaSummary(title);
    enrichments.push({ id: i, wikipedia: summary });

    // Petite pause pour ne pas saturer l'API
    await new Promise((res) => setTimeout(res, 200));
  }

  fs.writeFileSync(outputFile, JSON.stringify(enrichments, null, 2), "utf-8");
  console.log("Fichier wikipedia-enrichments.json généré !");
}

main().catch(console.error);
