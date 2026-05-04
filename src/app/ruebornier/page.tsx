"use client";

import React, { useState } from 'react';
import { MapPin, Calendar, Clock, Send, Info, PlaneTakeoff } from 'lucide-react';
import Image from 'next/image';

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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        
        {/* En-tête : Style FTS Online */}
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <PlaneTakeoff className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">FTS <span className="font-light text-gray-600">Online</span></span>
          </div>
          <div className="hidden sm:flex items-center gap-3 bg-gray-100 p-1 rounded-full text-sm">
            <button className="px-4 py-1 rounded-full flex items-center gap-1.5 hover:bg-white transition-all text-gray-600">Français</button>
            <button className="px-4 py-1 rounded-full bg-indigo-600 text-white shadow-sm">FR</button>
          </div>
        </div>

        {/* Titre et Localisation - Reprend le style visuel rouge de Jolimont */}
        <div className="flex items-start gap-3 mb-8">
          <MapPin className="w-10 h-10 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h1 className="text-3xl font-extrabold text-gray-950 sm:text-4xl">
              Point de RDV : Rue Bornier
            </h1>
            <p className="mt-1.5 text-lg text-gray-600">
              4, rue Bornier, 31000 Toulouse (JF55+8MF)
            </p>
          </div>
        </div>

        {/* Bloc Attention ! - Identique au style RdvJolimont.jpg */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-xl mb-10 text-amber-900 shadow-inner">
          <div className="flex items-center gap-3 mb-3">
            <Info className="w-6 h-6 text-amber-500" />
            <h3 className="text-lg font-bold uppercase tracking-wide">Attention !</h3>
          </div>
          <p className="text-sm leading-relaxed">
            La rue Bornier est une petite rue calme. Assurez-vous de bien repérer le numéro 4. 
            <br />
            <span className="font-bold">Nous serons au niveau de l&apos;entrée du bâtiment.</span>
          </p>
          <p className="text-sm mt-2 italic">
            Repères : Situé dans le secteur entre le canal du Midi et le quartier des Chalets.
          </p>
        </div>

        {/* Carte Interactive - Grand format style Jolimont */}
        <div className="mb-10 relative">
          <div className="aspect-[2/1] w-full rounded-2xl overflow-hidden border-4 border-white shadow-lg">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2889.2818619623694!2d1.448557376642784!3d43.60064497110599!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12aebb6325555555%3A0x12aebb6325555555!2s4%20Rue%20Bornier%2C%2031000%20Toulouse!5e0!3m2!1sfr!2sfr!4v1714810000000!5m2!1sfr!2sfr"
            ></iframe>
          </div>
        </div>

        {/* Boutons d'Action et Coordonnées */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <a 
            href="https://maps.app.goo.gl/wT9v52fWhH5guw5c9" 
            target="_blank" 
            className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 px-8 rounded-2xl transition-all shadow-md hover:shadow-xl active:scale-95"
          >
            <Send size={22} className="transform -rotate-45" />
            Y aller avec Google Maps
          </a>
          
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <Clock className="text-gray-400" size={24} />
              <div>
                <span className="block font-bold text-gray-900 italic">HORAIRES</span>
                <span className="text-sm text-gray-600 uppercase">Lun-Ven: 08:30 - 19:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire de Contact Stylisé */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm border-t-4 border-t-indigo-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-indigo-600" />
            Planifier votre venue
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Nom complet</label>
                <input name="name" type="text" required placeholder="Ex: Jean Dupont" className="w-full rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-50 p-4 transition-all outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Email de contact</label>
                <input name="email" type="email" required placeholder="votre@email.com" className="w-full rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-50 p-4 transition-all outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Date</label>
                <input name="date" type="date" required className="w-full rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-50 p-4 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Heure</label>
                <input name="time" type="time" required className="w-full rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-50 p-4 outline-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-slate-900 hover:bg-black text-white font-extrabold py-5 px-10 rounded-2xl transition-all shadow-lg disabled:opacity-50 uppercase tracking-widest"
            >
              {status === 'loading' ? 'Envoi en cours...' : 'Envoyer ma demande'}
            </button>

            {status === 'success' && <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 text-center font-bold">Votre demande de rendez-vous a été transmise !</div>}
            {status === 'error' && <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-center font-bold">Erreur lors de l&apos;envoi. Réessayez plus tard.</div>}
          </form>
        </div>

      </div>
    </div>
  );
}
