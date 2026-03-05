"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, ExternalLink } from 'lucide-react';

export default function TestAtelatoiPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/atelatoi')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-purple-600 font-bold mb-8">
          <ArrowLeft size={20} /> Retour
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Test Filtrage Atelatoi</h1>
        <p className="text-slate-500 mb-8">Vérification des événements de Bordeaux délocalisés à Toulouse.</p>

        {loading ? (
          <div className="animate-pulse flex space-x-4 p-6 bg-white rounded-2xl shadow">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-purple-100 p-4 rounded-xl text-purple-800 font-medium">
              Résultat : {data.count} événement(s) trouvé(s) à Toulouse.
            </div>

            {data.events?.map((event: any, i: number) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-purple-700 mb-4">{event.title}</h2>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Calendar size={18} className="text-pink-500" />
                    {new Date(event.date).toLocaleDateString('fr-FR', { 
                      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
                    })}
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <MapPin size={18} className="text-pink-500" />
                    <span className="font-semibold">{event.location}</span>
                  </div>
                </div>
                <a 
                  href={event.link} 
                  target="_blank" 
                  className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 transition-colors"
                >
                  Voir sur Meetup <ExternalLink size={14} />
                </a>
              </div>
            ))}

            {data.count === 0 && (
              <div className="text-center p-12 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                Aucun événement toulousain trouvé dans ce flux actuellement.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
