// src/components/LibrairiesClient.tsx
"use client";

import { useEffect, useState } from "react";

interface Librairie {
  name: string;
}

interface Props {
  selected: string;
  onSelect: (librairie: string) => void;
}

export default function LibrairiesClient({ selected, onSelect }: Props) {
  const [librairies, setLibrairies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLibrairies() {
      try {
        const res = await fetch("/api/podcasts");
        const data = await res.json();
        if (data.success) {
          // Extraire les noms uniques des librairies
          const unique = Array.from(new Set(data.data.map((ep: any) => ep.librairie)));
          setLibrairies(unique);
        }
      } catch (err) {
        console.error("Erreur récupération librairies:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLibrairies();
  }, []);

  if (loading) return <div>Chargement des librairies…</div>;

  return (
    <select
      value={selected}
      onChange={(e) => onSelect(e.target.value)}
      className="border p-2 rounded"
    >
      <option value="">Toutes les librairies</option>
      {librairies.map((lib) => (
        <option key={lib} value={lib}>
          {lib}
        </option>
      ))}
    </select>
  );
}
