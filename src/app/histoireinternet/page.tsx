"use client";

import Link from 'next/link';
// Importation directe du fichier JSON depuis le dossier data
import histoireData from '../../../../data/mondecategories/histoireinternet.json';

// Interface calquée sur la structure réelle de ton fichier JSON
interface SiteHistorique {
  id: number;
  nom: string;
  annee: number | string;
  description: string;
}

export default async function HistoireInternetPage() {
  // On récupère la liste "sites_importants_popular_mechanics" du JSON
  const sites: SiteHistorique[] = histoireData.sites_importants_popular_mechanics || [];

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        
        {/* En-tête avec titre et intro dynamiques */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-10 gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">
              {histoireData.titre}
            </h1>
            <p className="mt-4 text-lg text-gray-700 leading-relaxed border-l-4 border-blue-200 pl-4 italic">
              {histoireData.introduction}
            </p>
          </div>
          <Link 
            href="/" 
            className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:transform active:scale-95 whitespace-nowrap"
          >
            ← Retour à l'Accueil
          </Link>
        </div>

        {/* Timeline / Liste des sites */}
        <div className="relative space-y-8">
          {sites.length > 0 ? (
            sites.map((item) => (
              <section 
                key={item.id} 
                className="relative p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 transition-colors group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                  <h2 className="text-2xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                    {item.nom}
                  </h2>
                  <span className="inline-block px-4 py-1 bg-blue-600 text-white text-sm font-black rounded-full shadow-sm">
                    {item.annee}
                  </span>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {item.description}
                </p>
              </section>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-inner border border-dashed border-gray-300">
              <p className="text-gray-400 text-xl font-medium">
                Aucune donnée historique trouvée.
              </p>
            </div>
          )}
        </div>

        {/* Conclusion stylisée */}
        <footer className="mt-16 p-10 bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl text-white shadow-xl">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>🚀</span> En résumé
          </h3>
          <p className="text-blue-100 text-lg leading-relaxed italic opacity-90">
            {histoireData.conclusion}
          </p>
        </footer>

      </div>
    </main>
  );
}
