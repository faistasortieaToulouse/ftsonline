import { NextResponse } from "next/server";


const proprietaires = [
{ num: "1, 3, 5, 7", type_voie: "rue", nom_voie: "Renforts", proprietaire: "Jean Vézian", date: "1472", supplement: "Maison de l'Inquisition", profession: "capitoul" },
{ num: "1, 3", type_voie: "rue", nom_voie: "Renforts", proprietaire: "Jacques Alary", date: "1543", supplement: "", profession: "capitoul" },
{ num: "1, 3", type_voie: "rue", nom_voie: "Renforts", proprietaire: "Berande Maigne", date: "1634", supplement: "", profession: "propriétaire" },
{ num: "1, 3", type_voie: "rue", nom_voie: "Renforts", proprietaire: "Auguste de Chalvet", date: "1722", supplement: "Sénéchal", profession: "conseiller" },
{ num: "1, 3", type_voie: "rue", nom_voie: "Renforts", proprietaire: "Jean-François de Pujos", date: "1762", supplement: "Parlement", profession: "conseiller" },
{ num: "5", type_voie: "rue", nom_voie: "Renforts", proprietaire: "Antoine Durand", date: "1645", supplement: "hôtel de ville", profession: "peintre" },
{ num: "5", type_voie: "rue", nom_voie: "Renforts", proprietaire: "Hilaire Pades", date: "1661", supplement: "", profession: "peintre" },
{ num: "5", type_voie: "rue", nom_voie: "Renforts", proprietaire: "Guillaume de Cambolas", date: "1510", supplement: "Parlement", profession: "procureur" },
{ num: "5", type_voie: "rue", nom_voie: "Renforts", proprietaire: "Jacques de Cambolas", date: "1571", supplement: "Sénéchal", profession: "conseiller" }
];


export async function GET() {
return NextResponse.json(proprietaires);
}
