"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, ExternalLink, Bookmark } from "lucide-react";

export default function CommunautePage() {
  const [links, setLinks] = useState([]);

  useEffect(() => {
    fetch("/api/communautes").then(res => res.json()).then(setLinks);
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-900 font-bold transition-all">
            <ArrowLeft size={20} /> Retour à l'accueil
          </Link>
        </nav>

        <header className="bg-purple-700 rounded-2xl p-8 mb-8 text-white shadow-lg">
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Users size={32} /> Communautés : Sorties et Culture
          </h1>
          <p className="text-purple-100 mt-2">Partagez vos passions et rejoignez les réseaux locaux.</p>
        </header>

        <div className="grid gap-6">
          {links.map((link: any) => (
            <a key={link.id} href={link.url} target="_blank" className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all">
              <div className="p-6 flex items-start gap-4">
                <div className="bg-purple-50 p-3 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Bookmark size={24} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-800">{link.title}</h2>
                  <p className="text-slate-500 text-sm mt-1">{link.description}</p>
                </div>
                <ExternalLink className="text-slate-300" size={20} />
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
