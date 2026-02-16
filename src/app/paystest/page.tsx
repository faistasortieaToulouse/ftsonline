'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Info, BarChart3, AlertCircle } from "lucide-react";

interface GiniEntry {
  rang: number;
  pays: string;
  gini: number;
  flag: string;
}

interface GiniResponse {
  metadata: {
    title: string;
    definition: string;
    usage_conseille: string;
  };
  data: GiniEntry[];
}

export default function PaysTestPage() {
  const [res, setRes] = useState<GiniResponse | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/paystest")
      .then(r => {
        if (!r.ok) throw new Error("Erreur réseau");
        return r.json();
      })
      .then(data => {
        // Vérification sommaire de la structure reçue
        if (data && data.metadata && data.data) {
          setRes(data);
        } else {
          throw new Error("Format de données invalide");
        }
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setError(true);
      });
  }, []);

  // Gestion de l'erreur d'affichage
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <AlertCircle className="text-red-500" size={48} />
      <p className="text-slate-800 font-medium">Impossible de charger les statistiques.</p>
      <Link href="/" className="text-indigo-600 underline">Retour à l'accueil</Link>
    </div>
  );

  // Attente du chargement ET vérification que metadata existe
  if (!res || !res.metadata) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-indigo-600 font-medium">Chargement des données...</div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto font-sans bg-slate-50 min-h-screen">
      
      <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 group transition-colors">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour au menu principal
      </Link>

      <header className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="text-indigo-600" size={32} />
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">
            {res.metadata.title}
          </h1>
        </div>
        
        <div className="space-y-3">
          <div className="flex gap-3 items-start p-3 bg-indigo-50 rounded-lg">
            <Info className="text-indigo-600 shrink-0 mt-1" size={18} />
            <div className="text-indigo-900 text-sm leading-relaxed">
              <strong>Définition :</strong> {res.metadata.definition}
            </div>
          </div>
          {res.metadata.usage_conseille && (
            <p className="text-slate-500 text-xs italic ml-2">
              💡 {res.metadata.usage_conseille}
            </p>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3">
        {res.data && res.data.map((item) => (
          <div 
            key={item.rang} 
            className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-400 w-6">#{item.rang}</span>
              <span className="text-2xl group-hover:scale-110 transition-transform">{item.flag}</span>
              <h3 className="text-base font-bold text-slate-800">{item.pays}</h3>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden sm:block w-24 md:w-40 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${item.gini < 25 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                  style={{ width: `${item.gini}%` }}
                ></div>
              </div>
              
              <div className="text-right min-w-[80px]">
                <span className="block text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Indice Gini</span>
                <span className={`text-lg font-black ${item.gini < 25 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                  {item.gini ? item.gini.toFixed(1) : "N/A"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-12 py-8 border-t border-slate-200 text-center">
        <p className="text-slate-400 text-xs">
          Analyse comparative des inégalités mondiales • Modèle de calcul v1.0
        </p>
      </footer>
    </div>
  );
}
