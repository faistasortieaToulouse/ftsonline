"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Risque {
  nom: string;
  couleur: { label: string; couleur: string };
}

interface Station {
  nom: string;
  codeDep: string;
  couleurMax: { label: string; couleur: string };
  risques: Risque[];
}

interface VigilanceData {
  misAJour: string;
  stations: Station[];
}

export default function VigilancePage() {
  const [data, setData] = useState<VigilanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVigilance() {
      try {
        const res = await fetch("/api/vigilance");
        if (!res.ok) throw new Error("Erreur serveur lors du chargement");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError("Impossible de charger les vigilances pour le moment.");
      } finally {
        setLoading(false);
      }
    }
    fetchVigilance();
  }, []);

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation / Retour */}
        <div className="flex justify-between items-center">
          <Link 
            href="/" 
            className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2 px-4 rounded-lg transition border border-gray-700 flex items-center gap-2"
          >
            ← Retour à l'Accueil
          </Link>
          <span className="text-xs text-gray-400">Application: ftstoulouse</span>
        </div>

        {/* En-tête */}
        <div className="border-b border-gray-800 pb-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Vigilance Météo-France Officielle
          </h1>
          <p className="text-gray-400 mt-2">
            Suivi des événements extrêmes en Occitanie pour Toulouse et Lézignan-Corbières.
          </p>
          {data?.misAJour && (
            <p className="text-xs text-blue-400 mt-2 font-mono">
              Mis à jour par Météo-France le : {new Date(data.misAJour).toLocaleString("fr-FR")}
            </p>
          )}
        </div>

        {/* Gestion des états (Chargement / Erreur) */}
        {loading && (
          <div className="text-center py-12 text-gray-400 font-medium animate-pulse">
            Analyse du bulletin de vigilance national...
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Grille des Stations */}
        {data && !loading && (
          <div className="grid md:grid-cols-2 gap-6">
            {data.stations.map((station) => (
              <div 
                key={station.codeDep} 
                className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">{station.nom}</h2>
                  
                  {/* Badge d'alerte global de la station */}
                  <div className="mb-6">
                    <span className="text-xs uppercase tracking-wider text-gray-400 block mb-1 font-semibold">
                      Statut Général :
                    </span>
                    <span className={`inline-block px-4 py-2 rounded-xl text-sm font-semibold shadow-md ${station.couleurMax.couleur}`}>
                      {station.couleurMax.label}
                    </span>
                  </div>

                  {/* Liste des risques secondaires actifs si ce n'est pas Vert RAS */}
                  {station.risques.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs uppercase tracking-wider text-gray-400 block font-semibold">
                        Détail par phénomène :
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        {station.risques.map((risq, idx) => (
                          <div 
                            key={idx} 
                            className="flex justify-between items-center bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 text-sm"
                          >
                            <span className="text-gray-300 font-medium">{risq.nom}</span>
                            <span className={`w-3 h-3 rounded-full ${risq.couleur.couleur.split(" ")[0]}`} title={risq.couleur.label} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Lien externe d'information */}
                <div className="mt-6 pt-4 border-t border-gray-700/50">
                  <a 
                    href={`https://vigilance.meteofrance.fr/fr/${station.codeDep === "31" ? "haute-garonne" : "aude"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-white underline transition block text-right"
                  >
                    Voir le bulletin complet Météo-France →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Note d'information automatique */}
        <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-800 text-xs text-gray-400">
          <p>
            💡 <strong>Stratégie de l'application :</strong> Cette page utilise le flux direct en Open Data. Si vous souhaitez mettre en place l'archivage automatique de vos données pour votre historique des événements extrêmes, pensez à connecter cette API à votre base de données pour enregistrer une ligne dès que le statut passe à <em>Orange</em> ou <em>Rouge</em>.
          </p>
        </div>

      </div>
    </main>
  );
}
