"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Search, MapPin, Globe, Info } from "lucide-react";

export default function ApplisAmisPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch('/api/applisortiesamis')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur fetch:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse text-primary">Chargement des applications...</div>;
  
  // Sécurité anti-crash : on définit un tableau vide si data.applications est absent
  const appsList = data?.applications || [];

  const filteredApps = appsList.filter((app: any) => {
    const s = searchTerm.toLowerCase();
    return (
      (app.Application?.toLowerCase() || "").includes(s) ||
      (app.Ville?.toLowerCase() || "").includes(s) ||
      (app.Particularité?.toLowerCase() || "").includes(s)
    );
  });

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-4 transition-colors">
            <ArrowLeft size={18} /> Retour
          </Link>
          <h1 className="text-4xl font-black tracking-tight">
             Réseaux & <span className="text-primary">Sorties</span>
          </h1>
          {data?.updated && (
            <p className="text-muted-foreground mt-2">
              Dernière mise à jour : {new Date(data.updated).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Chercher une app, une ville..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border bg-card focus:ring-2 focus:ring-primary outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grille */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.map((app: any, index: number) => (
          <div key={index} className="group bg-card rounded-2xl border p-6 hover:shadow-xl hover:border-primary/50 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-primary/10 text-primary rounded flex items-center gap-1">
                <Globe size={12} /> {app["Portée / Pays"]}
              </span>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin size={14} />
                <span className="text-xs font-medium">{app.Ville}</span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
              {app.Application}
            </h3>
            
            <div className="flex gap-2 items-start text-sm text-muted-foreground leading-relaxed">
              <div className="mt-1 shrink-0"><Info size={14} className="text-primary" /></div>
              <p>{app.Particularité}</p>
            </div>
          </div>
        ))}
      </div>

      {filteredApps.length === 0 && (
        <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
          <p className="text-muted-foreground italic">Aucune application trouvée.</p>
        </div>
      )}
    </main>
  );
}
