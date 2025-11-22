// src/app/api/tourismehautegaronne/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const dataset = 'agendas-participatif-des-sorties-en-occitanie';
  const departementCode = '31';
  const apiUrl = `https://data.laregion.fr/api/records/1.0/search/?dataset=${dataset}&rows=1000&refine.departement=${departementCode}`;

  try {
    const resp = await fetch(apiUrl);
    if (!resp.ok) {
      return NextResponse.json({ error: 'Erreur API' }, { status: resp.status });
    }

    const data = await resp.json();
    const events = data.records.map((r: any) => r.fields);

    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur réseau ou JSON' }, { status: 500 });
  }
}
