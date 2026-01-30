import { NextRequest, NextResponse } from 'next/server';

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

    // DETERMINATION DE L'URL DE BASE DYNAMIQUE
    // On utilise l'origine de la requête entrante pour éviter les erreurs de domaine
    const origin = request.nextUrl.origin;

    const [resAgenda, resMeetup, resCinema, resJeux] = await Promise.allSettled([
      fetch(`${origin}/api/agendatoulouse`).then(r => r.json()),
      fetch(`${origin}/api/meetup-full`).then(r => r.json()),
      fetch(`${origin}/api/cinematoulouse`).then(r => r.json()),
      fetch(`${origin}/api/trictracphilibert`).then(r => r.json()),
    ]);

    // LOGS DE DEBUG (visibles dans les logs Vercel)
    if (resAgenda.status === 'rejected') console.error("Agenda Fail:", resAgenda.reason);
    if (resMeetup.status === 'rejected') console.error("Meetup Fail:", resMeetup.reason);

    // EXTRACTION CORRIGÉE
    // Pour l'agenda, on vérifie si .total existe, sinon on compte le tableau .events
    const countAgenda = resAgenda.status === 'fulfilled' 
      ? (resAgenda.value.total || resAgenda.value.events?.length || 0) 
      : 0;
    
    // Pour Meetup
    const countMeetup = resMeetup.status === 'fulfilled' 
      ? (resMeetup.value.events?.length || resMeetup.value.length || 0) 
      : 0;
    
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
        'Access-Control-Allow-Origin': '*', // Plus simple pour le debug
        'Cache-Control': 'no-store, max-age=0'
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
