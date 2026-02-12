import { NextResponse } from 'next/server';

export async function GET() {
  const LOCAL_JSON_URL = "https://raw.githubusercontent.com/faistasortieaToulouse/ftsonline/vercel-deploy/data/tisseo/velotoulouse-vls-gbfs.json";

  try {
    // 1. On récupère ton fichier de configuration
    const response = await fetch(LOCAL_JSON_URL);
    const config = await response.json();

    // 2. On cherche l'URL de "station_information" et "station_status" dans ton JSON
    // Pour simplifier ici, on va interroger directement les API GBFS temps réel de Toulouse
    const [infoRes, statusRes] = await Promise.all([
      fetch("https://api.cyclocity.fr/contracts/toulouse/gbfs/v2/station_information.json"),
      fetch("https://api.cyclocity.fr/contracts/toulouse/gbfs/v2/station_status.json")
    ]);

    const info = await infoRes.json();
    const status = await statusRes.json();

    // 3. On fusionne les données (Coordonnées + Nombre de vélos)
    const stations = info.data.stations.map((s: any) => {
      const stat = status.data.stations.find((st: any) => st.station_id === s.station_id);
      return {
        id: s.station_id,
        name: s.name,
        lat: s.lat,
        lon: s.lon,
        capacity: s.capacity,
        bikes_available: stat?.num_bikes_available || 0,
        docks_available: stat?.num_docks_available || 0,
        is_renting: stat?.is_renting === 1
      };
    });

    return NextResponse.json(stations);
  } catch (error) {
    return NextResponse.json({ error: "Erreur Velo" }, { status: 500 });
  }
}
