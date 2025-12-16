// src/app/museetarngaronne/page.tsx
import { MuseeTarnGaronne } from '../api/museetarngaronne/route';
import ClientPage from '../ClientPage';

const TARN_GARONNE_API_URL = '/api/museetarngaronne';
const DEPARTEMENT = 'Tarn-et-Garonne (82)';

/**
 * Page serveur pour les Musées et Patrimoine du Tarn-et-Garonne.
 * Cette page sert à récupérer les données avant de les passer au composant client.
 */
export default async function MuseeTarnGaronnePage() {
  let musees: MuseeTarnGaronne[] = [];
  let error: string | null = null;

  try {
    const response = await fetch(new URL(TARN_GARONNE_API_URL, process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Permet de rafraîchir les données de l'API à chaque construction (SSR/SSG)
      cache: 'no-store', 
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json() as MuseeTarnGaronne[];
    musees = data;

  } catch (err) {
    console.error(`Erreur lors de la récupération des données de ${DEPARTEMENT}:`, err);
    error = `Impossible de charger les données du ${DEPARTEMENT}. Veuillez réessayer plus tard.`;
  }

  // Le composant ClientPage gère l'affichage, la carte et les filtres.
  return (
    <ClientPage
      musees={musees}
      departement={DEPARTEMENT}
      apiError={error}
    />
  );
}
