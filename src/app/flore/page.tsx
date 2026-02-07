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
  dates_et_lieux_d_observations: string;
  url: string | null;
}

export default function FlorePage() {
  const [plantes, setPlantes] = useState<Plante[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/flore")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const triees = data.sort((a, b) => 
            (a.nom_commun ?? "").localeCompare(b.nom_commun ?? "")
          );
          setPlantes(triees);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur API:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-4 max-w-7xl mx-auto min-h-screen bg-white">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <h1 className="text-2xl md:text-3xl font-extrabold mb-4 text-green-700">
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

      <div className="overflow-hidden shadow-md border rounded-xl bg-white">
        <table className="w-full border-collapse table-fixed md:table-auto">
          <thead className="bg-gray-50">
            <tr className="text-gray-600 text-sm">
              <th className="p-3 text-left w-5/12 md:w-auto">Nom commun</th>
              <th className="p-3 text-left hidden md:table-cell">Nom scientifique</th>
              <th className="p-3 text-left hidden md:table-cell">Famille</th>
              <th className="p-3 text-center hidden md:table-cell">Abondance</th>
              <th className="p-3 text-left w-7/12 md:w-auto">Observations</th>
              <th className="p-3 text-center hidden md:table-cell">Image</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="p-10 text-center text-gray-400">Chargement de la flore...</td></tr>
            ) : plantes.length === 0 ? (
              <tr><td colSpan={6} className="p-10 text-center text-gray-400">Aucune plante trouvée.</td></tr>
            ) : (
              plantes.map((p, idx) => (
                <PlanteRow key={idx} plante={p} />
              ))
            )}
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
        className="hover:bg-green-50/40 cursor-pointer md:cursor-default transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <td className="p-3 font-semibold text-green-800 align-top text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <span className="break-words">{plante.nom_commun || "Inconnu"}</span>
            {plante.url && <ImageIcon size={14} className="text-green-500 md:hidden flex-shrink-0" />}
          </div>
        </td>
        
        <td className="p-3 italic text-gray-500 hidden md:table-cell align-top text-sm">{plante.nom_scientifique}</td>
        <td className="p-3 text-gray-500 hidden md:table-cell align-top text-sm">{plante.famille}</td>
        <td className="p-3 text-center hidden md:table-cell align-top">
           <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold uppercase">{plante.abondance ?? "-"}</span>
        </td>

        <td className="p-3 text-xs md:text-sm text-gray-600 align-top">
          <div className="flex items-start justify-between gap-2">
            <span className="break-words whitespace-normal leading-relaxed overflow-hidden">
              {plante.dates_et_lieux_d_observations}
            </span>
            <span className="md:hidden flex-shrink-0 text-gray-400">
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </div>
        </td>

        <td className="p-3 text-center hidden md:table-cell align-top">
          {plante.url && (
            <img src={plante.url} alt="" className="w-12 h-10 object-cover rounded shadow-sm mx-auto" />
          )}
        </td>
      </tr>

      {isOpen && (
        <tr className="md:hidden bg-green-50/20">
          <td colSpan={2} className="p-4 space-y-3">
            <div className="text-xs space-y-1.5 border-l-2 border-green-200 pl-3">
              <p><strong>Scientifique :</strong> <span className="italic">{plante.nom_scientifique}</span></p>
              <p><strong>Famille :</strong> {plante.famille}</p>
              <p><strong>Abondance :</strong> {plante.abondance ?? "Inconnue"}</p>
            </div>
            {plante.url && (
              <img src={plante.url} className="w-full h-40 object-cover rounded-lg shadow-inner" alt="" />
            )}
          </td>
        </tr>
      )}
    </>
  );
}