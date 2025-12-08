import { NextRequest, NextResponse } from "next/server";

/**
 * Interface pour représenter un lieu commercial à afficher sur la carte.
 * Les champs correspondent aux données que vous avez fournies.
 */
interface CommercePlace {
  nomLieu: string;
  num: string; // Numéro de la rue
  typeRue: string; // "rue", "place", "quai", etc.
  nomRue: string; // Nom de la voie
  quartier: string;
  établissement: string; // Type de commerce/lieu
  commentaire: string; // Commentaire/Description (e.g., "ancien", "persan", "Galerie")
}

export async function GET(req: NextRequest) {
  const data: CommercePlace[] = [
    { nomLieu: "Restaurant Shalizar", num: "100", typeRue: "rue", nomRue: "Achille Viadieu", quartier: "Saint-Michel", établissement: "restaurant", commentaire: "persan" },
    { nomLieu: "Le Rendez-vous", num: "11", typeRue: "rue", nomRue: "Agathoise", quartier: "Matabiau", établissement: "restaurant", commentaire: "français" },
    { nomLieu: "Café Brûlé", num: "12", typeRue: "rue", nomRue: "Alex. Fourtanier", quartier: "St-Georges", établissement: "restaurant", commentaire: "végétalien" },
    { nomLieu: "L'Atelier", num: "22", typeRue: "rue", nomRue: "Alexandre Falguière", quartier: "Decathlon", établissement: "Galerie", commentaire: "" },
    { nomLieu: "temple Kadampa Vajravarahi", num: "6", typeRue: "rue", nomRue: "Alexandre Fourtanier", quartier: "St-Georges", établissement: "institut", commentaire: "" },
    { nomLieu: "Au petit Duc", num: "8", typeRue: "rue", nomRue: "Alexandre Fourtanier", quartier: "St-Georges", établissement: "café, pub", commentaire: "ancien" },
    { nomLieu: "maison de Charité", num: "15", typeRue: "rue", nomRue: "Alexandre Fourtanier", quartier: "St-Georges", établissement: "charité", commentaire: "ancien" },
    { nomLieu: "Kodratoff Milena", num: "18", typeRue: "rue", nomRue: "Alexandre Fourtanier", quartier: "St-Georges", établissement: "disquaire", commentaire: "" },
    { nomLieu: "Tout pour le Jazz", num: "22", typeRue: "rue", nomRue: "Alexandre Fourtanier", quartier: "St-Georges", établissement: "café, pub", commentaire: "ancien" },
    { nomLieu: "café de la Renaissance", num: "14", typeRue: "rue", nomRue: "Alfred Duméril", quartier: "Plantes", établissement: "café, pub", commentaire: "ancien" },
    { nomLieu: "Bijou bar", num: "59", typeRue: "rue", nomRue: "Alfred Duméril", quartier: "Plantes", établissement: "café, pub", commentaire: "ancien" },
    { nomLieu: "photographie Rigaud", num: "0", typeRue: "rue", nomRue: "Alsace Lorraine", quartier: "Capitole", établissement: "photographie", commentaire: "ancien" },
    { nomLieu: "grand hôtel de la Poste", num: "8", typeRue: "rue", nomRue: "Alsace Lorraine", quartier: "Capitole", établissement: "hôtel", commentaire: "ancien" },
  ];

  return NextResponse.json(data);
}
