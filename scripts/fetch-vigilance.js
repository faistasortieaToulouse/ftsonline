import fs from 'fs';
import axios from 'axios';

const URL_OPEN_DATA = "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/weatherref-france-vigilance-meteo-departement/records?where=domain_id%20in%20(%2211%22%2C%2231%22)%20AND%20echeance%3D%22J%22&limit=50";

async function fetchMeteeVigilance() {
  try {
    console.log("⏳ Récupération des données de vigilance météo...");
    const res = await axios.get(URL_OPEN_DATA);
    const records = res.data.results || [];

    // Séparation par département
    const lignes31 = records.filter(r => r.domain_id === "31");
    const lignes11 = records.filter(r => r.domain_id === "11");

    // Détermination de la couleur maximale
    const obtenerCouleurMax = (lignes) => {
      if (lignes.some(r => r.color === "rouge")) return "rouge";
      if (lignes.some(r => r.color === "orange")) return "orange";
      if (lignes.some(r => r.color === "jaune")) return "jaune";
      return "vert";
    };

    // Extraction des risques (sans le vert)
    const extraireRisques = (lignes) => 
      lignes
        .filter(r => r.color !== "vert" && r.phenomenon)
        .map(r => r.phenomenon.charAt(0).toUpperCase() + r.phenomenon.slice(1));

    const dateAuj = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD
    const annee = new Date().getFullYear(); // Format YYYY (Ex: 2026)

    // Configuration des dossiers (Création automatique si manquants)
    const dir = './data/meteo';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const filePath = `${dir}/vigilance${annee}.json`;
    let historique = {};
    
    // Si le fichier existe déjà, on le lit pour ne pas écraser les jours précédents
    if (fs.existsSync(filePath)) {
      try {
        const contenu = fs.readFileSync(filePath, "utf-8");
        if (contenu.trim()) {
          historique = JSON.parse(contenu);
        }
      } catch (e) {
        console.log("⚠️ Fichier JSON météo vide ou corrompu, réinitialisation.");
      }
    }

    // On ajoute ou met à jour les données du jour actuel
    historique[dateAuj] = {
      toulouse: { 
        couleur: obtenerCouleurMax(lignes31), 
        risques: extraireRisques(lignes31) 
      },
      lezignan: { 
        couleur: obtenerCouleurMax(lignes11), 
        risques: extraireRisques(lignes11) 
      }
    };

    // Écriture du fichier mis à jour
    fs.writeFileSync(filePath, JSON.stringify(historique, null, 2), "utf-8");
    console.log(`✅ Vigilance météo mise à jour avec succès pour le ${dateAuj} dans ${filePath}`);

  } catch (err) {
    console.error('❌ Erreur lors de la récupération de la vigilance météo :', err.message);
  }
}

fetchMeteeVigilance();
