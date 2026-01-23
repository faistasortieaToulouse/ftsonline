'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Plante {
  nom_scientifique: string;
  nom_commun: string;
  famille: string;
  statut: string | null;
  abondance: string | null;
  nom_occitan: string | null;
  herbier_mhnt: string | null;
  carpotheque_mhnt: string | null;
  dates_et_lieux_d_observations: string;
  date: string | null;
  image: string | null;
  url: string | null;
  credits: string | null;
  autre_date: string | null;
}

export default function FlorePage() {
  const [plantes, setPlantes] = useState<Plante[]>([]);

  useEffect(() => {
    fetch("/api/flore")
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        // Tri par nom commun
        const plantesTriees = data.sort((a: Plante, b: Plante) => {
          const nomA = (a.nom_commun ?? "").toLowerCase();
          const nomB = (b.nom_commun ?? "").toLowerCase();
          return nomA.localeCompare(nomB);
        });
        setPlantes(plantesTriees);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <h1 className="text-3xl font-extrabold mb-2 text-green-700">
        🌿 Inventaire de la flore sauvage en milieu urbain - Toulouse ({plantes.length})
      </h1>

      {/* Légende des codes d'abondance */}
      <div className="mb-4 p-4 bg-green-100 rounded">
        <strong>Légende Abondance :</strong>
        <ul className="list-disc ml-5">
          <li><strong>RR</strong> : Très rare</li>
          <li><strong>R</strong> : Rare</li>
          <li><strong>PC</strong> : Peu commune</li>
          <li><strong>C</strong> : Commune</li>
        </ul>
      </div>

      <table className="w-full border border-collapse">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Nom commun</th>
            <th className="border p-2">Nom scientifique</th>
            <th className="border p-2">Famille</th>
            <th className="border p-2">Abondance</th>
            <th className="border p-2">Observations / Lieux</th>
            <th className="border p-2">Image</th>
          </tr>
        </thead>
        <tbody>
          {plantes.map((p, idx) => (
            <tr key={idx} className="hover:bg-gray-100">
              <td className="border p-2">{p.nom_commun || "-"}</td>
              <td className="border p-2">{p.nom_scientifique}</td>
              <td className="border p-2">{p.famille}</td>
              <td className="border p-2">{p.abondance ?? "-"}</td>
              <td className="border p-2">{p.dates_et_lieux_d_observations}</td>
              <td className="border p-2">
                {p.image && p.url ? (
                  <a href={p.url} target="_blank" rel="noopener noreferrer">
                    <img src={p.url} alt={p.nom_commun} className="w-24 h-auto rounded" />
                  </a>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
