import fs from 'fs';
import axios from 'axios';

const URL_OPEN_DATA = "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/weatherref-france-vigilance-meteo-departement/records?where=domain_id%20in%20(%2211%22%2C%2231%22)%20AND%20echeance%3D%22J%22&limit=50";

async function fetchMeteeVigilance() {
  try {
    const res = await axios.get(URL_OPEN_DATA);
    const records = res.data.results || [];

    const lignes31 = records.filter(r => r.domain_id === "31");
    const lignes11 = records.filter(r => r.domain_id === "11");

    const obtenirCouleurMax = (lignes) => {
      if (lignes.some(r => r.color === "rouge")) return "rouge";
      if (lignes.some(r => r.color === "orange")) return "orange";
      if (lignes.some(r => r.color === "jaune")) return "jaune";
      return "vert";
    };

    const extraireRisques = (lignes) => 
      lignes
        .filter(r => r.color !== "vert" && r.phenomenon)
        .map(r => r.phenomenon.charAt(0).toUpperCase() + r.phenomenon.slice(1));

    const dateAuj = new Date().toISOString().split("T")[0];
    const annee = new Date().getFullYear();

    // Emplacement du fichier d'historique dans ton projet
    const dir = './data/meteo';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const filePath = `${dir}/vigilance${annee}.json`;
    let historique = {};
    
    if (fs.existsSync(filePath)) {
      try {
        historique = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } catch (e) {
        console.log("Fichier JSON météo vide ou corrompu, réinitialisation.");
      }
    }

    // Mise à jour ou ajout de la ligne du jour
    historique[dateAuj] = {
      toulouse: { couleur: obtenirCouleurMax(lignes31), risques: extraireRisques(lignes31) },
      lezignan: { couleur: obtenirCouleurMax(lignes11), risques: extraireRisques(lignes11) }
    };

    fs.writeFileSync(filePath, JSON.stringify(historique, null, 2), "utf-8");
    console.log(`✅ Vigilance météo mise à jour pour le ${dateAuj} dans ${filePath}`);

  } catch (err) {
    console.error('❌ Erreur lors de la récupération de la vigilance météo :', err);
  }
}

fetchMeteeVigilance();
