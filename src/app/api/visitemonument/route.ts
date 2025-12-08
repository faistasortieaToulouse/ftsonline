// src/app/api/visitemonument/route.ts
import { NextResponse } from 'next/server';

// Hardcoded data
const data = [
  { nom: 'Bordeblanche', numero: 0, voie: 'quartier', rue: 'Bordeblanche', type: 'borde', note: 'verif' },
  { nom: 'Bordelongue', numero: 0, voie: 'quartier', rue: 'Bordelongue', type: 'borde', note: 'verif' },
  { nom: 'Borderouge', numero: 0, voie: 'quartier', rue: 'Borderouge', type: 'borde', note: '' },
  { nom: 'caserne Compans et Cafarelli', numero: '', voie: 'esp', rue: 'Compans', type: 'caserne', note: '' },
  { nom: 'caserne Dupuy', numero: 32, voie: 'rue', rue: 'Dalbade', type: 'caserne', note: '' },
  { nom: 'caserne de la Mission', numero: 17, voie: 'place', rue: 'Daurade', type: 'caserne', note: '' },
  { nom: 'caserne Saint-Charles', numero: 8, voie: 'rue', rue: 'Merly', type: 'caserne', note: '' },
  { nom: 'palais Niel', numero: '', voie: 'rue', rue: 'Montoulieu St-Jqes', type: 'caserne', note: '' },
  { nom: 'caserne Pérignon', numero: 2, voie: 'rue', rue: 'Pérignon', type: 'caserne', note: '' },
  { nom: 'monument aux morts', numero: 2, voie: 'rue', rue: 'Pérignon', type: 'caserne', note: 'Pérignon' },
  { nom: 'caserne Lignières', numero: 24, voie: 'rue', rue: 'Riquet', type: 'caserne', note: '' },
  { nom: 'caserne Niel', numero: 81, voie: 'rue', rue: 'Saint-Roch', type: 'caserne', note: '' },
  { nom: 'caserne Robert', numero: 1, voie: 'rue', rue: 'Salenques', type: 'caserne', note: '' },
  { nom: "ancienne caserne Carmélites", numero: 56, voie: 'rue', rue: 'Taur', type: 'caserne', note: '' },
  { nom: 'Croix-Daurade', numero: 147, voie: 'rte', rue: 'Albi', type: 'château', note: 'mairie' },
  { nom: 'Ozenne', numero: 147, voie: 'rte', rue: 'Albi', type: 'château', note: 'mairie' }
];

export async function GET() {
  return NextResponse.json(data);
}


// src/app/visitemonument/page.tsx
import React from 'react';

export default async function Page() {
  const res = await fetch('http://localhost:3000/api/visitemonument', {
    cache: 'no-store'
  });
  const items = await res.json();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Liste des monuments</h1>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Nom</th>
            <th className="border p-2">N°</th>
            <th className="border p-2">Voie</th>
            <th className="border p-2">Rue</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Note</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, idx: number) => (
            <tr key={idx}>
              <td className="border p-2">{item.nom}</td>
              <td className="border p-2">{item.numero}</td>
              <td className="border p-2">{item.voie}</td>
              <td className="border p-2">{item.rue}</td>
              <td className="border p-2">{item.type}</td>
              <td className="border p-2">{item.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
