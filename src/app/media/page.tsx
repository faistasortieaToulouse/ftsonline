import React from 'react';
import { ArrowLeft, Search, Settings, Tractor, Info, Sprout } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getMedia() {
  // On utilise une URL absolue pour le serveur et relative pour le client
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  
  try {
    const res = await fetch(`${baseUrl}/api/media`, { 
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("Erreur fetch media:", e);
    return null;
  }
}

export default async function MediaPage() {
  const data = await getMedia();

  // Si l'API échoue, on affiche un message propre au lieu de faire planter toute la page
  if (!data) {
    return (
      <div className="p-20 text-center">
        <h1 className="text-2xl font-bold text-red-600">Service momentanément indisponible</h1>
        <p className="text-gray-500">Impossible de charger les données des médias.</p>
      </div>
    );
  }

  // On définit les sections de manière sécurisée avec l'opérateur || []
  const sections = [
    { title: "📻 Radios", items: data.radios || [] },
    { title: "📺 Télévisions & Vidéo", items: data.televisions || [] },
    { title: "📰 Presse & Web Actu", items: data.presse_hebdo_web || [] },
    { title: "💼 Économie & Emploi", items: data.economie_emploi || [] },
    { title: "🎨 Culture & Lifestyle", items: data.culture_lifestyle || [] },
    { title: "🏛️ Institutionnel & Quartiers", items: data.institutionnel_quartiers || [] },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-900 mb-6 font-medium transition-colors">
          <ArrowLeft size={20} /> Retour à l'Accueil
        </Link>
      
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-red-600 mb-2 tracking-tight uppercase">MÉDIAS TOULOUSE</h1>
          <p className="text-gray-600 italic">Répertoire mis à jour • Février 2026</p>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          {sections.map((section) => (
            <div key={section.title} className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100 flex flex-col">
              <div className="bg-red-50 px-6 py-4 border-b border-red-100">
                <h2 className="text-xl font-bold text-red-800">{section.title}</h2>
              </div>
              <ul className="divide-y divide-gray-100 flex-1">
                {section.items.length > 0 ? (
                  section.items.map((item: any, idx: number) => (
                    <li key={idx} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">
                            {item.name}
                          </a>
                          {item.category && <span className="ml-2 text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 uppercase font-bold">{item.category}</span>}
                          {item.comment && <p className="text-sm text-gray-600 mt-1">{item.comment}</p>}
                        </div>
                        {item.status && (
                          <span className="text-[9px] px-2 py-1 rounded bg-white border border-gray-200 font-black uppercase shadow-sm">
                            {item.status}
                          </span>
                        )}
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-6 py-4 text-gray-400 italic text-sm">Aucun média répertorié</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
