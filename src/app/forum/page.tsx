import React from 'react';

async function getForumData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/forum`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
}

export default async function ForumPage() {
  const data = await getForumData();

  if (!data) return <div className="p-10 text-center">Chargement des données du Forum...</div>;

  return (
    <div className="min-h-screen bg-orange-50/30 py-12 px-4 md:px-8 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto">
        
        {/* Header - Style Affiche de Quartier */}
        <header className="text-center mb-16 bg-red-600 text-white p-10 rounded-3xl shadow-2xl rotate-1">
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase mb-2">
            {data.presentation.name}
          </h1>
          <p className="text-xl md:text-2xl font-bold uppercase tracking-widest border-t-2 border-white pt-4 inline-block">
            {data.presentation.location}
          </p>
        </header>

        {/* Philosophie */}
        <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-sm mb-10">
          <h2 className="text-2xl font-black text-red-600 mb-4 uppercase">Le Manifeste</h2>
          <p className="text-xl leading-relaxed italic text-slate-700">
            "{data.presentation.philosophy}"
          </p>
          <p className="mt-4 font-bold text-slate-500">— Porté par le {data.presentation.organizer} depuis {data.presentation.founded}.</p>
        </div>

        {/* Grille des activités */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {data.sections.map((section: any, idx: number) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-red-300 transition-colors">
              <h3 className="text-xl font-bold mb-3">{section.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{section.description}</p>
            </div>
          ))}
        </div>

        {/* Infos Pratiques & Contact */}
        <div className="grid gap-8 md:grid-cols-2 bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
          <div>
            <h2 className="text-2xl font-black mb-6 uppercase text-orange-400">Infos Pratiques 2026</h2>
            <ul className="space-y-4 font-medium">
              <li className="flex gap-3">🗓️ <span>{data.infos_pratiques.date}</span></li>
              <li className="flex gap-3">🚇 <span>{data.infos_pratiques.access}</span></li>
              <li className="flex gap-3">🎟️ <span>{data.infos_pratiques.price}</span></li>
            </ul>
          </div>
          <div className="flex flex-col justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-slate-700 pt-6 md:pt-0 md:pl-8">
            <p className="mb-4 text-center md:text-right text-slate-400 uppercase text-xs font-bold tracking-widest">Organisé par le Carrefour Culturel</p>
            <a 
              href={data.contact.website} 
              className="bg-orange-500 hover:bg-orange-400 text-white px-8 py-3 rounded-full font-black transition-all mb-4 text-center"
            >
              VISITER LE SITE OFFICIEL
            </a>
            <p className="text-sm font-mono text-slate-500">{data.contact.email}</p>
          </div>
        </div>

        <footer className="mt-16 text-center text-slate-400 text-sm">
          <p>« Pour que les langues ne soient plus des frontières, mais des ponts. »</p>
        </footer>
      </div>
    </div>
  );
}
