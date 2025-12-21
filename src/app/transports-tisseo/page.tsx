'use client';

import Link from "next/link";

export default function TransportsTisseo() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 flex flex-col items-center justify-center p-6">
      <section className="bg-gray-300 text-gray-800 rounded-3xl shadow-lg p-10 max-w-2xl w-full text-center mb-8">
        <h1 className="text-4xl font-bold mb-6">Transports Tisséo</h1>
        <p className="text-lg">
          🚧 Cette page est en cours de construction. 🚧
        </p>
      </section>

      <Link
        href="/"
        className="mt-6 text-gray-700 font-medium hover:underline"
      >
        Retour à l’accueil
      </Link>
    </div>
  );
}
