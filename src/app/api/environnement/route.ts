import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    climat: {
      description: "Toulouse possède un climat subtropical humide (Cfa), au carrefour des influences océaniques et méditerranéennes.",
      stats: {
        ensoleillement: "2 112 h/an",
        pluie: "600 mm/an",
        temp_moyenne: "14,4 °C",
        records: { chaud: "+44 °C", froid: "-19,2 °C" }
      },
      vents: [
        { nom: "Vent d'Autan", description: "Chaud et sec, surnommé 'le vent qui rend fou'." },
        { nom: "Vent d'Ouest", description: "Apporte les pluies vitales de l'Atlantique." }
      ]
    },
    defis: [
      {
        categorie: "Espaces Verts",
        titre: "Le Grand Parc Garonne",
        description: "Reconquête de 32 km de berges. L'Île du Ramier devient le 'Central Park' toulousain d'ici 2026.",
        points: ["Biodiversité", "Mobilités douces", "Frayères"]
      },
      {
        categorie: "Urgence Climatique",
        titre: "Lutte contre l'Ilot de Chaleur",
        description: "La brique stocke la chaleur. La ville réagit par la végétalisation massive des cours d'écoles et des places.",
        points: ["Ombrières", "Fontaines", "Forêts urbaines"]
      }
    ],
    faune: ["Faucon Pèlerin (Clochers)", "Loutre d'Europe (Garonne)", "Castor (Amont)"]
  });
}
