import { NextResponse } from "next/server";

export async function GET() {
  try {
    const hydroData = [
      // --- FLEUVES ET RIVIÈRES ---
      { nom: "Fleuve la Garonne", categorie: "Fleuve", zone: "Toulouse", lat: 43.597689, lng: 1.438931, desc: "Traverse le centre historique" },
      { nom: "Fleuve l'Ariège", categorie: "Fleuve", zone: "Portet-sur-Garonne (banlieue)", lat: 43.514111, lng: 1.408612, desc: "Confluence avec la Garonne" },
      { nom: "Rivière de l'Hers-Mort", categorie: "Rivière", zone: "Toulouse Est", lat: 43.600733, lng: 1.490424, desc: "Longe la rocade Est" },
      { nom: "Rivière du Touch", categorie: "Rivière", zone: "Blagnac/Toulouse", lat: 43.607615, lng: 1.385626, desc: "Confluence Garonne (Sept Deniers)" },

      // --- RUISSEAUX PRINCIPAUX ---
      { nom: "Ruisseau de la Marcaissonne", categorie: "Ruisseau", zone: "Toulouse - Montaudran", lat: 43.572375, lng: 1.502628, desc: "Affluent de l'Hers-Mort" },
      { nom: "Ruisseau de la Négogousses", categorie: "Ruisseau", zone: "Toulouse - Saint-Agne", lat: 43.574362, lng: 1.451607, desc: "Ruisseau urbain" },
      { nom: "Ruisseau de la Saudrune", categorie: "Ruisseau", zone: "Toulouse - Thibault", lat: 43.548045, lng: 1.431067, desc: "Sud-Ouest de Toulouse" },
      { nom: "Ruisseau de la Saudrunelle", categorie: "Ruisseau", zone: "Toulouse - Thibault", lat: 43.538839, lng: 1.423396, desc: "Petit affluent Saudrune" },
      { nom: "Ruisseau de la Saune", categorie: "Ruisseau", zone: "Toulouse/Quint-Fonsegrives", lat: 43.579046, lng: 1.506085, desc: "Se jette dans l'Hers" },
      { nom: "Ruisseau de la Sausse", categorie: "Ruisseau", zone: "Toulouse/L'Union", lat: 43.643656, lng: 1.479648, desc: "Traverse le nord-est" },
      { nom: "Ruisseau de la Seillonne", categorie: "Ruisseau", zone: "Toulouse/Balma", lat: 43.644359, lng: 1.5201079, desc: "Affluent rive droite" },
      { nom: "Ruisseau de l'Arbus", categorie: "Ruisseau", zone: "Blagnac (banlieue)", lat: 43.622928, lng: 1.380322, desc: "Coteaux sud" },
      { nom: "Ruisseau de la Planho", categorie: "Ruisseau", zone: "Vieille-Toulouse (banlieue)", lat: 43.535698, lng: 1.436403, desc: "Descente des coteaux" },
      { nom: "Ruisseau de Maltemps", categorie: "Ruisseau", zone: "Toulouse - Sesquières", lat: 43.653727, lng: 1.409635, desc: "Nord de Toulouse" },
      { nom: "Ruisseau de Chaussas", categorie: "Ruisseau", zone: "Toulouse - Sesquières", lat: 43.65651, lng: 1.408354, desc: "Nord de Toulouse" },
      { nom: "Ruisseau de la Négogousses de Saint-Cyprien", categorie: "Ruisseau", zone: "Toulouse - Arènes", lat: 43.593012, lng: 1.410084, desc: "Ruisseau urbain" },

      // --- PETITS RUISSEAUX URBAINS ---
      { nom: "Ruisseau école de Purpan", categorie: "Ruisseau", zone: "Toulouse - Purpan", lat: 43.600617, lng: 1.393926, desc: "Proche hôpital" },
      { nom: "Ruisseau de la Barigoude", categorie: "Ruisseau", zone: "Toulouse - Saint-Martin", lat: 43.586585, lng: 1.369787, desc: "Affluent du Touch" },
      { nom: "Ruisseau de Thibaud", categorie: "Ruisseau", zone: "Toulouse - Zone Thibaud", lat: 43.546596, lng: 1.422848, desc: "Zone industrielle" },
      { nom: "Ruisseau de Michoun", categorie: "Ruisseau", zone: "Toulouse - Michoun", lat: 43.627508, lng: 1.469659, desc: "Quartier Amouroux" },
      { nom: "Ruisseau de Sente Berduret", categorie: "Ruisseau", zone: "Toulouse - Crois-Daurade", lat: 43.5636381, lng: 1.461190, desc: "Coteaux sud-est" },
      { nom: "Ruisseau de Sente", categorie: "Ruisseau", zone: "Toulouse - Borderouge", lat: 46.641620, lng: 1.456219, desc: "Descente vers Garonne" },
      { nom: "Fosset de Larramet", categorie: "Ruisseau", zone: "Toulouse - Larramet", lat: 43.574778, lng: 1.366527, desc: "Descente vers Garonne" },
      { nom: "Foset Mère", categorie: "Ruisseau", zone: "Toulouse - Larramet", lat: 43.571144, lng: 1.370176, desc: "Descente vers Garonne" },

      // --- CANAUX ---
      { nom: "Canal du Midi", categorie: "Canal", zone: "Toulouse - Centre-ville", lat: 43.611350, lng: 1.420765, desc: "Patrimoine mondial UNESCO" },
      { nom: "Canal du Bazacle", categorie: "Canal", zone: "Toulouse - Bazacle", lat: 43.608189, lng: 1.415351, desc: "Canal usinier" },
      { nom: "Canal de Brienne", categorie: "Canal", zone: "Toulouse - Amidonniers", lat: 43.609912, lng: 1.420718, desc: "Relie la Garonne au Canal" },
      { nom: "Canal de Garonne", categorie: "Canal", zone: "Toulouse - Pont-Jumeaux", lat: 43.612285, lng: 1.418387, desc: "Prolongement du Canal du Midi" },
      { nom: "Canal de Saint-Martory", categorie: "Canal", zone: "Toulouse - Larramet", lat: 43.575386, lng: 1.365410, desc: "Canal d'irrigation" },
    ];

    const dataWithId = hydroData.map((item, index) => ({
      id: index + 1,
      ...item
    }));

    return NextResponse.json(dataWithId);
  } catch (error) {
    return NextResponse.json({ error: "Impossible de charger les données hydrographiques" }, { status: 500 });
  }
}