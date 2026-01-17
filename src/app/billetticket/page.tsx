'use client';

import { useEffect, useState } from "react";
import { Ticket, ExternalLink, ArrowRight } from "lucide-react";

interface Billetterie {
  id: number;
  nom: string;
  description: string;
  type: string;
  url: string;
  style: string;
}

export default function BilletTicketPage() {
  const [items, setItems] = useState<Billetterie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/billetticket")
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header simple et efficace */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 text-pink-600 rounded-2xl mb-4">
            <Ticket size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tight">
            Billetterie <span className="text-pink-600">Toulouse</span>
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto font-medium">
            Accès direct aux principales plateformes de réservation pour vos sorties toulousaines.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <a 
                key={item.id} 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group bg-white border border-slate-200 rounded-2xl p-6 transition-all hover:shadow-xl hover:border-pink-200 flex flex-col h-full"
              >
                <div className="flex-1">
                  <div className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border ${item.style}`}>
                    {item.type}
                  </div>
                  
                  <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-pink-600 transition-colors">
                    {item.nom}
                  </h2>
                  
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                  <span className="text-xs font-bold text-slate-400 group-hover:text-pink-600 transition-colors uppercase tracking-wider">
                    Accéder au site
                  </span>
                  <ArrowRight size={18} className="text-slate-300 group-hover:text-pink-600 group-hover:translate-x-1 transition-all" />
                </div>
              </a>
            ))}
          </div>
        )}

        <footer className="mt-20 text-center border-t border-slate-200 pt-8">
          <p className="text-slate-400 text-xs">
            Sélection de plateformes certifiées pour la ville de Toulouse.
          </p>
        </footer>

      </div>
    </div>
  );
}