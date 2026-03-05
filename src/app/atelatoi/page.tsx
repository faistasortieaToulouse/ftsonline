"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, ExternalLink, Info } from 'lucide-react';

// Image de secours si Meetup ne renvoie rien
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/800x400?text=Evénement+Atélatoi";

export default function TestAtelatoiPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/atelatoi')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur de chargement:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Navigation */}
        <Link href="/" className="inline-flex items-center gap-2 text-purple-600 font-bold mb-8 hover:translate-x-1 transition-transform">
          <ArrowLeft size={20} /> Retour à l'accueil
        </Link>

        {/* Header */}
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Test Filtrage Atelatoi</h1>
        <p className="text-slate-500 mb-8">Vérification des événements de Bordeaux délocalisés à Toulouse.</p>

        {loading ? (
          /* Skeleton loader pendant le chargement */
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-slate-200 rounded-3xl w-full"></div>
            <div className="h-10 bg-slate-200 rounded-xl w-1/2"></div>
            <div className="h-32 bg-slate-100 rounded-xl w-full"></div>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Compteur d'événements */}
            <div className="bg-purple-100 p-4 rounded-xl text-purple-800 font-medium flex items-center gap-2">
              <Info size={18} />
              Résultat : {data?.count || 0} événement(s) trouvé(s) pour Toulouse.
            </div>

            {data?.events?.map((event: any, i: number) => (
              <div key={i} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-md">
                
                {/* 1. PHOTO DE COUVERTURE AVEC FALLBACK */}
                <div className="relative h-48 md:h-64 w-full bg-slate-200">
                  <img 
                    src={event.coverImage || PLACEHOLDER_IMAGE} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-purple-600 shadow-sm border border-purple-100">
                    Flux Bordeaux → Toulouse
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-4">{event.title}</h2>
                  
                  {/* Date et Lieu */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3 text-slate-600">
                      <Calendar size={20} className="text-pink-500 shrink-0" />
                      <span className="text-sm">
                        {new Date(event.startDate).toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <MapPin size={20} className="text-pink-500 shrink-0" />
                      <span className="font-semibold text-sm line-clamp-1">{event.location}</span>
                    </div>
                  </div>

                  {/* 2. DESCRIPTION AVEC FORMATAGE */}
                  <div className="mb-8">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 border-b pb-2">À propos de l'événement</h3>
                    <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                      {event.description || "Aucune description fournie."}
                    </div>
                  </div>

                  {/* Bouton vers Meetup */}
                  <a 
                    href={event.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-purple-600 text-white w-full py-4 rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 active:scale-[0.98]"
                  >
                    Voir l'événement sur Meetup <ExternalLink size={18} />
                  </a>
                </div>
              </div>
            ))}

            {/* État vide */}
            {(!data?.events || data.events.length === 0) && (
              <div className="text-center p-16 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 text-slate-400">
                <p className="text-lg font-medium">Aucun événement trouvé.</p>
                <p className="text-sm">Le scraper a bien fonctionné, mais aucun événement Atélatoi ne mentionne "Toulouse" actuellement.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
