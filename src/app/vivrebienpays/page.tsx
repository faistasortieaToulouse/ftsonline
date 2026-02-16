"use client";
import React, { useEffect, useState } from 'react';

export default function VivreBienPays() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/vivrebienpays')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <p className="text-xl font-medium animate-pulse">Chargement des indicateurs mondiaux...</p>
    </div>
  );

  return (
    <main className="max-w-6xl mx-auto p-8 font-sans bg-white shadow-sm min-h-screen">
      <header className="mb-12 border-b border-slate-200 pb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-6 text-center">
          Où fait-il bon vivre en 2026 ?
        </h1>
        
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <h2 className="text-lg font-bold text-slate-700 mb-3 uppercase tracking-wider">
            Méthodologie du Score
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Estimation des pays où il fait bon vivre en établissant un score calculé ainsi :
          </p>
          <div className="mt-4 p-4 bg-white rounded border border-slate-100 font-mono text-sm text-slate-800 shadow-inner">
            <span className="text-green-600">taux d'alphabétisation</span> + <span className="text-green-600">bonheur national brut</span> + <span className="text-green-600">niveau d'éducation</span> - <span className="text-red-500">indice d'inégalités</span> <br/>
            + <span className="text-green-600">indice de mécanisation agricole</span> + <span className="text-green-600">taux de natalité</span> + <span className="text-green-600">taux de fécondité</span> + <span className="text-green-600">niveau de développement</span> <br/>
            + <span className="text-green-600">niveau de vie</span> - <span className="text-red-500">taux de pauvreté d'apprentissage</span> - <span className="text-red-500">niveau de pollution</span> + <span className="text-green-600">pouvoir d'achat</span> <br/>
            + <span className="text-green-600">niveau de recherche</span> - <span className="text-red-500">taux de pauvreté</span> + <span className="text-green-600">niveau technologique</span>
          </div>
          <p className="mt-4 text-slate-500 italic text-sm">
            Ce qui donne le classement "BILAN" ci-dessous :
          </p>
        </div>

        <div className="flex justify-center mt-8">
          <div className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md font-bold">
            Moyenne Mondiale : {data.moyenne_mondiale.toLocaleString()} pts
          </div>
        </div>
      </header>

      <div className="overflow-hidden shadow-xl rounded-2xl border border-slate-200">
        <table className="w-full text-left border-collapse bg-white">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="p-5 font-bold uppercase text-sm tracking-widest">Rang</th>
              <th className="p-5 font-bold uppercase text-sm tracking-widest">Pays</th>
              <th className="p-5 font-bold uppercase text-sm tracking-widest text-right">BILAN</th>
              <th className="p-5 font-bold uppercase text-sm tracking-widest text-center">Écart / Moyenne</th>
            </tr>
          </thead>
          <tbody>
            {data.classement.map((item: any, index: number) => {
              const diff = item.bilan - data.moyenne_mondiale;
              const isAbove = diff > 0;
              
              return (
                <tr key={index} className="border-b hover:bg-blue-50 transition-all duration-200 group">
                  <td className="p-5 font-bold text-slate-400 group-hover:text-blue-600">{index + 1}</td>
                  <td className="p-5 font-bold text-slate-800">{item.pays}</td>
                  <td className="p-5 text-right font-mono font-semibold text-slate-700">
                    {item.bilan.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${isAbove ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {isAbove ? '▲ SUPÉRIEUR' : '▼ INFÉRIEUR'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
