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

export default function HotelDieuPage() {
  const [cours, setCours] = useState<Cour[]>([]);

  useEffect(() => {
    fetch('/api/hoteldieu')
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
      
      <h1 className="text-3xl font-bold mb-6 text-blue-800">Plan des Cours - Hôtel-Dieu Saint-Jacques</h1>
      
      {/* Simulation visuelle du plan en grille */}
      <div className="grid grid-cols-2 gap-4 bg-gray-200 p-4 rounded-xl shadow-inner border-4 border-blue-200">
        {cours.map((cour) => (
          <div 
            key={cour.id} 
            className={`p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center min-h-[150px]
              ${cour.nom.includes('Honneur') ? 'col-span-2 bg-blue-50 border-2 border-blue-400' : 'bg-white'}`}
          >
            <span className="font-bold text-lg text-blue-900">{cour.nom}</span>
            <span className="text-sm text-gray-500 italic">{cour.position}</span>
            <p className="text-xs mt-2 text-gray-600 leading-relaxed">{cour.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-sm text-gray-700 bg-amber-50 p-4 rounded-md border border-amber-200">
        <p><strong>Note historique :</strong> La Cour d'Honneur est le point d'entrée monumental. La Cour du Pèlerin et la Cour de la Pharmacie sont historiquement tournées vers le fleuve (la Garonne se situe à droite du plan).</p>
      </div>
    </div>
  );
}
