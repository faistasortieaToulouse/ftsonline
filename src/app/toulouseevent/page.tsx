'use client';

import { useEffect, useState } from "react";
import { Sparkles, ExternalLink, CalendarDays, MapPinned } from "lucide-react";

interface ToulouseEvent {
  id: number;
  nom: string;
  description: string;
  type: string;
  url: string;
  color: string;
}

export default function ToulouseEventPage() {
  const [events, setEvents] = useState<ToulouseEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/toulouseevent")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Vibrant */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-purple-600 to-pink-500 text-white rounded-3xl mb-6 shadow-lg shadow-purple-200">
            <Sparkles size={40} />
          </div>
          <h1 className="text-5xl font-black text-slate-900 mb-4 uppercase tracking-tighter">
            Événements <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">Toulouse</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
            L'essentiel de la vie culturelle, artistique et festive de la Ville Rose réuni au même endroit.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <a 
                key={event.id} 
                href={event.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative bg-white border border-slate-200 rounded-[2rem] p-8 transition-all hover:shadow-2xl hover:-translate-y-2 flex flex-col justify-between overflow-hidden"
              >
                {/* Badge Type */}
                <div className="relative z-10">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border ${event.color}`}>
                    <CalendarDays size={12} />
                    {event.type}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-purple-600 transition-colors leading-tight">
                    {event.nom}
                  </h2>
                  
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    {event.description}
                  </p>
                </div>

                {/* Footer de la carte */}
                <div className="relative z-10 flex items-center justify-between pt-6 border-t border-slate-50">
                  <span className="text-sm font-bold text-slate-900 flex items-center gap-2 group-hover:text-purple-600 transition-colors">
                    Voir l'agenda <ExternalLink size={16} />
                  </span>
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-300 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                    <MapPinned size={20} />
                  </div>
                </div>

                {/* Effet décoratif au survol */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              </a>
            ))}
          </div>
        )}

        <footer className="mt-20 text-center border-t border-slate-200 pt-10">
          <p className="text-slate-400 text-sm">
            Programmation officielle des salles et lieux de vie toulousains.
          </p>
        </footer>

      </div>
    </div>
  );
}