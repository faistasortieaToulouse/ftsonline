"use client";

import LibrairiesClient from "@/components/LibrairiesClient";

export default function Page() {
return ( <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans"> <header className="max-w-4xl mx-auto mb-10"> <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
Podcasts des Librairies Toulousaines </h1> <p className="text-lg text-gray-600">
Rencontres et conférences des librairies Ombres Blanches, Terra Nova, Marathon des mots et Librairie Mollat. </p> </header>

  <main className="max-w-4xl mx-auto">
    <LibrairiesClient />
  </main>

  <footer className="max-w-4xl mx-auto mt-10 text-center text-sm text-gray-400">
    <p>Intégration des flux audio pour une expérience centralisée.</p>
    <p className="mt-2">© {new Date().getFullYear()} Librairies Toulousaines</p>
  </footer>
</div>

);
}
