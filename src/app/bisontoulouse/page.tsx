"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Axis {
  Name: string;
  Status: string;
  Message: string;
}

export default function BisonToulousePage() {
  const [axes, setAxes] = useState<Axis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bisontoulouse");
      if (!res.ok) throw new Error("Impossible de récupérer les données");
      const data = await res.json();
      setAxes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4">🚦 Circulation Toulouse - Bison Futé</h1>
      <Button onClick={loadData} disabled={loading}>
        {loading ? "Chargement..." : "Actualiser"}
      </Button>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      <ul className="mt-4 space-y-2">
        {axes.map((a, i) => (
          <li key={i} className="p-3 border rounded bg-white shadow-sm">
            <p className="font-semibold">{a.Name}</p>
            <p>{a.Status}</p>
            <p className="text-sm text-muted-foreground">{a.Message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
