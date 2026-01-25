"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type OrdreReligieuxPopPape = {
  id: number;
  categorie: string;
  siege: string;
  titre: string;
  description: string;
};

export default function OrdreReligieuxPopPapePage() {
  const [donnees, setDonnees] = useState<OrdreReligieuxPopPape[]>([]);

  useEffect(() => {
    fetch("/api/ordreReligieuxPopPape")
      .then((res) => res.json())
      .then(setDonnees);
  }, []);

  return (
    <main className="p-6">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-2xl font-bold mb-6">Le Pape d'Occident et Pops d'Orient</h1>

      <div className="overflow-auto border rounded">
        <table className="min-w-full border-collapse border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">ID</th>
              <th className="border px-4 py-2 text-left">Catégorie</th>
              <th className="border px-4 py-2 text-left">Siège</th>
              <th className="border px-4 py-2 text-left">Titre</th>
              <th className="border px-4 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            {donnees.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{item.id}</td>
                <td className="border px-4 py-2">{item.categorie}</td>
                <td className="border px-4 py-2">{item.siege}</td>
                <td className="border px-4 py-2">{item.titre}</td>
                <td className="border px-4 py-2">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
