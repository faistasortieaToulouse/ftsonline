'use client';

import React, { useEffect, useState } from 'react';

export default function Page() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('/api/visitemonument', {
      cache: 'no-store'
    })
      .then(res => res.json())
      .then(data => setItems(data));
  }, []);

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
