"use client";
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Sun, Cloud, CloudRain, CloudLightning, ArrowLeft, Thermometer, ChevronRight } from 'lucide-react';

const VILLES_PAR_DEPT: Record<string, { id: string, label: string, dept: string }[]> = {
  "Ariège (09)": [
    { id: "foix", label: "Foix", dept: "09" },
    { id: "pamiers", label: "Pamiers", dept: "09" },
    { id: "st-girons", label: "Saint-Girons", dept: "09" },
    { id: "lavelanet", label: "Lavelanet", dept: "09" },
    { id: "saverdun", label: "Saverdun", dept: "09" },
  ],
  "Aude (11)": [
    { id: "carcassonne", label: "Carcassonne", dept: "11" },
    { id: "narbonne", label: "Narbonne", dept: "11" },
    { id: "castelnaudary", label: "Castelnaudary", dept: "11" },
    { id: "lezignan", label: "Lézignan-Corbières", dept: "11" },
    { id: "limoux", label: "Limoux", dept: "11" },
  ],
  "Aveyron (12)": [
    { id: "rodez", label: "Rodez", dept: "12" },
    { id: "millau", label: "Millau", dept: "12" },
    { id: "villefranche-r", label: "Villefranche-de-R.", dept: "12" },
    { id: "st-affrique", label: "Saint-Affrique", dept: "12" },
    { id: "decazeville", label: "Decazeville", dept: "12" },
  ],
  "Gard (30)": [
    { id: "nimes", label: "Nîmes", dept: "30" },
    { id: "ales", label: "Alès", dept: "30" },
    { id: "bagnols", label: "Bagnols-sur-Cèze", dept: "30" },
    { id: "beaucaire", label: "Beaucaire", dept: "30" },
    { id: "st-gilles", label: "Saint-Gilles", dept: "30" },
  ],
  "Haute-Garonne (31)": [
    { id: "toulouse", label: "Toulouse", dept: "31" },
    { id: "st-gaudens", label: "Saint-Gaudens", dept: "31" },
    { id: "luchon", label: "Bagnères de Luchon", dept: "31" },
    { id: "carbonne", label: "Carbonne", dept: "31" },
    { id: "revel", label: "Revel", dept: "31" },
  ],
  "Gers (32)": [
    { id: "auch", label: "Auch", dept: "32" },
    { id: "isle-jourdain", label: "L'Isle-Jourdain", dept: "32" },
    { id: "condom", label: "Condom", dept: "32" },
    { id: "fleurance", label: "Fleurance", dept: "32" },
    { id: "eauze", label: "Eauze", dept: "32" },
  ],
  "Hérault (34)": [
    { id: "montpellier", label: "Montpellier", dept: "34" },
    { id: "beziers", label: "Béziers", dept: "34" },
    { id: "sete", label: "Sète", dept: "34" },
    { id: "agde", label: "Agde", dept: "34" },
    { id: "lunel", label: "Lunel", dept: "34" },
  ],
  "Lot (46)": [
    { id: "cahors", label: "Cahors", dept: "46" },
    { id: "figeac", label: "Figeac", dept: "46" },
    { id: "gourdon", label: "Gourdon", dept: "46" },
    { id: "gramat", label: "Gramat", dept: "46" },
    { id: "souillac", label: "Souillac", dept: "46" },
  ],
  "Lozère (48)": [
    { id: "mende", label: "Mende", dept: "48" },
    { id: "marvejols", label: "Marvejols", dept: "48" },
    { id: "st-chely", label: "Saint-Chély-d'Apcher", dept: "48" },
    { id: "langogne", label: "Langogne", dept: "48" },
    { id: "peyre-aubrac", label: "Peyre en Aubrac", dept: "48" },
  ],
  "Hautes-Pyrénées (65)": [
    { id: "tarbes", label: "Tarbes", dept: "65" },
    { id: "lourdes", label: "Lourdes", dept: "65" },
    { id: "aureilhan", label: "Aureilhan", dept: "65" },
    { id: "bagneres-bigorre", label: "Bagnères-de-Bigorre", dept: "65" },
    { id: "lannemezan", label: "Lannemezan", dept: "65" },
  ],
  "Pyrénées Orientales (66)": [
    { id: "perpignan", label: "Perpignan", dept: "66" },
    { id: "canet", label: "Canet-en-Roussillon", dept: "66" },
    { id: "st-esteve", label: "Saint-Estève", dept: "66" },
    { id: "st-cyprien", label: "Saint-Cyprien", dept: "66" },
    { id: "argeles", label: "Argelès-sur-Mer", dept: "66" },
  ],
  "Tarn (81)": [
    { id: "albi", label: "Albi", dept: "81" },
    { id: "castres", label: "Castres", dept: "81" },
    { id: "gaillac", label: "Gaillac", dept: "81" },
    { id: "graulhet", label: "Graulhet", dept: "81" },
    { id: "lavaur", label: "Lavaur", dept: "81" },
  ],
  "Tarn et Garonne (82)": [
    { id: "montauban", label: "Montauban", dept: "82" },
    { id: "castelsarrasin", label: "Castelsarrasin", dept: "82" },
    { id: "moissac", label: "Moissac", dept: "82" },
    { id: "caussade", label: "Caussade", dept: "82" },
    { id: "montech", label: "Montech", dept: "82" },
  ],
  "Andorre": [
    { id: "andorra-vella", label: "Andorra la Vella", dept: "AD" },
    { id: "escaldes", label: "Escaldes-Engordany", dept: "AD" },
    { id: "encamp", label: "Encamp", dept: "AD" },
    { id: "sant-julia", label: "Sant Julià de Lòria", dept: "AD" },
    { id: "la-massana", label: "La Massana", dept: "AD" },
    { id: "ordino", label: "Ordino", dept: "AD" },
    { id: "canillo", label: "Canillo", dept: "AD" },
  ]
};

const MapWithNoSSR = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="h-[550px] w-full bg-slate-200 animate-pulse rounded-3xl flex items-center justify-center text-slate-400 font-bold">Chargement de la carte...</div>
});

export default function MeteoFuturPage() {
  const [ville, setVille] = useState('toulouse');
  const [activeDept, setActiveDept] = useState("Haute-Garonne (31)");
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Liste des départements pour le menu
  const departements = useMemo(() => Object.keys(VILLES_PAR_DEPT), []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/meteofuturtoulouse?ville=${ville}`)
      .then(res => res.json())
      .then(data => {
        setForecast(data.daily);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur API:", err);
        setLoading(false);
      });
  }, [ville]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <Link href="/" className="flex items-center gap-2 text-indigo-600 mb-6 font-bold hover:translate-x-[-4px] transition-transform w-fit">
          <ArrowLeft size={18} /> Retour Accueil
        </Link>

        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">
              Météo <span className="text-indigo-600">Occitanie</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg mt-2">Explorez les prévisions des 74 communes clés.</p>
          </div>
          <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-2xl font-black text-sm uppercase">
            {getCityLabel(ville)}
          </div>
        </header>

        {/* SECTION CARTE */}
        <div className="mb-10 shadow-2xl rounded-3xl border-4 border-white overflow-hidden">
          <MapWithNoSSR onCityChange={(id: string) => setVille(id)} />
        </div>

        {/* NAVIGATION PAR DÉPARTEMENT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
          {/* Colonne Gauche : Liste des Depts */}
          <div className="lg:col-span-1 space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-3">Départements</h2>
            {departements.map((dept) => (
              <button
                key={dept}
                onClick={() => setActiveDept(dept)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                  activeDept === dept ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-indigo-50 border border-slate-100'
                }`}
              >
                {dept}
                <ChevronRight size={14} className={activeDept === dept ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
              </button>
            ))}
          </div>

          {/* Colonne Droite : Villes du Dept actif */}
          <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Communes en {activeDept}</h2>
            <div className="flex flex-wrap gap-2">
              {VILLES_PAR_DEPT[activeDept].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVille(v.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                    ville === v.id 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                    : 'bg-slate-50 text-slate-600 border-transparent hover:border-indigo-200 hover:bg-white'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION PRÉVISIONS DÉTAILLÉES (Votre bloc actuel) */}
        <section className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
            {/* ... gardez votre logique de rendu forecast actuelle ici ... */}
        </section>
      </div>
    </div>
  );
}
