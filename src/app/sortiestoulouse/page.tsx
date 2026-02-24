"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Search, ExternalLink, MapPin, Tag, CalendarDays } from "lucide-react";

export default function SortiesToulousePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch('/api/sortiestoulouse')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse text-primary">Chargement des bons plans...</div>;
  if (!data) return <div className="p-20 text-center">Erreur de chargement.</div>;

  const filteredApps = data.applications.filter((app: any) =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.tags.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen">
      {/* Navigation & Titre */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-4 transition-colors">
            <ArrowLeft size={18} /> Retour
          </Link>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
             Sorties & Réseaux <span className="text-primary">Toulouse</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Mise à jour : {new Date(data.updated).toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Chercher une app, un tag (ex: expats)..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border bg-card focus:ring-2 focus:ring-primary outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grille des applications */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.map((app: any) => (
          <div key={app.id} className="group bg-card rounded-2xl border p-6 hover:shadow-xl hover:border-primary/50 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-primary/10 text-primary rounded">
                  {app.type}
                </span>
                <MapPin size={16} className="text-muted-foreground" />
              </div>
              
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                {app.name}
              </h3>
              
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {app.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {app.tags.map((tag: string) => (
                  <span key={tag} className="text-[11px] bg-secondary px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Tag size={10} /> {tag}
                  </span>
                ))}
              </div>
            </div>

            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto flex items-center justify-center gap-2 w-full py-3 bg-secondary hover:bg-primary hover:text-white rounded-xl font-bold transition-all text-sm"
            >
              Voir le site <ExternalLink size={14} />
            </a>
          </div>
        ))}
      </div>

      {filteredApps.length === 0 && (
        <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
          <p className="text-muted-foreground italic">Aucun résultat pour votre recherche.</p>
        </div>
      )}
    </main>
  );
}
