'use client';
import { useEffect, useState } from 'react';

interface Validite {
  nom: string;
  categorie: string;
  fournisseur: string;
  dernierPaiement: string;
  prochaineEcheance: string;
  prix: string;
  mode: string;
}

export default function ValiditePage() {
  const [services, setServices] = useState<Validite[]>([]);
  const [loading, setLoading] = useState(true);

  // Les thèmes ordonnés à afficher sur la même page
  const categories = [
    { id: "Domaines", label: "🌐 Noms de Domaine", color: "border-blue-500 text-blue-700 bg-blue-50" },
    { id: "Applications", label: "📱 Abonnements Applications", color: "border-purple-500 text-purple-700 bg-purple-50" },
    { id: "Téléphonie", label: "📞 Téléphonie & Cartes", color: "border-amber-500 text-amber-700 bg-amber-50" },
    { id: "Administration", label: "🏛️ Administration & Impôts", color: "border-slate-500 text-slate-700 bg-slate-50" }
  ];

  useEffect(() => {
    fetch('/api/validite')
      .then((res) => res.json())
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur de chargement:", err);
        setLoading(false);
      });
  }, []);

  const formaterDateAffichage = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return dateStr; 
    return dateObj.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' });
  };

  const verifierEstDepasse = (dateStr: string) => {
    if (!dateStr) return false;
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return false;
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0); 
    return dateObj < aujourdhui;
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Chargement de votre espace de suivi...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Titre principal */}
        <header className="mb-10 border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-extrabold text-slate-800">Suivi des Échéances & Validités</h1>
          <p className="text-sm text-slate-500 mt-1">Vue d'ensemble globale de vos services, domaines et obligations</p>
        </header>

        {/* Boucle sur chaque thème pour créer les blocs de sections */}
        {categories.map((cat) => {
          const itemsFiltrés = services.filter(item => item.categorie === cat.id);
          if (itemsFiltrés.length === 0) return null;

          return (
            <div key={cat.id} className="mb-12">
              
              {/* Titre du thème */}
              <div className="flex items-center gap-2 mb-5">
                <h2 className="text-xl font-extrabold text-slate-700 tracking-tight">{cat.label}</h2>
                <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">
                  {itemsFiltrés.length}
                </span>
              </div>

              {/* Grille de cartes : 1 col sur mobile, 2 sur tablette, 3 sur ordi portable, 4 sur grand écran */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {itemsFiltrés.map((item, idx) => {
                  const estDepasse = verifierEstDepasse(item.prochaineEcheance);

                  return (
                    <div 
                      key={idx} 
                      className={`bg-white rounded-xl shadow-sm border-t-4 ${cat.color.split(' ')[0]} border-x border-b border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden`}
                    >
                      {/* En-tête de la Carte */}
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h3 className="font-bold text-slate-900 text-base leading-tight break-words flex-1">
                            {item.nom}
                          </h3>
                          <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded flex-shrink-0 ${
                            item.mode === "Automatique" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {item.mode}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mb-4">Fournisseur : {item.fournisseur}</p>
                      </div>

                      {/* Corps et Dates de la Carte */}
                      <div className="border-t border-slate-100 pt-3 mt-2">
                        <div className="bg-slate-50 rounded-lg p-2.5 mb-3 flex flex-col gap-1">
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Dernier paiement :</span>
                            <span className="font-medium text-slate-700">{item.dernierPaiement}</span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Tarif observé :</span>
                            <span className="font-semibold text-slate-800">{item.prix}</span>
                          </div>
                        </div>

                        {/* Date d'échéance mise en valeur */}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Échéance :</span>
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold shadow-sm ${
                            estDepasse 
                              ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {formaterDateAffichage(item.prochaineEcheance)} {estDepasse ? ' ⚠️' : ' ✓'}
                          </span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
