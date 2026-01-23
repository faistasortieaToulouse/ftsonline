'use client';
import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Event {
  id: number;
  debut: string;
  fin: string;
  description: string;
}

export default function CapitaleToulousePage() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch('/api/capitale_toulouse')
      .then((res) => res.json())
      .then((data: Event[]) => setEvents(data));
  }, []);

  if (!events || events.length === 0) {
    return <div className="p-10 text-center font-bold">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2 uppercase">
            Chronologie de Toulouse
          </h1>
          <p className="text-gray-500 uppercase tracking-widest text-sm font-bold italic">
            De l’Antiquité à nos jours
          </p>
        </header>

        <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th className="p-3 border-b border-gray-300 text-left text-sm font-bold">Début</th>
                <th className="p-3 border-b border-gray-300 text-left text-sm font-bold">Fin</th>
                <th className="p-3 border-b border-gray-300 text-left text-sm font-bold">Capitale / Description</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-100 transition-colors">
                  <td className="p-3 border-b border-gray-200">{event.debut}</td>
                  <td className="p-3 border-b border-gray-200">{event.fin || ''}</td>
                  <td className="p-3 border-b border-gray-200">{event.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
