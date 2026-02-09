"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, GraduationCap, ExternalLink, Compass } from "lucide-react";

export default function FormationPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/formation")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  return (
    <main className="max-w-6xl mx-auto p-6 bg-white min-h-screen">
      {/* Navigation */}
      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold mb-8 uppercase text-sm hover:underline">
        <ArrowLeft size={18} /> Retour à l'accueil
      </Link>

      <header className="mb-12">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-4">
          Formation & Orientation <Compass className="text-blue-600" size={40} />
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Guide des ressources pédagogiques et professionnelles en Haute-Garonne.</p>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-40 w-full bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.map((category, idx) => (
            <section key={idx} className="space-y-6">
              <h2 className="text-2xl font-black text-blue-700 border-b-4 border-blue-100 pb-2 flex items-center gap-2">
                {category.category === "ORIENTATION" ? <GraduationCap /> : <BookOpen />}
                {category.category}
              </h2>

              {category.sections.map((section: any, sIdx: number) => (
                <div key={sIdx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                    — {section.subTitle}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link: any, lIdx: number) => (
                      <li key={lIdx}>
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all"
                        >
                          <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                            {link.name}
                          </span>
                          <ExternalLink size={16} className="text-slate-300 group-hover:text-blue-500" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}

      <footer className="mt-16 p-8 bg-blue-50 rounded-3xl border border-blue-100 text-center">
        <p className="text-blue-800 font-bold italic">
          "L'éducation est l'arme la plus puissante pour changer le monde."
        </p>
      </footer>
    </main>
  );
}
