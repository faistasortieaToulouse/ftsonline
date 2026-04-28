import React from 'react';

interface Nation {
  rang: number;
  pays: string;
  superficie: string;
  region: string;
  info?: string;
}

async function getNations() {
  // Dans Next.js 13+, on peut appeler l'API avec une URL absolue ou traiter les données directement
  // Ici, on simule l'appel à la route créée précédemment
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/microetatnation`, {
    cache: 'no-store' 
  });
  
  if (!res.ok) return [];
  return res.json();
}

export default async function MicroEtatPage() {
  const nations: Nation[] = await getNations();

  return (
    <div className="max-w-6xl mx-auto p-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">
          Classement des Micro-États et Nations
        </h1>
        <p className="text-slate-600 italic">
          Basé sur la superficie et les faits marquants.
        </p>
      </header>

      <div className="overflow-x-auto shadow-lg rounded-lg border border-slate-200">
        <table className="min-w-full bg-white">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Rang</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Pays</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Superficie</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Localisation / Région</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fait Marquant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {nations.map((nation) => (
              <tr key={`${nation.rang}-${nation.pays}`} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">#{nation.rang}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">{nation.pays}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{nation.superficie}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{nation.region}</td>
                <td className="px-6 py-4 text-sm text-slate-500 italic">
                  {nation.info || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="mt-8 text-sm text-slate-400 text-center">
        Source : Données fournies par l'utilisateur & Wikipedia.
      </footer>
    </div>
  );
}
