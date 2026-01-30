import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Indispensable pour l'agrégation longue

export async function GET(request: NextRequest) {
  try {
    const manuel = {
      nbAgenda: 16, nbActualites: 1, nbMeetup: 6, nbToulouseEvents: 2,
      nbSpectacles: 2, nbCulture: 2, nbLibrairie: 5, nbCinema: 2,
      nbJeux: 3, nbDiscord: 1, nbFacebook: 1, nbFS: 1, nbCommunaute: 2,
      nbSport: 5, nbMusee: 13, nbVisite: 11, nbOccitanie: 15,
      nbTransport: 5, nbCafeLangue: 1, nbConsomamtion: 2, nbEmploi: 2,
      nbFlore: 1, nbEquipement: 3, nbGeographie: 5, nbHistoire: 3,
      nbMonument: 2, nbLittératureEt: 7, nbLittératureFr: 22, nbPrix: 21,
      nbArchitecture: 1, nbEurope: 5, nbFete: 1, nbFrancais: 3,
      nbHierarchie: 23, nbSaHistoire: 12, nbLangue: 1, nbMonde: 1,
      nbReligion: 3, nbTerritoire: 4
    };

    const totalArticlesManuel = Object.values(manuel).reduce((a, b) => a + (b as number), 0);
    const origin = request.nextUrl.origin;

    // Utilisation de cache: 'no-store' pour forcer la récupération des vraies données
    const fetchOptions = { 
      cache: 'no-store' as RequestCache,
      headers: { 'Accept': 'application/json' }
    };

    const [resAgenda, resMeetup, resCinema, resJeux] = await Promise.allSettled([
      fetch(`${origin}/api/agendatoulouse`, fetchOptions).then(r => r.json()),
      fetch(`${origin}/api/meetup-full`, fetchOptions).then(r => r.json()),
      fetch(`${origin}/api/cinematoulouse`, fetchOptions).then(r => r.json()),
      fetch(`${origin}/api/trictracphilibert`, fetchOptions).then(r => r.json()),
    ]);

    // --- LOGIQUE D'EXTRACTION AVEC FALLBACKS ---
    
    // Agenda : regarde .total, sinon .events.length, sinon .length
    let countAgenda = 0;
    if (resAgenda.status === 'fulfilled') {
      const val = resAgenda.value;
      countAgenda = val.total || (Array.isArray(val.events) ? val.events.length : 0) || (Array.isArray(val) ? val.length : 0);
    }

    // Meetup : regarde .events.length, sinon .length
    let countMeetup = 0;
    if (resMeetup.status === 'fulfilled') {
      const val = resMeetup.value;
      countMeetup = (Array.isArray(val.events) ? val.events.length : 0) || (Array.isArray(val) ? val.length : 0);
    }

    const countCinema = resCinema.status === 'fulfilled' ? (resCinema.value.results?.length || 0) : 0;
    const countJeux   = resJeux.status === 'fulfilled' ? (resJeux.value.count || 0) : 0;

    return NextResponse.json({
      totalRessourcesManuel: totalArticlesManuel,
      compteursDynamiques: {
        agenda: countAgenda,
        meetup: countMeetup,
        cinema: countCinema,
        jeux: countJeux
      },
      totalGlobal: totalArticlesManuel + countAgenda + countMeetup + countCinema + countJeux,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store, must-revalidate'
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de l'agrégation" }, { status: 500 });
  }
}
