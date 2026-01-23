'use client';
import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Capitale {
  id: number;
  debut: string;
  fin: string;
  nom: string;
}

export default function CapitalesFrancePage() {
  const [capitales, setCapitales] = useState<Capitale[]>([]);

  useEffect(() => {
    fetch('/api/capitales_france')
      .then((res) => res.json())
      .then((data: Capitale[]) => setCapitales(data));
  }, []);

  // Fonction pour déterminer dynastie / régime
  function getRegime(debut: string, fin: string, nom: string) {
    const start = parseInt(debut) || 0;
    const end = fin ? parseInt(fin) : start;
    const name = nom.trim();

    // Mérovingiens
    if (start >= 431 && start <= 687) return "Mérovingiens";

    // Robertiens / Pépinides
    if (start >= 687 && start <= 751) return "Robertiens / Pépinides";

    // Carolingiens
    if (start >= 751 && start <= 987) return "Carolingiens";

    // Capétiens directs
    if (start >= 987 && start <= 1328) return "Capétiens directs";

    // Valois
    if (start >= 1328 && start < 1380) return "Valois directs";
    if (start >= 1380 && start < 1498) return "Valois-Orléans";
    if (start >= 1498 && start < 1589) return "Valois-Orléans-Angoulême";

    // Bourbons
    if (start >= 1589 && start <= 1792) return "Bourbons";

    // Républiques et Empires
    if (start >= 1792 && start < 1804) return "Première République";
    if (start >= 1804 && start < 1815) return "Premier Empire";
    if (start >= 1815 && start < 1830) return "Restauration (Bourbons)";
    if (start >= 1830 && start < 1848) return "Monarchie de Juillet (Bourbons-Orléans)";
    if (start >= 1848 && start < 1852) return "Deuxième République";
    if (start >= 1852 && start < 1870) return "Second Empire";
    if (start >= 1870 && start < 1940) return "Troisième République";

    // 1940-1944 : distinction par capitale
    if (start >= 1940 && start < 1944) {
      if (["Clermont-Ferrand", "Vichy"].includes(name)) return "État français / Vichy";
      if (["Tours"].includes(name)) return "Troisième République";
      if (["Londres", "Brazzaville", "Alger", "Bayeux"].includes(name)) return "Gouvernement en exil";
    }

    // Gouvernement provisoire
    if (start >= 1944 && start < 1946) {
      if (name === "Paris") return "Gouvernement provisoire";
      return "Gouvernement en exil";
    }

    // Républiques modernes
    if (start >= 1946 && start < 1958) return "Quatrième République";
    if (start >= 1958) return "Cinquième République";

    return "Régime inconnu";
  }

  if (!capitales || capitales.length === 0) {
    return <div className="p-10 text-center font-bold">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-600 mb-2 uppercase">
            Capitales de la France
          </h1>
          <p className="text-gray-500 uppercase tracking-widest text-sm font-bold italic">
            De l’Antiquité à nos jours
          </p>
        </header>

        <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th className="p-3 border-b border-gray-300 text-left text-sm font-bold">Début</th>
                <th className="p-3 border-b border-gray-300 text-left text-sm font-bold">Fin</th>
                <th className="p-3 border-b border-gray-300 text-left text-sm font-bold">Nom</th>
                <th className="p-3 border-b border-gray-300 text-left text-sm font-bold">Dynastie / Régime</th>
              </tr>
            </thead>
            <tbody>
              {capitales.map((cap) => (
                <tr key={cap.id} className="hover:bg-gray-100 transition-colors">
                  <td className="p-3 border-b border-gray-200">{cap.debut || ''}</td>
                  <td className="p-3 border-b border-gray-200">{cap.fin || ''}</td>
                  <td className="p-3 border-b border-gray-200">{cap.nom}</td>
                  <td className="p-3 border-b border-gray-200">{getRegime(cap.debut, cap.fin, cap.nom)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
