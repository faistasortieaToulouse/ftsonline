import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // --- 1. TES CONSTANTES MANUELLES (Source: page.tsx) ---
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
    
    // Calcul du total des constantes
    const totalArticlesManuel = Object.values(manuel).reduce((a, b) => a + (b as number), 0);

    // --- 2. RÉCUPÉRATION DES DONNÉES DYNAMIQUES ---
    // On définit l'URL de base de ton site
    const baseUrl = 'https://ftstoulouse.vercel.app/api';

    // On lance tous les appels en même temps pour gagner du temps
    const [resAgenda, resMeetup, resCinema, resJeux] = await Promise.allSettled([
      fetch(`${baseUrl}/agendatoulouse`).then(r => r.json()),
      fetch(`${baseUrl}/meetup-full`).then(r => r.json()),
      fetch(`${baseUrl}/cinematoulouse`).then(r => r.json()),
      fetch(`${baseUrl}/trictracphilibert`).then(r => r.json()),
    ]);

    // Extraction des compteurs avec vérification des formats JSON spécifiques
    const countAgenda = resAgenda.status === 'fulfilled' ? (resAgenda.value.total || 0) : 0;
    
    const countMeetup = resMeetup.status === 'fulfilled' ? (resMeetup.value.events?.length || 0) : 0;
    
    const countCinema = resCinema.status === 'fulfilled' ? (resCinema.value.results?.length || 0) : 0;
    
    const countJeux   = resJeux.status === 'fulfilled' ? (resJeux.value.count || 0) : 0;

    // --- 3. RÉPONSE FINALE CENTRALISÉE ---
    return NextResponse.json({
      totalRessourcesManuel: totalArticlesManuel,
      compteursDynamiques: {
        agenda: countAgenda,
        meetup: countMeetup,
        cinema: countCinema,
        jeux: countJeux
      },
      // Le total global combine tout
      totalGlobal: totalArticlesManuel + countAgenda + countMeetup + countCinema + countJeux,
      details: manuel 
    }, {
      headers: {
        'Access-Control-Allow-Origin': 'https://faistasortieatoulouse31.vercel.app',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'no-store' // Évite que les navigateurs mettent les chiffres en cache
      }
    });

  } catch (error) {
    console.error("Erreur Super-Endpoint:", error);
    return NextResponse.json({ error: "Erreur lors de l'agrégation des données" }, { status: 500 });
  }
}
