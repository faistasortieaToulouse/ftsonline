'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";

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
      
      <h1 className="text-3xl font-extrabold mb-4 text-green-700">
        🌿 Flore sauvage de Toulouse ({plantes.length})
      </h1>

      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm">
        <span className="font-bold text-green-800">Codes Abondance :</span>
        <div className="flex flex-wrap gap-4 mt-1 italic text-green-700">
          <span><strong>RR</strong> : Très rare</span>
          <span><strong>R</strong> : Rare</span>
          <span><strong>PC</strong> : Peu commune</span>
          <span><strong>C</strong> : Commune</span>
        </div>
      </div>

      <div className="overflow-hidden shadow-sm border rounded-lg bg-white">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border-b p-3 text-left">Nom commun</th>
              <th className="border-b p-3 text-left hidden md:table-cell">Nom scientifique</th>
              <th className="border-b p-3 text-left hidden md:table-cell">Famille</th>
              <th className="border-b p-3 text-center hidden md:table-cell">Abondance</th>
              <th className="border-b p-3 text-left">Observations / Lieux</th>
              <th className="border-b p-3 text-center hidden md:table-cell">Image</th>
            </tr>
          </thead>
          <tbody>
            {plantes.map((p, idx) => (
              <PlanteRow key={idx} plante={p} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlanteRow({ plante }: { plante: Plante }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <tr 
        className="hover:bg-green-50/50 cursor-pointer md:cursor-default transition-colors border-b border-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <td className="p-3 font-semibold text-green-800">
          <div className="flex items-center gap-2">
            {plante.nom_commun || "Inconnu"}
            {plante.url && <ImageIcon size={14} className="text-green-500 md:hidden" />}
          </div>
        </td>
        <td className="p-3 italic text-gray-600 hidden md:table-cell">{plante.nom_scientifique}</td>
        <td className="p-3 text-gray-600 hidden md:table-cell">{plante.famille}</td>
        <td className="p-3 text-center hidden md:table-cell">
           <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold">{plante.abondance ?? "-"}</span>
        </td>
        <td className="p-3 text-sm text-gray-700">
          <div className="flex items-center justify-between">
            <span className="line-clamp-2 md:line-clamp-none">{plante.dates_et_lieux_d_observations}</span>
            <span className="md:hidden ml-2">
              {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </span>
          </div>
        </td>
        <td className="p-3 text-center hidden md:table-cell">
          {plante.url ? (
            <a href={plante.url} target="_blank" rel="noopener noreferrer">
              <img src={plante.url} alt={plante.nom_commun} className="w-16 h-12 object-cover rounded shadow-sm hover:scale-110 transition-transform" />
            </a>
          ) : "-"}
        </td>
      </tr>

      {/* Accordéon Mobile */}
      {isOpen && (
        <tr className="md:hidden bg-green-50/30">
          <td colSpan={3} className="p-4 border-b border-green-100">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1 text-sm">
                <p><strong>Scientifique :</strong> <span className="italic">{plante.nom_scientifique}</span></p>
                <p><strong>Famille :</strong> {plante.famille}</p>
                <p><strong>Abondance :</strong> {plante.abondance ?? "Non renseigné"}</p>
              </div>
              
              {plante.url && (
                <div className="mt-2">
                  <p className="text-[10px] uppercase font-bold text-green-800 mb-1">Aperçu :</p>
                  <img src={plante.url} alt={plante.nom_commun} className="w-full max-h-48 object-cover rounded-lg shadow-md" />
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}