"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ZoneEconomiquePage() {

  const [zones, setZones] = useState<any>(null);

  useEffect(() => {
    fetch("/api/zoneeconomique")
      .then((res) => res.json())
      .then((data) => setZones(data.zones_libre_echange));
  }, []);

  if (!zones) {
    return (
      <main className="p-8">
        <p>Chargement...</p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-7xl mx-auto">

      {/* bouton retour */}
      <Link
        href="/"
        className="inline-block mb-8 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition"
      >
        ← Retour à l'accueil
      </Link>

      <h1 className="text-3xl font-bold mb-10">
        Grandes zones de libre-échange dans le monde
      </h1>

      {Object.entries(zones).map(([continent, liste]: any) => (
        <section key={continent} className="mb-12">

          <h2 className="text-2xl font-semibold mb-6 capitalize">
            {continent.replace("_", " ")}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {liste.map((zone: any, index: number) => (

              <div
                key={index}
                className="border rounded-xl p-5 shadow-sm bg-white hover:shadow-md transition"
              >
                <h3 className="text-xl font-bold">
                  {zone.nom}
                </h3>

                <p className="text-sm text-gray-500 mb-2">
                  {zone.signification}
                </p>

                <p>
                  <strong>Création :</strong> {zone.creation}
                </p>

                <p>
                  <strong>Membres :</strong> {zone.membres}
                </p>

                <p className="mt-2 text-sm">
                  <strong>Objectif :</strong> {zone.objectif}
                </p>

              </div>

            ))}

          </div>

        </section>
      ))}

    </main>
  );
}
