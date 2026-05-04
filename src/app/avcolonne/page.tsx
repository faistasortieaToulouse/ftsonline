"use client";

import React, { useState } from 'react';
import { MapPin, Calendar, Clock, Send } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Prendre rendez-vous
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            26 Av. de la Colonne, 31500 Toulouse
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Section Formulaire */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Calendar className="text-blue-600" /> Vos informations
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                <input name="name" type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-2.5 border" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input name="email" type="email" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-2.5 border" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date souhaitée</label>
                  <input name="date" type="date" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-2.5 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Heure</label>
                  <input name="time" type="time" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-2.5 border" />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {status === 'loading' ? 'Envoi en cours...' : 'Confirmer le rendez-vous'}
              </button>

              {status === 'success' && <p className="text-green-600 font-medium text-center">Rendez-vous envoyé avec succès !</p>}
              {status === 'error' && <p className="text-red-600 font-medium text-center">Une erreur est survenue.</p>}
            </form>
          </div>

          {/* Section Plan & Accès */}
          <div className="bg-gray-100 p-8 flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <MapPin className="text-red-500" /> Nous trouver
            </h2>
            
            <div className="flex-grow rounded-lg overflow-hidden shadow-inner border border-gray-200 min-h-[300px] mb-6">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2888.947294820464!2d1.459747976643178!3d43.60762297110439!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12aebb796677f597%3A0xc074719c8f000000!2s26%20Av.%20de%20la%20Colonne%2C%2031500%20Toulouse!5e0!3m2!1sfr!2sfr!4v1714800000000!5m2!1sfr!2sfr"
              ></iframe>
            </div>

            <div className="space-y-4">
              <a 
                href="https://maps.app.goo.gl/z7HTdBucuYMAd9Bf9" 
                target="_blank" 
                className="text-blue-600 hover:underline flex items-center gap-2"
              >
                Ouvrir dans Google Maps →
              </a>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={18} />
                <span>Lun - Ven : 09:00 - 18:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
