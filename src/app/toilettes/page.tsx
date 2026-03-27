"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Beer, MapPin, Search } from 'lucide-react';

export default function ToilettesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/toilettes');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Erreur de récupération :", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filtrage simple pour la recherche
  const filteredBars = data?.bars?.filter((bar: any) => 
    bar.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    bar.adresse.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-screen items-center justify-center text-pink-600 font-medium animate-pulse">
      Chargement des sanitaires toulousains...
    </div>
  );

  return (
    <main className="max-w-5xl mx-auto p-6 font-sans">
      {/* NAVIGATION AVEC LUCIDE-REACT */}
      <nav className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-800 transition-colors font-semibold group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Retour à l'Accueil
        </Link>
      </nav>

      <header className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black mb-2 text-gray-900 tracking-tight">
          Toilettes <span className="text-pink-600">Publiques</span>
        </h1>
        <p className="text-gray-500">Trouver un lieu de secours à Toulouse (Bars partenaires & Sanisettes)</p>
      </header>

      {/* PARTIE 1 : LIEN OFFICIEL */}
      <section className="mb-12 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-xl shadow-sm">
        <div className="flex items-start gap-4">
          <div className="bg-blue-500 p-2 rounded-lg text-white">
            <MapPin size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-900 mb-1">Guide Officiel ICI Toilettes</h2>
            <p className="text-blue-800/80 mb-3 text-sm">
              Le réseau partenaire qui transforme les bars en services publics.
            </p>
            <a 
              href="https://ici-toilettes.fr/toilettes-publiques-toulouse/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-white px-4 py-2 rounded-lg text-blue-600 font-bold border border-blue-200 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
            >
              Consulter la carte interactive
            </a>
          </div>
        </div>
      </section>

      {/* PARTIE 2 : BARS PARTENAIRES */}
      <section className="mb-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <Beer className="text-pink-600" /> 
            Les 15 Bars Partenaires
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Rechercher un bar ou un quartier..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 w-full md:w-64"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBars?.map((bar: any, index: number) => (
            <div key={index} className="group border border-gray-100 p-5 rounded-2xl shadow-sm bg-white hover:shadow-md hover:border-pink-100 transition-all">
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-pink-600 transition-colors">{bar.nom}</h3>
              <p className="text-gray-500 text-sm mb-3 flex items-start gap-1">
                <MapPin size={14} className="mt-1 shrink-0" /> {bar.adresse}
              </p>
              {bar.note && (
                <div className="bg-pink-50 text-pink-700 text-xs p-2 rounded-lg italic">
                  "{bar.note}"
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* PARTIE 3 : SANISETTES */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">🚻 Réseau des Sanisettes Municipales</h2>
        <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
          <table className="w-full text-left border-collapse bg-white">
            <thead>
              <tr className="bg-gray-50 text-gray-400 uppercase text-[10px] tracking-widest font-bold">
                <th className="p-4 border-b">Adresse / Emplacement</th>
                <th className="p-4 border-b">Type</th>
                <th className="p-4 border-b text-center">PMR</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {data?.sanisettes?.map((item: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 border-b font-medium text-gray-700">{item.route}</td>
                  <td className="p-4 border-b text-gray-500 text-xs">{item.type}</td>
                  <td className="p-4 border-b text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item.pmr.includes('Non') ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                      {item.pmr.includes('Non') ? 'NON' : 'OUI'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
