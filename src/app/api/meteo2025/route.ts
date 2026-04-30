import { NextResponse } from "next/server";

export async function GET() {
  const url =
    "https://archive-api.open-meteo.com/v1/archive?latitude=43.6045&longitude=1.444&start_date=2025-01-01&end_date=2025-12-31&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=Europe/Paris";

  const res = await fetch(url);
  const data = await res.json();

  const result = data.daily.time.map((date: string, i: number) => ({
    date,
    tempMax: data.daily.temperature_2m_max[i],
    tempMin: data.daily.temperature_2m_min[i],
    pluie: data.daily.precipitation_sum[i],
    vent: data.daily.windspeed_10m_max[i],
  }));

  return NextResponse.json(result);
}
