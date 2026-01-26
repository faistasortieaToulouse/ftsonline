"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Languages, Share2, BookOpen, ExternalLink } from "lucide-react";

export default function CommunautesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/communautes")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <div className="p-10 text-center text-purple-600 font-bold">Connexion aux communautés...</div>;

  const SectionHeader = ({ icon: Icon, title, color }: any) => (
    <div className="flex items-center gap-3 mb-6 mt-10">
      <div className={`p-2 rounded-lg ${color} text-white shadow-md`}>
        <Icon size={24} />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
    </div>
  );

  const Card = ({ item }: any) => (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">
            {item.type}
          </span>
          <ExternalLink size={14} className="text-slate-300 group-hover:text-purple-500 transition-colors" />
        </div>
        <h3 className="font-bold text-slate-800 group-hover:text-purple-700 mb-2">{item.title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
      </div>
    </a>
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-12">
      <div className="max-w-5xl mx-auto">
        
        <nav className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-900 font-bold transition-all group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
            Retour à l'accueil
          </Link>
        </nav>

        <header className="bg-gradient-to-br from-purple-700 to-indigo-800 rounded-3xl p-8 mb-4 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 text-center md:text-left">
            <h1 className="text-4xl font-black mb-2 flex items-center justify-center md:justify-start gap-3">
              <Users size={40} className="text-purple-200" /> Communautés <span className="text-purple-200">Toulouse</span>
            </h1>
            <p className="text-purple-100 italic opacity-90 font-medium">Échangez, apprenez et connectez-vous avec les Toulousains.</p>
          </div>
          <Share2 className="absolute -right-10 -top-10 text-white/10 w-64 h-64 rotate-12" />
        </header>

        {/* SECTION LANGUES */}
        <SectionHeader icon={Languages} title="Langues & FLE" color="bg-purple-600" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.langues.map((item: any) => <Card key={item.id} item={item} />)}
        </div>

        {/* SECTION COMMUNAUTÉS */}
        <SectionHeader icon={BookOpen} title="Réseaux & Lecture" color="bg-indigo-600" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.communautes.map((item: any) => <Card key={item.id} item={item} />)}
        </div>

        <footer className="mt-20 py-8 border-t border-slate-200 text-center">
          <p className="text-slate-400 text-xs font-medium">Portail des liens communautaires • {new Date().getFullYear()}</p>
        </footer>
      </div>
    </main>
  );
}
