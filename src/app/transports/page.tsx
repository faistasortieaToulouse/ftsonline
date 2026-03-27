import React from 'react';

async function getTransports() {
  // On appelle l'API interne que nous venons de créer
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/transports`, {
    cache: 'no-store'
  });
  
  if (!res.ok) return null;
  return res.json();
}

export default async function TransportsPage() {
  const data = await getTransports();

  if (!data || !data.reseau_transports_toulouse) {
    return <div className="p-10 text-red-500">Données indisponibles. Vérifiez le fichier JSON.</div>;
  }

  const { metro, tramway, ferroviaire_rer, cable } = data.reseau_transports_toulouse;

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-l-8 border-red-600 pl-6">
          <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">
            Transports <span className="text-red-600">Toulousains</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Référentiel historique et prévisionnel du réseau</p>
        </header>

        {/* MÉTRO */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="bg-orange-500 text-white px-2 py-1 rounded">M</span> Métro VAL
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metro.map((m: any, idx: number) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-2xl font-black text-orange-500 mb-4">Ligne {m.ligne}</div>
                <ul className="space-y-4">
                  {m.evenements.map((ev: any, i: number) => (
                    <li key={i} className="border-l-2 border-gray-100 pl-4 relative">
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-gray-300"></div>
                      <time className="block text-xs font-bold uppercase text-gray-400">{ev.date}</time>
                      <span className="text-sm text-gray-700 leading-relaxed">{ev.evenement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* TRAMWAY */}
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="bg-blue-600 text-white px-2 py-1 rounded">T</span> Tramway
            </h2>
            <div className="space-y-4">
              {tramway.map((t: any, idx: number) => (
                <div key={idx} className="bg-white p-5 rounded-lg shadow-sm border-t-4 border-blue-600">
                  <h3 className="font-bold text-blue-900 mb-3">{t.ligne}</h3>
                  <div className="text-sm space-y-2">
                    {t.evenements.map((ev: any, i: number) => (
                      <p key={i}><span className="font-semibold">{ev.date}</span> — {ev.evenement}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* RER & CABLE */}
          <section className="space-y-12">
            <div>
              <h2 className="text-xl font-bold mb-6">🚆 Étoile Ferroviaire</h2>
              <div className="bg-gray-900 text-gray-100 p-6 rounded-xl">
                {ferroviaire_rer.map((f: any, i: number) => (
                  <div key={i} className="mb-4 last:mb-0 pb-4 last:pb-0 border-b border-gray-800 last:border-0">
                    <h4 className="font-bold text-yellow-500">{f.nom}</h4>
                    <p className="text-xs text-gray-400 mt-1">{f.details || f.statut}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-6">🚠 Transport par câble</h2>
              <div className="bg-green-600 text-white p-6 rounded-xl shadow-lg shadow-green-100">
                <h4 className="text-2xl font-black">{cable[0].nom}</h4>
                <p className="mt-2 text-green-100 text-sm">
                  {cable[0].evenements[0].date} : {cable[0].evenements[0].evenement}
                </p>
                {cable[0].evenements[1] && (
                    <p className="mt-4 text-xs bg-green-700 p-2 rounded italic">
                        Note : {cable[0].evenements[1].statut}
                    </p>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
