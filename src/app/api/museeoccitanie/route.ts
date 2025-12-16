// src/app/api/museeoccitanie/route.ts
import { NextResponse } from 'next/server';

export interface MuseeOccitanie {
  commune: string;
  nom: string;
  categorie: string;
  adresse: string;
  url: string;
  lat: number;
  lng: number;
  departement: string; 
}

// URL de base de l'agrégation externe
const EXTERNAL_API_BASE = 'https://ftstoulouse.vercel.app/api'; 

// Liste des départements, triée par Nom du département (ordre alphabétique)
const DEPARTEMENTS_API_URLS: { code: string; name: string; isLocal: boolean; endpoint: string }[] = [
    { code: '09', name: 'Ariège', isLocal: false, endpoint: 'museeariege' },
    { code: '11', name: 'Aude', isLocal: false, endpoint: 'museeaude' },
    { code: '12', name: 'Aveyron', isLocal: false, endpoint: 'museeaveyron' },
    { code: '32', name: 'Gers', isLocal: false, endpoint: 'museegers' },
    { code: '31', name: 'Haute-Garonne', isLocal: false, endpoint: 'museehg' },
    { code: '65', name: 'Hautes-Pyrénées', isLocal: false, endpoint: 'museehp' },
    { code: '34', name: 'Hérault', isLocal: false, endpoint: 'museeherault' },
    { code: '46', name: 'Lot', isLocal: false, endpoint: 'museelot' }, 
    { code: '66', name: 'Pyrénées-Orientales', isLocal: false, endpoint: 'museepo' },
    { code: '81', name: 'Tarn', isLocal: false, endpoint: 'museetarn' },
    { code: '82', name: 'Tarn-et-Garonne', isLocal: true, endpoint: 'museetarngaronne' }, 
];

async function fetchMuseesFromApi(fullUrl: string, code: string, name: string): Promise<MuseeOccitanie[]> {
  try {
    const response = await fetch(fullUrl, {
      cache: 'no-store', 
    });

    if (!response.ok) {
      console.error(`Erreur HTTP lors de la récupération des données pour le ${name} (${code}) depuis ${fullUrl}: ${response.status}`);
      return [];
    }
    
    const data = await response.json() as Omit<MuseeOccitanie, 'departement'>[];

    // Le format du département est maintenant sans le gras, selon la demande.
    return data.map(item => ({
      ...item,
      departement: `${name} (${code})`,
    }));
  } catch (error) {
    console.error(`Erreur de connexion pour le ${name} (${code}) à l'URL ${fullUrl}:`, error);
    return [];
  }
}

export async function GET() {
  const fetchPromises = DEPARTEMENTS_API_URLS
    .map(dept => {
        let fullUrl: string;

        if (dept.isLocal) {
            // Logique pour l'URL de base locale (localhost ou Vercel)
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            fullUrl = `${baseUrl}/api/${dept.endpoint}`;
        } else {
            // Logique pour l'URL de base externe
            fullUrl = `${EXTERNAL_API_BASE}/${dept.endpoint}`;
        }

        return fetchMuseesFromApi(fullUrl, dept.code, dept.name);
    });

  const results = await Promise.all(fetchPromises);
  
  const museesAgreges = results.flat();

  // Tri final par département, puis par commune
  const sortedMusees = museesAgreges.sort((a, b) => {
    if (a.departement !== b.departement) {
      return a.departement.localeCompare(b.departement);
    }
    return a.commune.localeCompare(b.commune);
  });
  
  return NextResponse.json(sortedMusees);
}
