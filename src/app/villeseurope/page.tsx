"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, MapPin, ExternalLink } from "lucide-react";

export default function VillesEuropePage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/villeseurope")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <nav className="mb-8">
        <Link href="/" className="text-blue-600 hover:underline flex items-center gap-2">
          <ArrowLeft size={18} /> Retour au tableau de bord
        </Link>
      </nav>

      <div className="mb-12">
        <h1 className="text-4xl font-extrabold mb-4 flex items-center gap-3 text-slate-900">
          <Building2 className="text-blue-600" size={36} /> 
          Démographie des Villes d'Europe
        </h1>
        <p className="text-slate-600 italic">
          Classement des plus grandes villes de l'Union Européenne par population intra-muros.
        </p>
      </div>

      <div className="space-y-16">
        {data.map((section: any, idx: number) => (
          <div key={idx} className="animate-in fade-in duration-700">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 border-l-4 border-blue-500 pl-4 bg-slate-50 py-2 rounded-r-lg">
              {section.category}
            </h2>
            
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.links.map((link: any, i: number) => (
                <li key={i}>
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 border rounded-xl bg-white hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm group"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin size={18} className="text-blue-500 group-hover:text-blue-100" />
                      <span className="font-semibold">{link.name}</span>
                    </div>
                    <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <footer className="mt-20 p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
        <p className="text-sm text-slate-500">
          Source des données : Estimations 2023-2025 basées sur les recensements nationaux (Eurostat / Wikipédia).
        </p>
      </footer>
    </div>
  );
}
