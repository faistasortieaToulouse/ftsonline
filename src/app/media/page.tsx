import React from 'react';

async function getMedia() {
  // Dans un vrai projet Next.js, on appellerait l'API interne ou on importerait directement les données
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/media`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function MediaPage() {
  const data = await getMedia();

  if (!data) return <div className="p-10 text-center">Chargement des médias toulousains...</div>;

  const sections = [
    { title: "📻 Radios", items: data.radios },
    { title: "📺 Télévisions & Vidéo", items: data.televisions },
    { title: "📰 Presse & Web", items: data.presse },
    { title: "🏛️ Institutionnel & Quartiers", items: data.institutionnel },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-red-600 mb-2">MÉDIAS TOULOUSE 2026</h1>
          <p className="text-gray-600 italic">Le répertoire complet de la Ville Rose</p>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          {sections.map((section) => (
            <div key={section.title} className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
              <div className="bg-red-50 px-6 py-4 border-b border-red-100">
                <h2 className="text-xl font-bold text-red-800">{section.title}</h2>
              </div>
              <ul className="divide-y divide-gray-100">
                {section.items.map((item: any, idx: number) => (
                  <li key={idx} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 font-medium hover:underline"
                        >
                          {item.name}
                        </a>
                        {item.category && <span className="ml-2 text-xs text-gray-400">({item.category})</span>}
                        {item.comment && <p className="text-xs text-gray-500 mt-1">{item.comment}</p>}
                      </div>
                      {item.status && (
                        <span className="text-[10px] px-2 py-1 rounded bg-green-100 text-green-700 font-bold uppercase">
                          {item.status}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <footer className="mt-16 text-center text-gray-400 text-sm">
          <p>Données mises à jour pour l'année 2026 - Toulouse, France</p>
        </footer>
      </div>
    </div>
  );
}
