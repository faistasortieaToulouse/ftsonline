"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function GeoMondePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/geomonde")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  if (!data) {
    return (
      <main className="p-8">
        <p>Chargement des données géographiques...</p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-7xl mx-auto">
      {/* Bouton retour */}
      <Link
        href="/"
        className="inline-block mb-8 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition"
      >
        ← Retour à l'accueil
      </Link>

      <h1 className="text-3xl font-bold mb-10">
        Exploration Géographique Mondiale
      </h1>

      {/* On boucle sur les grandes catégories (Géographie physique, Infrastructures, etc.) */}
      {Object.entries(data).map(([sectionTitle, sectionContent]: any) => (
        <section key={sectionTitle} className="mb-16">
          <h2 className="text-2xl font-bold mb-8 capitalize border-b-2 border-slate-200 pb-2 text-slate-800">
            {sectionTitle.replace(/_/g, " ")}
          </h2>

          <div className="space-y-10">
            {/* Si le contenu est un objet (contient des sous-catégories comme 'lacs', 'ponts') */}
            {typeof sectionContent === "object" && !Array.isArray(sectionContent) ? (
              Object.entries(sectionContent).map(([subTitle, items]: any) => (
                <div key={subTitle}>
                  <h3 className="text-xl font-semibold mb-4 capitalize text-blue-700">
                    {subTitle.replace(/_/g, " ")}
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item: any, index: number) => (
                      <CardItem key={index} item={item} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              /* Si le contenu est directement une liste (comme 'patrimoine_funeraire') */
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sectionContent.map((item: any, index: number) => (
                  <CardItem key={index} item={item} />
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
    </main>
  );
}

// Composant Carte pour éviter la répétition
function CardItem({ item }: { item: any }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 border rounded-xl shadow-sm bg-white hover:border-blue-500 hover:shadow-md transition group"
    >
      <h4 className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition">
        {item.titre}
      </h4>
      <p className="text-xs text-blue-400 mt-2">Consulter sur Wikipedia →</p>
    </a>
  );
}
