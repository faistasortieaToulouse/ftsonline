"use client";

import { useState } from 'react';
import { BarChart3, ExternalLink, Lock, CheckCircle2 } from 'lucide-react';

export default function AnalysePage() {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState(false);

  // Le lien direct vers ton interface Analytics
  const analyticsUrl = "https://analytics.google.com/analytics/web/?authuser=1#/a373025182p510564670/reports/intelligenthome";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // On compare avec la variable d'env (ou un code en dur si tu préfères la simplicité)
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === "HappyFTS") {
      setIsAuthorized(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      {!isAuthorized ? (
        /* FORMULAIRE DE CONNEXION DISCRET */
        <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl border border-purple-50">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-purple-100 rounded-full">
              <Lock className="text-purple-600" size={24} />
            </div>
          </div>
          <h1 className="text-xl font-bold text-center text-slate-800 mb-6">Espace Analyse</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
            />
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-200"
            >
              Accéder
            </button>
            {error && <p className="text-red-500 text-xs text-center">Mot de passe incorrect</p>}
          </form>
        </div>
      ) : (
        /* LE BOUTON D'ACCÈS DIRECT */
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border-2 border-green-100 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="text-green-500" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Accès Autorisé</h2>
            <p className="text-slate-500 mb-8">Cliquez sur le bouton ci-dessous pour ouvrir vos rapports Google Analytics.</p>
            
            <a 
              href={analyticsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-6 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl text-white font-bold hover:scale-[1.02] transition-all shadow-xl"
            >
              <div className="flex items-center gap-4">
                <BarChart3 size={28} />
                <span className="text-lg">Ouvrir Analytics</span>
              </div>
              <ExternalLink size={20} className="opacity-70 group-hover:opacity-100 transition-opacity" />
            </a>
            
            <p className="mt-6 text-xs text-slate-400 italic">
              Vérifiez que vous êtes connecté à votre compte Google Happy People.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
