"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Bus, Loader2, ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

type TisseoMessage = {
  id: string;
  title: string;
  description: string;
  start?: string | null;
  end?: string | null;
  severity?: string;
  lines?: string;
  url?: string;
  source: string;
};

export default function TisseoPage() {
  const [items, setItems] = useState<TisseoMessage[]>([]);
  const [filtered, setFiltered] = useState<TisseoMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/tisseo");
      const data = await res.json();
      setItems(data);
      setFiltered(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!search) {
      setFiltered(items);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      items.filter(
        i =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.lines || "").toLowerCase().includes(q)
      )
    );
  }, [search, items]);

  return (
    <div className="container mx-auto py-10 px-4">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <div className="flex items-center gap-3 mb-6">
        <Bus className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Info trafic Tisséo</h1>
      </div>

      <p className="text-muted-foreground mb-6">
        Perturbations et messages officiels du réseau Tisséo (Toulouse Métropole)
      </p>

      <input
        className="w-full mb-4 p-2 border rounded"
        placeholder="Rechercher une ligne, un mot-clé…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <Button onClick={load} className="mb-6">
        🔄 Actualiser
      </Button>

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-muted-foreground">
          Aucun message trafic en cours 🎉
        </p>
      )}

      <div className="space-y-4">
        {filtered.map(msg => (
          <div
            key={msg.id}
            className="p-4 border rounded-lg bg-white shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <h2 className="font-semibold">{msg.title}</h2>
            </div>

            {msg.lines && (
              <p className="text-sm text-blue-600 mb-1">
                Lignes concernées : {msg.lines}
              </p>
            )}

            {msg.description && (
              <p className="text-sm text-muted-foreground mb-2">
                {msg.description}
              </p>
            )}

            {msg.start && (
              <p className="text-xs text-gray-500">
                Début : {new Date(msg.start).toLocaleString("fr-FR")}
              </p>
            )}

            {msg.end && (
              <p className="text-xs text-gray-500">
                Fin prévue : {new Date(msg.end).toLocaleString("fr-FR")}
              </p>
            )}

            <p className="text-xs italic mt-1">Source : {msg.source}</p>

            {msg.url && (
              <a
                href={msg.url}
                target="_blank"
                className="text-sm text-blue-600 underline mt-2 inline-block"
              >
                Voir sur tisseo.fr
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
