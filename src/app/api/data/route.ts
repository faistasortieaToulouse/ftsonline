import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // --- 1. VOS CONSTANTES MANUELLES (issues de ftsonline/src/app/page.tsx) ---
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
    const totalArticles = Object.values(manuel).reduce((a, b) => a + (b as number), 0);

    // --- 2. RÉCUPÉRATION DES DONNÉES DYNAMIQUES ---
    // Note : Remplacez les URLs par vos sources réelles (ex: OpenData, flux RSS, etc.)
    
    // Pour l'Agenda
    const resAgenda = await fetch('URL_SOURCE_AGENDA');
    const dataAgenda = await resAgenda.json();
    const countAgenda = dataAgenda.length;

    // Pour Meetup
    const resMeetup = await fetch('URL_SOURCE_MEETUP');
    const dataMeetup = await resMeetup.json();
    const countMeetup = dataMeetup.length;

    // Pour Cinéma
    const resCinema = await fetch('URL_SOURCE_CINEMA');
    const dataCinema = await resCinema.json();
    const countCinema = dataCinema.length;

    // Pour TricTrac / Jeux
    const resJeux = await fetch('URL_SOURCE_JEUX');
    const dataJeux = await resJeux.json();
    const countJeux = dataJeux.length;

    // --- 3. RÉPONSE FINALE CENTRALISÉE ---
    return NextResponse.json({
      totalRessources: totalArticles,
      agenda: countAgenda,
      meetup: countMeetup,
      cinema: countCinema,
      jeux: countJeux,
      details: manuel // Optionnel : si vous voulez les détails
    }, {
      headers: {
        'Access-Control-Allow-Origin': 'https://faistasortieatoulouse31.vercel.app',
        'Access-Control-Allow-Methods': 'GET',
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
