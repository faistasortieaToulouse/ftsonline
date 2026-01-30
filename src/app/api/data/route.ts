import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";
export const maxDuration = 60; 

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

    // Appel des APIs
    const [resAgenda, resMeetup, resCinema, resJeux] = await Promise.allSettled([
      fetch(`${origin}/api/agendatoulouse`, { cache: 'no-store' }).then(r => r.json()),
      fetch(`${origin}/api/meetup-full`, { cache: 'no-store' }).then(r => r.json()),
      fetch(`${origin}/api/cinematoulouse`, { cache: 'no-store' }).then(r => r.json()),
      fetch(`${origin}/api/trictracphilibert`, { cache: 'no-store' }).then(r => r.json()),
    ]);

    // --- ANALYSE DE L'AGENDA ---
    let countAgenda = 0;
    if (resAgenda.status === 'fulfilled') {
      const d = resAgenda.value;
      // On cherche partout : dans .total, dans .events, ou si c'est directement un tableau
      countAgenda = d.total || (d.events ? d.events.length : 0) || (Array.isArray(d) ? d.length : 0);
    }

    // --- ANALYSE DE MEETUP ---
    let countMeetup = 0;
    if (resMeetup.status === 'fulfilled') {
      const d = resMeetup.value;
      // Idem : on cherche .events ou si c'est un tableau direct
      countMeetup = (d.events ? d.events.length : 0) || (Array.isArray(d) ? d.length : 0);
    }

    const countCinema = resCinema.status === 'fulfilled' ? (resCinema.value.results?.length || 0) : 0;
    const countJeux   = resJeux.status === 'fulfilled' ? (resJeux.value.count || 0) : 0;

    const totalGlobal = totalArticlesManuel + countAgenda + countMeetup + countCinema + countJeux;

    return NextResponse.json({
      totalRessourcesManuel: totalArticlesManuel,
      compteursDynamiques: {
        agenda: countAgenda,
        meetup: countMeetup,
        cinema: countCinema,
        jeux: countJeux
      },
      totalGlobal: totalGlobal
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
