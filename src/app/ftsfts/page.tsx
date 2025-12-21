'use client';

import Link from "next/link";

export default function FTSFTS() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50 flex flex-col items-center justify-start p-6">
      <section className="bg-pink-500 text-white rounded-3xl shadow-lg p-10 max-w-2xl w-full text-center mb-8">
        <h1 className="text-4xl font-bold mb-6">Fais Ta Sortie À Toulouse</h1>
        <p className="mb-8 text-lg">
          Retrouvez toutes les sorties, événements et activités à Toulouse sur notre site dédié !
        </p>
        <a
          href="https://www.faistasortieatoulouse.online/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-white text-pink-600 font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-pink-100 transition"
        >
          Accéder à Fais Ta Sortie A Toulouse
        </a>
      </section>

      <Link
        href="/"
        className="mt-6 text-purple-700 font-medium hover:underline"
      >
        Retour à l’accueil
      </Link>
    </div>
  );
}
