"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react'; 

export default function PageLivres() {
  const [nouveautes, setNouveautes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On ajoute un timestamp à l'URL pour forcer le navigateur à ignorer son cache local
    fetch('/api/livres?t=' + Date.now())
      .then(res => res.json())
      .then(data => {
        setNouveautes(data);
        setLoading(false);
      });
  }, []);

  return (
    <main className="max-w-7xl mx-auto p-6 bg-white min-h-screen text-slate-900">
      <nav className="mb-8">
        <Link href="/" className="group flex items-center text-slate-600 hover:text-blue-600 transition-all">
          <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1" />
          <span className="font-medium">Retour à l'Accueil</span>
        </Link>
      </nav>

      <h1 className="text-4xl font-bold mb-2">Rayon des Nouveautés</h1>
      <p className="text-slate-500 mb-8">Affichage de {nouveautes.length} romans trouvés.</p>

      {loading ? (
        <div className="text-center py-20 italic">Chargement des livres...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {nouveautes.map((livre: any) => (
            <div key={livre.id} className="flex flex-col h-full border border-slate-100 p-2 rounded-xl hover:shadow-lg transition-shadow">
              <div className="relative aspect-[2/3] mb-3 overflow-hidden rounded-lg bg-slate-100">
                <img 
                  src={livre.image} 
                  alt={livre.titre}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 flex flex-col">
                <h3 className="font-bold text-sm line-clamp-2">{livre.titre}</h3>
                <p className="text-xs text-slate-500 mb-2">{livre.auteur}</p>
                
                {/* LE BOUTON POUR LE RÉSUMÉ */}
                <div className="mt-auto pt-3">
                  <a 
                    href={livre.url_description} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full bg-blue-600 text-white text-[11px] font-bold py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Voir le résumé
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
