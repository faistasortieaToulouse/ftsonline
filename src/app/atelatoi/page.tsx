'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"; 
import Link from "next/link";
import { ArrowLeft, ExternalLink, MapPin, Calendar } from "lucide-react";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x200?text=Événement+Meetup";

export default function AtelatoiTestPage() { 
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  async function fetchTest() {
    setLoading(true);
    try {
      const res = await fetch("/api/atelatoi");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTest(); }, []);

  return (
    <div className="container mx-auto py-10 px-4">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-purple-700 font-bold hover:text-purple-900 transition-all">
          <ArrowLeft size={20} /> Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-bold mb-4">Test Filtrage : Atélatoi Toulouse</h1>
      <p className="text-muted-foreground mb-6">Affichage des événements de Bordeaux qui ont lieu à Toulouse.</p>

      <div className="flex gap-4 mb-8">
        <Button onClick={() => setViewMode("card")} variant={viewMode === "card" ? "default" : "outline"} className="bg-purple-600">🗂️ Cards</Button>
        <Button onClick={() => setViewMode("list")} variant={viewMode === "list" ? "default" : "outline"} className="bg-purple-600">📋 Liste</Button>
        <Button onClick={fetchTest} disabled={loading} variant="secondary">🔄 Rafraîchir</Button>
      </div>

      {loading ? (
        <div className="p-20 text-center animate-pulse text-purple-600 font-bold">Analyse du flux en cours...</div>
      ) : (
        <div className={viewMode === "card" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
          {data?.events?.map((event: any, index: number) => (
            <div key={index} className={`bg-white rounded-3xl shadow-lg border overflow-hidden ${viewMode === 'list' ? 'flex items-center gap-4 p-4' : ''}`}>
              
              <img 
                src={event.coverImage || PLACEHOLDER_IMAGE} 
                className={viewMode === 'card' ? "w-full h-48 object-cover" : "w-24 h-24 rounded-xl object-cover"} 
                alt="Event"
              />

              <div className="p-6 flex-1">
                <h2 className="text-xl font-bold text-slate-800 mb-2">{event.title}</h2>
                <div className="flex flex-col gap-1 text-sm text-slate-500 mb-4">
                  <div className="flex items-center gap-2"><Calendar size={14}/> {new Date(event.startDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                  <div className="flex items-center gap-2"><MapPin size={14}/> {event.location}</div>
                </div>

                {viewMode === "card" && (
                  <p className="text-sm text-slate-600 mb-6 line-clamp-3 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg">
                    {event.description}
                  </p>
                )}

                <a href={event.link} target="_blank" className="text-purple-600 font-bold text-sm inline-flex items-center gap-1 hover:underline">
                  Voir sur Meetup <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && data?.count === 0 && (
        <div className="p-12 border-2 border-dashed rounded-3xl text-center text-slate-400">
          Aucun événement toulousain trouvé pour le moment.
        </div>
      )}
    </div>
  );
}
