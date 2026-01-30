import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Indispensable pour l'agrégation de plusieurs sources

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  // Fonction utilitaire pour fetcher sans crash
  const safeFetch = async (endpoint: string) => {
    try {
      // On utilise l'origin dynamique pour éviter les erreurs de certificats sur Vercel
      const r = await fetch(`${origin}${endpoint}`, { 
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!r.ok) {
        console.warn(`Source indisponible: ${endpoint} (Status: ${r.status})`);
        return null;
      }
      return await r.json();
    } catch (e) {
      console.error(`Erreur réseau sur ${endpoint}:`, e);
      return null;
    }
  };

  try {
    // On lance les 4 requêtes en parallèle
    const [dAgenda, dMeetup, dCinema, dJeux] = await Promise.all([
      safeFetch('/api/agendatoulousain'),
      safeFetch('/api/meetup-data'), // Utilisation de ta nouvelle route filtrée
      safeFetch('/api/cinematoulouse'),
      safeFetch('/api/trictracphilibert')
    ]);

    // Extraction robuste des compteurs
    const counts = {
      // .events.length pour l'agenda standard
      agenda: dAgenda?.events?.length || 0,
      
      // .count car ta nouvelle route /api/meetup-data renvoie directement "count: unique.size"
      meetup: dMeetup?.count || 0,
      
      // .results.length pour le format TMDB/Cinéma
      cinema: dCinema?.results?.length || 0,
      
      // .count pour TricTrac/Philibert
      jeux: dJeux?.count || 0,
      
      // Timestamp pour vérifier la fraîcheur de l'agrégation
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(counts);

  } catch (error) {
    // En cas de crash majeur de la fonction, on renvoie des zéros au lieu d'une erreur 500
    return NextResponse.json({ 
      agenda: 0, 
      meetup: 0, 
      cinema: 0, 
      jeux: 0,
      error: "Agrégation partiellement échouée" 
    });
  }
}
