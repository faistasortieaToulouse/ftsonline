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

const EXTERNAL_API_BASE = 'https://ftstoulouse.vercel.app/api'; 

const DEPARTEMENTS_API_URLS = [
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
      // On ajoute des headers de base pour simuler un navigateur si besoin
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error(`Erreur ${response.status} pour ${name} à l'adresse : ${fullUrl}`);
      return [];
    }
    
    const data = await response.json();
    return data.map((item: any) => ({
      ...item,
      departement: `${name} (${code})`,
    }));
  } catch (error) {
    console.error(`Erreur de connexion pour ${name}:`, error);
    return [];
  }
}

export async function GET() {
  const fetchPromises = DEPARTEMENTS_API_URLS.map(dept => {
    let fullUrl: string;

    if (dept.isLocal) {
      // SOLUTION : En production sur Vercel, on utilise l'URL canonique directement
      // pour éviter les problèmes de "Deployment Protection" (401) des URLs de preview.
      if (process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production') {
        fullUrl = `https://ftstoulouse.vercel.app/api/${dept.endpoint}`;
      } else {
        // En local (localhost:3000 ou 9002)
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        fullUrl = `${baseUrl}/api/${dept.endpoint}`;
      }
    } else {
      fullUrl = `${EXTERNAL_API_BASE}/${dept.endpoint}`;
    }

    return fetchMuseesFromApi(fullUrl, dept.code, dept.name);
  });

  const results = await Promise.all(fetchPromises);
  const museesAgreges = results.flat();

  const sortedMusees = museesAgreges.sort((a, b) => {
    if (a.departement !== b.departement) {
      return a.departement.localeCompare(b.departement);
    }
    return a.commune.localeCompare(b.commune);
  });
  
  return NextResponse.json(sortedMusees);
}
