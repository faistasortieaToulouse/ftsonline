import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin || "http://localhost:3000";

  // --- COMPTEURS MANUELS ---
  const nbAgenda = 16;
  const nbActualites = 1;
  const nbMeetup = 6;
  const nbToulouseEvents = 2;
  const nbSpectacles = 2;
  const nbCulture = 2;
  const nbLibrairie = 5;
  const nbCinema = 2;
  const nbJeux = 3;
  const nbDiscord = 1;
  const nbFacebook = 1;
  const nbFS = 1;
  const nbCommunaute = 2;
  const nbSport = 5;
  const nbMusee = 13;
  const nbVisite = 11;
  const nbOccitanie = 15;
  const nbTransport = 5;
  const nbCafeLangue = 1;
  const nbConsomamtion = 2;
  const nbEmploi = 2;
  const nbFlore = 1;
  const nbEquipement = 3;
  const nbGeographie = 5;
  const nbHistoire = 3;
  const nbMonument = 2;
  const nbLittératureEt = 7;
  const nbLittératureFr = 22;
  const nbPrix = 21;
  const nbArchitecture = 1;
  const nbEurope = 5;
  const nbFete = 1;
  const nbFrancais = 3;
  const nbHierarchie = 23;
  const nbSaHistoire = 12;
  const nbLangue = 1;
  const nbMonde = 1;
  const nbReligion = 3;
  const nbTerritoire = 4;

  const totalArticles =
    nbAgenda + nbActualites + nbMeetup + nbToulouseEvents +
    nbSpectacles + nbCulture + nbLibrairie + nbCinema +
    nbJeux + nbDiscord + nbFacebook + nbFS +
    nbCommunaute + nbSport + nbMusee + nbVisite +
    nbOccitanie + nbTransport + nbCafeLangue + nbConsomamtion +
    nbEmploi + nbFlore + nbEquipement + nbGeographie +
    nbHistoire + nbMonument + nbLittératureEt + nbLittératureFr +
    nbPrix + nbArchitecture + nbEurope + nbFete +
    nbFrancais + nbHierarchie + nbSaHistoire + nbLangue +
    nbMonde + nbReligion + nbTerritoire;

  try {
    // 1. Définition des appels vers vos sous-agrégateurs
    // Note : On utilise les routes directes pour les meetups pour éviter l'auto-appel récursif
    const endpoints = [
      { id: 'meetup_events', url: `${BASE_URL}/api/meetup-events` },
      { id: 'meetup_expats', url: `${BASE_URL}/api/meetup-expats` },
      { id: 'meetup_coloc', url: `${BASE_URL}/api/meetup-coloc` },
      { id: 'meetup_sorties', url: `${BASE_URL}/api/meetup-sorties` },
      { id: 'cinema', url: `${BASE_URL}/api/cinematoulouse` },
      { id: 'agenda', url: `${BASE_URL}/api/agendatoulousain` },
      { id: 'jeux', url: `${BASE_URL}/api/trictracphilibert` }
    ];

    // 2. Exécution parallèle
    const results = await Promise.all(
      endpoints.map(async (endpoint) => {
        try {
          const res = await fetch(endpoint.url, { next: { revalidate: 3600 } });
          if (!res.ok) return { id: endpoint.id, count: 0 };
          const data = await res.json();
          
          let count = 0;
          if (endpoint.id === 'cinema') count = data.results?.length || 0;
          else if (endpoint.id === 'agenda') count = data.total || data.count || 0;
          else if (endpoint.id === 'jeux') count = data.count || 0;
          else {
             // Pour les routes meetup
             count = Array.isArray(data.events) ? data.events.length : (Array.isArray(data) ? data.length : 0);
          }

          return { id: endpoint.id, count };
        } catch (err) {
          return { id: endpoint.id, count: 0 };
        }
      })
    );

    // 3. Calculs totaux dynamiques
    const meetupCount = results.filter(r => r.id.startsWith('meetup')).reduce((acc, curr) => acc + curr.count, 0);
    const cinemaCount = results.find(r => r.id === 'cinema')?.count || 0;
    const agendaCount = results.find(r => r.id === 'agenda')?.count || 0;
    const jeuxCount = results.find(r => r.id === 'jeux')?.count || 0;

    const totalLive = meetupCount + cinemaCount + agendaCount + jeuxCount;

    return NextResponse.json({
      totalLive: totalLive,
      totalArticles: totalArticles, // Votre chiffre manuel
      detailsLive: {
        meetup: meetupCount,
        cinema: cinemaCount,
        agenda: agendaCount,
        jeux: jeuxCount
      },
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    return NextResponse.json({ totalLive: 0, totalArticles: totalArticles, error: "Erreur globale" }, { status: 500 });
  }
}