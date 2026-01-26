"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";

export default function PibPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/pib")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <nav className="mb-8">
        <Link href="/" className="text-blue-600 hover:underline flex items-center gap-2">
          <ArrowLeft size={18} /> Retour
        </Link>
      </nav>

      <h1 className="text-4xl font-extrabold mb-8 flex items-center gap-3">
        <BarChart3 className="text-emerald-600" size={36} /> 
        Économie Mondiale : Statistiques PIB
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((item: any, i: number) => (
          <a 
            key={i} 
            href={item.url} 
            target="_blank" 
            className="p-6 border rounded-xl hover:shadow-xl transition-all bg-white group"
          >
            <h2 className="text-xl font-bold mb-2 group-hover:text-emerald-600 transition-colors">
              {item.title}
            </h2>
            <p className="text-gray-600 text-sm">{item.description}</p>
            <div className="mt-4 text-xs font-mono text-blue-500 uppercase tracking-widest">
              Source : Wikipédia ↗
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}