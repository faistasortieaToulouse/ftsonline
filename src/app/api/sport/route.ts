import equipements from '../../../../data/geolocalisation/equipements-sportifs.json';
import { NextResponse } from 'next/server';

export async function GET() {
  const data = equipements.map((item: any) => ({
    id: item.oid,
    name: item.nom_equipement,
    installation: item.nom_installation,
    famille: item.famille_equipement,
    type: item.type_equipement,
    adresse: item.adresse,
    lat: item.geo_point_2d.lat,
    lng: item.geo_point_2d.lon,
  }));

  return NextResponse.json({ items: data });
}
