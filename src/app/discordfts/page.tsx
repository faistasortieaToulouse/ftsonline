'use client';

import Link from "next/link";

export default function DiscordFTS() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 flex flex-col items-center justify-start p-6">
      <section className="bg-purple-500 text-white rounded-3xl shadow-lg p-10 max-w-2xl w-full text-center mb-8">
        <h1 className="text-4xl font-bold mb-6">Fais Ta Sortie À Toulouse - Discord</h1>
        <p className="mb-8 text-lg">
          Rejoignez notre serveur Discord pour suivre toutes les sorties et événements à Toulouse !
        </p>
        <a
          href="https://discord.com/channels/1419282910019719331/1419282911982518285"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-white text-purple-700 font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-purple-100 transition"
        >
          Accéder au Discord
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
