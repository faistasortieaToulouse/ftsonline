// src/app/api/parcjardin/route.ts
import espacesVerts from '../../../../data/geolocalisation/espaces-verts.json';
import { NextResponse } from 'next/server';

export async function GET() {
  // Filtrer uniquement les parcs et jardins
  const filtres = espacesVerts.filter(item => item.nom && (/jardin/i.test(item.nom) || /parc/i.test(item.nom)));

  const data = filtres.map(item => ({
    id: item.id_vert,
    name: item.nom,
    adresse: item.adresse,
    lat: item.geo_point_2d.lat,
    lng: item.geo_point_2d.lon,
    type: /jardin/i.test(item.nom) ? 'Jardin' : 'Parc',
    quartier: item.quartier ?? 'N/A',
    commune: item.commune ?? 'N/A',
    territoire: item.territoire ?? 'N/A',
  }));

  return NextResponse.json({ items: data });
}
