"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Caste = {
  type: string;
  description: string;
  prestige: string;
};

export default function TypeNoblessePage() {
  const [castes, setCastes] = useState<Caste[]>([]);

  useEffect(() => {
    fetch("/api/typeNoblesse")
      .then((res) => res.json())
      .then(setCastes)
      .catch((err) => {
        console.error("Erreur fetch :", err);
        setCastes([]);
      });
  }, []);

  return (
    <main className="p-6">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-2xl font-bold mb-6">Castes de la Noblesse Française</h1>

      <div className="overflow-auto border rounded">
        <table className="min-w-full border-collapse border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">Type</th>
              <th className="border px-4 py-2 text-left">Description</th>
              <th className="border px-4 py-2 text-left">Prestige</th>
            </tr>
          </thead>
          <tbody>
            {castes.map((caste, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{caste.type}</td>
                <td className="border px-4 py-2">{caste.description}</td>
                <td className="border px-4 py-2">{caste.prestige}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
