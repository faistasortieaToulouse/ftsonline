// src/app/podmat/page.tsx

'use client'

import React from 'react';

// Ce composant est désactivé car la page principale
// src/app/librairies/page.tsx agrège désormais tous les podcasts,
// y compris le Marathon des Mots.
// L'ancienne route /api/podmat n'est plus utilisée.

export default function PodmatPage() {
  return (
    <main className="p-8 max-w-4xl mx-auto bg-red-50 min-h-screen">
      <div className="text-center p-10 border-4 border-red-300 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold mb-4 text-red-700">Page Obsolete</h1>
        <p className="text-lg text-red-600">
          Cette page a été désactivée. Le contenu des podcasts du Marathon des Mots (Podmat)
          est désormais disponible sur la page principale des librairies,
          qui agrège toutes les sources :
        </p>
        <a 
          href="/librairies" 
          className="inline-block mt-6 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-150 shadow-md"
        >
          Aller à la page Librairies
        </a>
      </div>
    </main>
  );
}
