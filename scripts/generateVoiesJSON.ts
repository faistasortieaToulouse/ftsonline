// scripts/generateVoiesJSON.ts
import fs from "fs";
import path from "path";

// Chemin vers ton fichier source
const inputPath = path.join(__dirname, "../data/mairie/nomenclature-des-voies-libelles-officiels-et-en-occitan.json");
// Chemin vers le fichier de sortie
const outputPath = path.join(__dirname, "../data/mairie/nomenclature-des-voies.json");

// Charge le fichier original
const voiesRaw = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

// Transforme les données
const voiesFormatted = voiesRaw.map((v: any, index: number) => ({
  id: v.sti || index, // STI si disponible sinon index
  libelle: v.libelle,
  libelle_occitan: v.libelle_occitan || null,
  quartier: v.quartier || "",
  territoire: v.territoire || "",
  complement: v.complement || null,
  complement_occitan: v.complement_occitan || null,
  sti: v.sti || -1
}));

// Écrit le fichier JSON final
fs.writeFileSync(outputPath, JSON.stringify(voiesFormatted, null, 2), "utf-8");

console.log(`✅ Fichier généré : ${outputPath}`);
