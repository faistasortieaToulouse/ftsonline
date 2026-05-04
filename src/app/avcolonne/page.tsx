"use client";

import React, { useState } from 'react';
import { MapPin, Calendar, Clock, Send, Info, PlaneTakeoff } from 'lucide-react';
import Image from 'next/image';

export default function AppointmentPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/avcolonne', {
        method: 'POST',
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
        
        {/* En-tête : Logo et Langue */}
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <PlaneTakeoff className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">FTS <span className="font-light text-gray-600">Online</span></span>
          </div>
          <div className="flex items-center gap-3 bg-gray-100 p-1 rounded-full text-sm">
            <button className="px-4 py-1 rounded-full flex items-center gap-1.5"><Image src="/france.png" alt="France" width={16} height={11} /> Français</button>
            <button className="px-4 py-1 rounded-full flex items-center gap-1.5"><Image src="/united-kingdom.png" alt="UK" width={16} height={11} /> English</button>
            <button className="px-4 py-1 rounded-full bg-blue-600 text-white shadow-sm">ES</button>
          </div>
        </div>

        {/* Titre et Localisation */}
        <div className="flex items-start gap-3 mb-8">
          <MapPin className="w-10 h-10 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h1 className="text-3xl font-extrabold text-gray-950 sm:text-4xl">
              Point de RDV : Colonne
            </h1>
            <p className="mt-1.5 text-lg text-gray-600">
              26 Av. de la Colonne, 31500 Toulouse
            </p>
          </div>
        </div>

        {/* Section Attention ! */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-xl mb-10 text-amber-900 shadow-inner">
          <div className="flex items-center gap-3 mb-3">
            <Info className="w-6 h-6 text-amber-500" />
            <h3 className="text-lg font-bold">Attention !</h3>
          </div>
          <p className="text-sm">Veuillez bien vérifier l&apos;adresse du point de rendez-vous. La Colonne est située juste au-dessus du parking.</p>
          <p className="text-sm mt-2 font-medium">Repères : Nous serons devant l&apos;entrée principale du bâtiment de l&apos;association.</p>
        </div>

        {/* Carte et Infos */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-8 mb-10">
          
          {/* Section Carte */}
          <div className="relative group">
            <div className="aspect-[2/1] rounded-2xl overflow-hidden border-4 border-white shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2888.947294820464!2d1.459747976643178!3d43.60762297110439!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12aebb796677f597%3A0xc074719c8f000000!2s26%20Av.%20de%20la%20Colonne%2C%2031500%20Toulouse!5e0!3m2!1sfr!2sfr!4v1714800000000!5m2!1sfr!2sfr"
              ></iframe>
            </div>
          </div>

          {/* Bouton Google Maps et Coordonnées */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <a 
              href="https://maps.app.goo.gl/z7HTdBucuYMAd9Bf9" 
              target="_blank" 
              className="inline-flex items-center gap-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-10 rounded-full transition-colors shadow-md hover:shadow-lg"
            >
              <Send size={20} className="transform -rotate-45" />
              Y aller avec Google Maps
            </a>
            
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
              <Clock size={20} className="text-gray-400" />
              <div>
                <span className="block font-semibold text-gray-900">Lun - Ven : 09h - 18h</span>
                <span className="text-sm text-gray-500">Heures d&apos;ouverture de l&apos;accueil</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire de prise de rendez-vous */}
        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            Réserver votre créneau horaire
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nom complet</label>
                <input name="name" type="text" required placeholder="Votre nom..." className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 p-4 shadow-inner" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input name="email" type="email" required placeholder="votre@email.com" className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 p-4 shadow-inner" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date souhaitée</label>
                <input name="date" type="date" required className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 p-4 shadow-inner" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Heure</label>
                <input name="time" type="time" required className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 p-4 shadow-inner" />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full inline-flex justify-center items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 px-10 rounded-2xl transition-colors shadow-lg disabled:opacity-50"
            >
              {status === 'loading' ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
                  Envoi en cours...
                </>
              ) : (
                'Confirmer le rendez-vous'
              )}
            </button>

            {status === 'success' && <p className="text-green-700 font-medium text-center bg-green-50 p-4 rounded-xl border border-green-200">Rendez-vous envoyé avec succès ! Nous vous recontacterons bientôt.</p>}
            {status === 'error' && <p className="text-red-700 font-medium text-center bg-red-50 p-4 rounded-xl border border-red-200">Une erreur est survenue lors de l&apos;envoi. Veuillez réessayer.</p>}
          </form>
        </div>

      </div>
    </div>
  );
}
