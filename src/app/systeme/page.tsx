"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Monitor, History, Layers, Info } from 'lucide-react';

const SystemesExploitation = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Bouton Retour à l'accueil */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-all mb-8 group bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Retour à l'accueil</span>
        </Link>

        <main className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          {/* Header avec un dégradé discret */}
          <div className="bg-gradient-to-r from-blue-800 to-indigo-900 p-8 text-white">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Monitor size={32} className="text-blue-300" />
              Les Systèmes d'Exploitation
            </h1>
            <p className="text-blue-100 opacity-90">Comprendre les fondations de l'informatique moderne.</p>
          </div>

          <div className="p-8">
            {/* 1. Définition */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-slate-800 flex items-center gap-2">
                <Info size={24} className="text-blue-500" />
                1. Qu'est-ce qu'un OS ?
              </h2>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-slate-700 leading-relaxed italic">
                  "Un système d'exploitation (OS) est le chef d'orchestre de l'ordinateur. Il fait le pont entre le matériel (hardware) et les logiciels (software)."
                </p>
              </div>
            </section>

            {/* 2. Chronologie */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-slate-800 flex items-center gap-2">
                <History size={24} className="text-blue-500" />
                2. Chronologie & Racines
              </h2>
              
              <div className="relative border-l-2 border-slate-100 ml-3 pl-8 space-y-8">
                {/* 1969 */}
                <div className="relative">
                  <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>
                  <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">1969</span>
                  <h3 className="font-bold text-slate-900 text-lg">Naissance d'Unix</h3>
                  <p className="text-slate-600">Créé par Ken Thompson et Dennis Ritchie (Laboratoires Bell). Introduction du multitâche et du langage C.</p>
                </div>

                {/* 1983 */}
                <div className="relative">
                  <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-slate-400 border-4 border-white shadow-sm"></div>
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">1983</span>
                  <h3 className="font-bold text-slate-900 text-lg">Le Projet GNU</h3>
                  <p className="text-slate-600">Richard Stallman lance le logiciel libre. Création de GCC et Bash, mais le noyau (Hurd) manque à l'appel.</p>
                </div>

                {/* 1991 */}
                <div className="relative">
                  <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm"></div>
                  <span className="text-sm font-bold text-green-600 uppercase tracking-wider">1991</span>
                  <h3 className="font-bold text-slate-900 text-lg">Le Noyau Linux</h3>
                  <p className="text-slate-600">Linus Torvalds publie son noyau. La fusion avec GNU crée le système complet <strong>GNU/Linux</strong>.</p>
                </div>
              </div>
            </section>

            {/* 3. Les Familles */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-slate-800 flex items-center gap-2">
                <Layers size={24} className="text-blue-500" />
                3. Les Familles de Distributions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Debian", desc: "Stabilité exemplaire. Base de Ubuntu et Linux Mint.", color: "border-red-400" },
                  { name: "Red Hat", desc: "Le standard entreprise. Inclut Fedora et RHEL.", color: "border-blue-400" },
                  { name: "Arch Linux", desc: "Simplicité technique et Rolling Release (Manjaro).", color: "border-slate-400" },
                  { name: "Slackware", desc: "La doyenne (1993). Proche de la philosophie Unix.", color: "border-green-400" }
                ].map((distro, i) => (
                  <div key={i} className={`p-4 border-t-4 ${distro.color} bg-slate-50 rounded shadow-sm hover:shadow-md transition-shadow`}>
                    <h4 className="font-bold text-slate-800">{distro.name}</h4>
                    <p className="text-sm text-slate-600">{distro.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Liens Wikipedia */}
            <footer className="pt-8 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-4 uppercase tracking-widest font-semibold text-center">Sources & Documentation</p>
              <div className="flex flex-wrap justify-center gap-4">
                <WikiLink href="https://fr.wikipedia.org/wiki/Syst%C3%A8me_d%27exploitation" label="OS" />
                <WikiLink href="https://fr.wikipedia.org/wiki/Chronologie_des_syst%C3%A8mes_d%27exploitation" label="Chronologie" />
                <WikiLink href="https://fr.wikipedia.org/wiki/Linux#Histoire" label="Histoire de Linux" />
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

// Petit composant interne pour les liens
const WikiLink = ({ href, label }: { href: string, label: string }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="text-blue-500 hover:text-blue-700 text-xs font-medium px-3 py-1 bg-blue-50 rounded-full transition-colors border border-blue-100"
  >
    {label} ↗
  </a>
);

export default SystemesExploitation;
