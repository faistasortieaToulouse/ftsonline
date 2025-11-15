"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TestAPIPage() {
  const [loading, setLoading] = useState(false);
  const [raw, setRaw] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function testAPI() {
    setLoading(true);
    setError(null);
    setRaw(null);

    try {
      const res = await fetch(
        "https://data.haute-garonne.fr/api/explore/v2.1/catalog/datasets/evenements-publics/records?limit=20"
      );

      if (!res.ok) {
        throw new Error("API HTTP error : " + res.status);
      }

      const data = await res.json();
      setRaw(data);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4">Test API Haute-Garonne</h1>
      <p className="text-muted-foreground mb-6">
        Cette page teste en direct la récupération des données depuis l’API officielle.
      </p>

      <Button onClick={testAPI} disabled={loading}>
        {loading ? "Chargement..." : "📡 Tester maintenant"}
      </Button>

      {error && (
        <div className="mt-6 p-4 border border-red-500 bg-red-50 text-red-700 rounded">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {raw && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Résultat JSON brut</h2>
          <pre className="bg-muted p-4 rounded overflow-auto text-sm max-h-[300px]">
            {JSON.stringify(raw, null, 2)}
          </pre>

          <h2 className="text-2xl font-semibold mt-10 mb-4">Champs extraits</h2>

          {raw.results && raw.results.length > 0 ? (
            <table className="w-full border-collapse mt-4">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Titre</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Lieu</th>
                </tr>
              </thead>
              <tbody>
                {raw.results.map((event: any, i: number) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{event.titre || "—"}</td>
                    <td className="p-2">{event.description || "—"}</td>
                    <td className="p-2">{event.date || event.date_debut || "—"}</td>
                    <td className="p-2">{event.commune || event.lieu || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Aucun résultat exploitable.</p>
          )}
        </div>
      )}
    </div>
  );
}
