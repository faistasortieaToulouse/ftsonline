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

  // Liste des catégories ordonnées à afficher
  const categories = ["Domaines", "Applications", "Téléphonie", "Administration"];

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

  if (loading) return <div className="p-8 text-center text-slate-500">Chargement des données de suivi...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8 text-slate-800 border-b pb-4">
        Suivi des Échéances & Validités
      </h1>

      {categories.map((cat) => {
        // Filtrer les éléments qui appartiennent à la catégorie courante
        const itemsFiltrés = services.filter(item => item.categorie === cat);
        if (itemsFiltrés.length === 0) return null;

        return (
          <div key={cat} className="mb-10">
            <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2 capitalize">
              <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
              {cat === "Domaines" ? "🌐 Noms de Domaine" : 
               cat === "Applications" ? "📱 Abonnements Applications" : 
               cat === "Téléphonie" ? "📞 Téléphonie & Cartes" : "🏛️ Administration & Impôts"}
            </h2>

            <div className="overflow-x-auto bg-white shadow-sm border border-slate-200 rounded-xl">
              <table className="min-w-full table-auto border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Élément / Intitulé</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fournisseur</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 tracking-wider">Dernier Paiement / Action</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Prochaine Échéance</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type Paiement</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tarif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {itemsFiltrés.map((item, idx) => {
                    const echeanceDate = new Date(item.prochaineEcheance);
                    const aujourdhui = new Date();
                    const estDepasse = echeanceDate < aujourdhui;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900 text-sm whitespace-nowrap">{item.nom}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{item.fournisseur}</td>
                        <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{item.dernierPaiement}</td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                            estDepasse ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {echeanceDate.toLocaleDateString('fr-FR')} {estDepasse ? '(À renouveler)' : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            item.mode === "Automatique" ? "bg-blue-50 text-blue-700 font-medium" : "bg-amber-50 text-amber-700 font-medium"
                          }`}>
                            {item.mode}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">{item.prix}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
