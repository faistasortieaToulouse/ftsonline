"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Liste des années disponibles dans le menu déroulant
const ANNEES_DISPONIBLES = ["2026", "2027", "2028"];

interface DonneeJour {
  couleur: string;
  risques: string[];
}

interface VigilanceData {
  toulouse: DonneeJour;
  lezignan: DonneeJour;
}

export default function HistoriqueVigilancePage() {
  const anneeActuelle = new Date().getFullYear().toString();
  const [anneeSelectionnee, setAnneeSelectionnee] = useState(anneeActuelle);
  const [historique, setHistorique] = useState<Record<string, VigilanceData>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fonction pour charger les données depuis l'API
  useEffect(() => {
    async function chargerHistorique() {
      setLoading(true);
      setMessage("");
      try {
        const res = await fetch(`/api/vigilances?annee=${anneeSelectionnee}`);
        const data = await res.json();
        
        if (data.historique && Object.keys(data.historique).length > 0) {
          setHistorique(data.historique);
        } else {
          setHistorique({});
          setMessage(data.message || "Aucun historique enregistré pour le moment.");
        }
      } catch (err) {
        setMessage("Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    }

    chargerHistorique();
  }, [anneeSelectionnee]);

  // Helper pour formater les badges de couleur météo
  const getBadgeStyle = (couleur: string) => {
    switch (couleur) {
      case 'rouge': return 'bg-red-600 text-white font-bold';
      case 'orange': return 'bg-orange-500 text-white';
      case 'jaune': return 'bg-yellow-400 text-black';
      default: return 'bg-green-500 text-white';
    }
  };

  // Trier les dates de l'historique du plus récent au plus ancien
  const dates Triees = Object.keys(historique).sort((a, b) => new Date(b).getTime() - new Date(a.getTime()));

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        {/* RETOUR À L'ACCUEIL */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline"
          >
            ← Retour à l'Accueil
          </Link>
        </div>

        {/* EN-TÊTE & MENU DÉROULANT */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Historique des Vigilances Météo</h1>
            <p className="text-gray-500 mt-1">Suivi quotidien pour Toulouse (31) et Lézignan (11)</p>
          </div>
          
          <div className="flex items-center gap-2">
            <label htmlFor="annee-select" className="text-sm font-medium text-gray-700">Année :</label>
            <select
              id="annee-select"
              value={anneeSelectionnee}
              onChange={(e) => setAnneeSelectionnee(e.target.value)}
              className="rounded-lg border-gray-300 border p-2 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {ANNEES_DISPONIBLES.map((annee) => (
                <option key={annee} value={annee}>{annee}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ZONE DE CONTENU */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Chargement de l'historique...</div>
        ) : message ? (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-xl text-center shadow-sm">
            {message}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b text-gray-700 font-semibold text-sm">
                    <th className="p-4">Date</th>
                    <th className="p-4">Toulouse (31)</th>
                    <th className="p-4">Lézignan-Corbières (11)</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-gray-900">
                  {datesTriees.map((date) => {
                    const jour = historique[date];
                    // Formatage de la date en français (ex: 21 mai 2026)
                    const dateFormatee = new Date(date).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    });

                    return (
                      <tr key={date} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-600 whitespace-nowrap">{dateFormatee}</td>
                        
                        {/* TOULOUSE */}
                        <td className="p-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs uppercase ${getBadgeStyle(jour.toulouse.couleur)}`}>
                            Vigilance {jour.toulouse.couleur}
                          </span>
                          {jour.toulouse.risques.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">⚠️ {jour.toulouse.risques.join(', ')}</p>
                          )}
                        </td>

                        {/* LÉZIGNAN */}
                        <td className="p-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs uppercase ${getBadgeStyle(jour.lezignan.couleur)}`}>
                            Vigilance {jour.lezignan.couleur}
                          </span>
                          {jour.lezignan.risques.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">⚠️ {jour.lezignan.risques.join(', ')}</p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
