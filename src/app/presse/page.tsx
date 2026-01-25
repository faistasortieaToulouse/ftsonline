"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PressArticle {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  image: string | null;
  url: string;
  source: string;
  dateFormatted?: string;
}

const fetchPress = async (): Promise<PressArticle[]> => {
  const res = await fetch("/api/presse");
  if (!res.ok) throw new Error("Impossible de récupérer les actualités");
  return res.json();
};

export default function PressePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<PressArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<PressArticle[]>([]);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [searchQuery, setSearchQuery] = useState("");

  async function loadArticles() {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchPress();

      const cleaned = data.map((a, index) => {
        const d = new Date(a.publishedAt);
        return {
          ...a,
          id: `${a.id}-${index}`,
          dateFormatted:
            !isNaN(d.getTime())
              ? d.toLocaleString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
        };
      });

      setArticles(cleaned);
      setFilteredArticles(cleaned);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredArticles(articles);
      return;
    }

    const q = searchQuery.toLowerCase();
    setFilteredArticles(
      articles.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q) ||
        a.dateFormatted?.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, articles]);

  return (
    <div className="container mx-auto py-10 px-4">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-bold mb-2">📰 Actualités & Presse</h1>
      <p className="text-muted-foreground mb-6">
        Presse nationale et locale agrégée via RSS.
      </p>

      <input
        type="text"
        placeholder="Rechercher par titre, source, date..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />

      <div className="flex gap-4 mb-6">
        <Button onClick={loadArticles} disabled={loading}>
          {loading ? "Chargement..." : "📡 Actualiser"}
        </Button>
        <Button
          variant={viewMode === "card" ? "default" : "secondary"}
          onClick={() => setViewMode("card")}
        >
          📺 Cartes
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "secondary"}
          onClick={() => setViewMode("list")}
        >
          📄 Liste
        </Button>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {filteredArticles.length === 0 && !loading && (
        <p className="text-muted-foreground">Aucune actualité à afficher.</p>
      )}

      {/* MODE CARD */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map(a => (
            <div key={a.id} className="bg-white shadow rounded overflow-hidden flex flex-col">
              {a.image && (
                <img
                  src={a.image} // accepte URL distant ou chemin local
                  alt={a.title}
                  className="w-full aspect-[16/9] object-cover"
                  loading="lazy"
                />
              )}
              <div className="p-4 flex flex-col flex-1 gap-2">
                <h2 className="text-lg font-semibold line-clamp-2">{a.title}</h2>
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {a.description}
                </p>
                <p className="text-sm">{a.dateFormatted}</p>
                <p className="text-xs italic text-muted-foreground">
                  Source : {a.source}
                </p>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700"
                >
                  Lire l’article →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODE LIST */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {filteredArticles.map(a => (
            <div key={a.id} className="flex gap-4 p-4 border rounded bg-white shadow-sm">
              {a.image && (
                <img
                  src={a.image}
                  alt={a.title}
                  className="w-24 h-24 object-cover rounded"
                  loading="lazy"
                />
              )}
              <div className="flex flex-col gap-1">
                <h2 className="font-semibold">{a.title}</h2>
                <p className="text-sm text-blue-600">{a.dateFormatted}</p>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {a.description}
                </p>
                <p className="text-xs italic">Source : {a.source}</p>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline text-sm"
                >
                  Lire →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
