import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [infoRes, statusRes] = await Promise.all([
      fetch("https://api.cyclocity.fr/contracts/toulouse/gbfs/v2/station_information.json", { cache: 'no-store' }),
      fetch("https://api.cyclocity.fr/contracts/toulouse/gbfs/v2/station_status.json", { cache: 'no-store' })
    ]);

    const info = await infoRes.json();
    const status = await statusRes.json();

    const stations = info.data.stations.map((s: any) => {
      const stat = status.data.stations.find((st: any) => st.station_id === s.station_id);
      return {
        id: s.station_id,
        name: s.name,
        lat: s.lat,
        lon: s.lon,
        capacity: s.capacity,
        bikes_available: stat?.num_bikes_available ?? 0,
        docks_available: stat?.num_docks_available ?? 0,
        is_renting: stat?.is_renting === 1
      };
    });

    return NextResponse.json(stations);
  } catch (error) {
    return NextResponse.json({ error: "Erreur Velo" }, { status: 500 });
  }
}
