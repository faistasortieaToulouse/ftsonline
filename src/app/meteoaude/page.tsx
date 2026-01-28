'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
// ... (tes imports d'icônes lucide-react)

export default function MeteoAudePage() {
  const [audeData, setAudeData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/meteoaude');
        if (res.ok) {
          const data = await res.json();
          setAudeData(data);
        }
      } catch (e) {
        console.error("Erreur chargement Aude", e);
      }
    };
    fetchData();
  }, []);

  if (!audeData) return <div className="p-10 text-center text-purple-600">Chargement des données de l'Aude...</div>;

  return (
    <div className="px-4 max-w-6xl mx-auto mb-12">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <section className="bg-indigo-50 text-indigo-900 rounded-3xl shadow-xl border border-indigo-200 overflow-hidden">
        
        {/* En-tête de la section Aude */}
        <div className="bg-indigo-600 p-6 text-white text-center">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Comparatif Météo Aude</h2>
          <p className="text-indigo-100 italic">Carcassonne • Lézignan • Narbonne</p>
        </div>

        {/* GRILLE DE COMPARAISON */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-indigo-200">
          
          {Object.values(audeData).map((ville: any, idx: number) => (
            <div key={idx} className="p-6 flex flex-col gap-4 hover:bg-white/50 transition-colors">
              
              {/* Ville & Température actuelle */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-indigo-900">{ville.ville}</h3>
                  <p className="text-sm font-medium text-indigo-500">{ville.condition}</p>
                </div>
                <div className="text-3xl font-black text-indigo-600">{ville.temp}°C</div>
              </div>

              {/* Indicateurs instantanés */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-bold uppercase">
                <div className="bg-white p-2 rounded-lg border border-indigo-100 flex items-center gap-2">
                  <span>🌪️ Vent:</span> <span className="text-indigo-600">{ville.vent} km/h</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-indigo-100 flex items-center gap-2">
                  <span>🕶️ UV:</span> <span className="text-orange-600">{ville.uv}</span>
                </div>
              </div>

              {/* BLOC BILAN DEPUIS LE 1er JANVIER */}
              <div className="mt-4 bg-indigo-900/5 rounded-2xl p-4 border border-indigo-200/50">
                <h4 className="text-[10px] font-black uppercase text-indigo-400 mb-3 border-b border-indigo-200 pb-1">
                  Bilan depuis le 1er Janv.
                </h4>
                
                <div className="space-y-2 text-sm font-medium">
                  <div className="flex justify-between items-center">
                    <span>☀️ Soleil</span>
                    <b className="text-indigo-900">{ville.stats.totalSunshine}h</b>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>💧 Pluie</span>
                    <b className="text-indigo-900">{ville.stats.totalRain}mm</b>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>🌪️ Vent Max</span>
                    <b className="text-indigo-900">{ville.stats.maxWind}km/h</b>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-indigo-100">
                    <span>🌱 État du Sol</span>
                    <b className={ville.stats.waterBalance < 0 ? "text-orange-600" : "text-emerald-600"}>
                      {ville.stats.waterBalance}mm
                    </b>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Petit conseil spécifique Aude */}
        <div className="bg-amber-50 p-4 border-t border-indigo-100 flex items-center gap-3">
          <span className="text-2xl">🍇</span>
          <p className="text-xs text-amber-800 leading-tight italic">
            <b>Note régionale :</b> Dans les Corbières et le Narbonnais, le déficit en eau (Sol) est souvent plus marqué qu'à Carcassonne en raison de la Cers qui assèche les sols rapidement.
          </p>
        </div>

      </section>
    </div>
  );
}
