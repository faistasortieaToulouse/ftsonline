import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '43.6047'); // Toulouse par défaut
  const month = parseInt(searchParams.get('month') || new Date().getMonth().toString());

  const hemisphere = lat >= 0 ? 'Nord' : 'Sud';

  // Base de données simplifiée (données astronomiques standards)
  const constellationsData = [
    { name: "Grande Ourse", bestMonth: [3, 4, 5], hemisphere: "Nord" },
    { name: "Orion", bestMonth: [11, 12, 0, 1], hemisphere: "Both" },
    { name: "Croix du Sud", bestMonth: [3, 4, 5], hemisphere: "Sud" },
    { name: "Cassiopée", bestMonth: [8, 9, 10], hemisphere: "Nord" },
    { name: "Scorpion", bestMonth: [5, 6, 7], hemisphere: "Both" },
  ];

  const visible = constellationsData.filter(c => 
    (c.hemisphere === hemisphere || c.hemisphere === "Both") && 
    c.bestMonth.includes(month)
  );

  return NextResponse.json({
    hemisphere,
    month: month + 1,
    constellations: visible
  });
}
