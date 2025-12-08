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
