"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Languages } from "lucide-react";

export default function LanguesPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/langues")
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
        <Languages className="text-indigo-600" size={36} /> 
        Linguistique et Diversité des Langues
      </h1>

      <div className="space-y-12">
        {data.map((section: any, idx: number) => (
          <div key={idx}>
            <h2 className="text-2xl font-bold mb-4 text-slate-800 border-l-4 border-indigo-500 pl-4">
              {section.category}
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {section.links.map((link: any, i: number) => (
                <li key={i}>
                  <a 
                    href={link.url} 
                    target="_blank" 
                    className="block p-4 border rounded-lg bg-slate-50 hover:bg-indigo-600 hover:text-white transition-all shadow-sm font-medium text-center"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}