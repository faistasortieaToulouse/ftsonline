"use client";
import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Cour {
  id: number;
  nom: string;
  position: string;
  description: string;
}

export default function LaGravePage() {
  const [cours, setCours] = useState<Cour[]>([]);

  useEffect(() => {
    fetch('/api/lagrave')
      .then(res => res.json())
      .then(data => setCours(data));
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <h1 className="text-3xl font-bold mb-6 text-red-800">Plan des Cours - Hôpital La Grave</h1>
      
      {/* Simulation visuelle du plan en grille */}
      <div className="grid grid-cols-2 gap-4 bg-gray-200 p-4 rounded-xl shadow-inner border-4 border-orange-200">
        {cours.map((cour) => (
          <div 
            key={cour.id} 
            className={`p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center min-h-[150px]
              ${cour.nom.includes('Joseph') ? 'col-span-2 bg-amber-100 border-2 border-amber-500' : 'bg-white'}`}
          >
            <span className="font-bold text-lg">{cour.nom}</span>
            <span className="text-sm text-gray-500 italic">{cour.position}</span>
            <p className="text-xs mt-2 text-gray-600">{cour.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-sm text-gray-700 bg-blue-50 p-4 rounded-md">
        <p><strong>Note :</strong> La Cour Saint-Joseph est centrale et abrite la Chapelle. Les cours Sainte-Anne et Saint-Vincent bordent la Garonne (à droite sur ce plan simplifié).</p>
      </div>
    </div>
  );
}
