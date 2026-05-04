"use client";

import React, { useState } from 'react';
import { MapPin, Calendar, Clock, Send, Info } from 'lucide-react';

export default function RueBornierPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/ruebornier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) setStatus('success');
      else setStatus('error');
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Prendre Rendez-vous</h1>
          <p className="text-slate-500 mt-2">📍 4, rue Bornier, 31000 Toulouse (JF55+8MF)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire - 2 colonnes sur large */}
          <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nom complet</label>
                  <input name="name" type="text" required placeholder="Jean Dupont" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                  <input name="email" type="email" required placeholder="jean@exemple.com" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                  <input name="date" type="date" required className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Heure</label>
                  <input name="time" type="time" required className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {status === 'loading' ? 'Traitement...' : <><Send size={18}/> Confirmer la demande</>}
              </button>

              {status === 'success' && <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 text-center">Votre demande a bien été envoyée.</div>}
              {status === 'error' && <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-center">Une erreur est survenue. Veuillez réessayer.</div>}
            </form>
          </div>

          {/* Sidebar Info & Carte */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Info size={18} className="text-indigo-600"/> Localisation
              </h3>
              <div className="aspect-square w-full rounded-lg overflow-hidden border border-slate-100 mb-4">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2889.2818619623694!2d1.448557376642784!3d43.60064497110599!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12aebb6325555555%3A0x12aebb6325555555!2s4%20Rue%20Bornier%2C%2031000%20Toulouse!5e0!3m2!1sfr!2sfr!4v1714810000000!5m2!1sfr!2sfr"
                ></iframe>
              </div>
              <a 
                href="https://maps.app.goo.gl/wT9v52fWhH5guw5c9"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-2 transition-colors"
              >
                <MapPin size={16}/> Voir sur Google Maps
              </a>
            </div>

            <div className="bg-indigo-900 p-6 rounded-xl text-white shadow-sm">
              <h3 className="font-bold mb-2 flex items-center gap-2"><Clock size={18}/> Horaires d'ouverture</h3>
              <ul className="text-sm text-indigo-100 space-y-1">
                <li className="flex justify-between"><span>Lundi - Vendredi</span> <span>08:30 - 19:00</span></li>
                <li className="flex justify-between"><span>Samedi</span> <span>09:00 - 12:00</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
