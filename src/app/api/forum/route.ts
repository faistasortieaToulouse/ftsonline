import { NextResponse } from 'next/server';

export async function GET() {
  const forumData = {
    presentation: {
      name: "Forum des Langues du Monde",
      location: "Place Arnaud-Bernard, Toulouse",
      organizer: "Carrefour Culturel Arnaud-Bernard",
      philosophy: "Le Forum traite les langues comme des objets culturels à part entière. Ici, toutes les langues se valent : il n'y a pas de 'petites' ou de 'grandes' langues.",
      founded: 1993
    },
    sections: [
      {
        title: "🌍 Le Village des Langues",
        description: "Plus de 100 langues représentées via des stands tenus par des locuteurs passionnés (du Quechua à l'Occitan, du Japonais au Wolof)."
      },
      {
        title: "🗣️ Débats & Conférences",
        description: "Des discussions sur la politique linguistique, la transmission et la diversité culturelle sans hiérarchie."
      },
      {
        title: "🎶 Animations Culturelles",
        description: "Repas de quartier, concerts, et la célèbre initiation aux danses populaires."
      }
    ],
    infos_pratiques: {
      date: "Dernier dimanche de Mai (Edition 2026 prévue)",
      access: "Métro B - Station Arnaud-Bernard / Compans-Caffarelli",
      price: "Gratuit - Ouvert à tous"
    },
    contact: {
      website: "http://www.arnaud-bernard.org",
      email: "contact@arnaud-bernard.org"
    }
  };

  return NextResponse.json(forumData);
}
