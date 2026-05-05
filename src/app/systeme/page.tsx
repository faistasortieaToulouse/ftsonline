import React from 'react';

const SystemesExploitation = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-4xl font-bold mb-6 text-blue-800">L'Univers des Systèmes d'Exploitation (OS)</h1>

      {/* Section Introduction */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 border-b-2 border-blue-200">1. Qu'est-ce qu'un Système d'Exploitation ?</h2>
        <p className="text-gray-700 leading-relaxed">
          Un système d'exploitation est un ensemble de programmes qui dirige l'utilisation des ressources d'un ordinateur par des logiciels applicatifs.
        </p>
        
      </section>

      {/* Section Chronologie */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 border-b-2 border-blue-200">2. Chronologie & Racines</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <span className="font-bold text-blue-600">1970s</span>
            <p><strong>Unix :</strong> Créé chez AT&T. Pose les bases (multi-utilisateur, fichiers hiérarchiques).</p>
          </div>
          <div className="flex gap-4">
            <span className="font-bold text-blue-600">1983</span>
            <p><strong>Projet GNU :</strong> Richard Stallman lance l'idée d'un système 100% libre.</p>
          </div>
          <div className="flex gap-4">
            <span className="font-bold text-blue-600">1991</span>
            <p><strong>Linux :</strong> Linus Torvalds publie le noyau Linux, comblant le manque du projet GNU.</p>
          </div>
        </div>
      </section>

      {/* Section Familles de Distributions */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 border-b-2 border-blue-200">3. Les Familles Linux</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded">
            <h3 className="font-bold">Famille Debian</h3>
            <p className="text-sm">Ubuntu, Linux Mint, Kali. Orientée utilisateur et stabilité.</p>
          </div>
          <div className="p-4 bg-red-50 rounded">
            <h3 className="font-bold">Famille Red Hat</h3>
            <p className="text-sm">Fedora, RHEL, CentOS. Orientée entreprise et serveurs.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-bold">Famille Arch</h3>
            <p className="text-sm">Arch Linux, Manjaro. Rolling release et personnalisation extrême.</p>
          </div>
          <div className="p-4 bg-green-50 rounded">
            <h3 className="font-bold">Famille Slackware</h3>
            <p className="text-sm">La plus ancienne encore maintenue, fidèle à la philosophie Unix.</p>
          </div>
        </div>
        
      </section>
    </div>
  );
};

export default SystemesExploitation;
