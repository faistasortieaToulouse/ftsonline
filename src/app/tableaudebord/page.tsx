"use client";

import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Calendar, 
  MapPin, 
  Globe, 
  BarChart2, 
  FlaskConical, 
  ExternalLink,
  MessageCircle,
  CloudSun,
  Umbrella,
  Monitor // Nouvelle icône pour la section Autres applications
} from 'lucide-react';

export default function TableauDeBord() {
  const sections = [
    {
      title: "Évènements & Sorties",
      icon: <Calendar className="w-5 h-5 text-blue-600" />,
      links: [
        { name: "Meetup informatique complet", path: "/meetup-info" },
        { name: "Meetup informatique", path: "/meetup-informatique" },
        { name: "Applications de sorties à Toulouse", path: "/sortiestoulouse" },
        { name: "Applications faire des Amis Sorties", path: "/applisortiesamis" },
      ]
    },
    {
      title: "Météo & Environnement",
      icon: <Umbrella className="w-5 h-5 text-sky-500" />,
      links: [
        { name: "Météo Toulouse en 2025", path: "/meteo2025", icon: <CloudSun size={14} className="text-orange-400"/> },
        { name: "Météo Toulouse en 2026", path: "/meteo2026", icon: <CloudSun size={14} className="text-orange-400"/> },
        { name: "Prévisions Météo Toulouse", path: "/meteonew", icon: <CloudSun size={14} className="text-orange-400"/> },
        { name: "Météo Lézignan en 2025", path: "/meteolezignan2025", icon: <CloudSun size={14} className="text-orange-400"/> },
        { name: "Météo Lézignan en 2026", path: "/meteolezignan2026", icon: <CloudSun size={14} className="text-orange-400"/> },
        { name: "Prévisions Météo Lézignan", path: "/meteolezignannew", icon: <CloudSun size={14} className="text-orange-400"/> },
        { name: "Vigilance Toulouse et Lézignan", path: "/vigilance", icon: <CloudSun size={14} className="text-orange-400"/> },
        { name: "Historique Vigilance Toulouse et Lézignan", path: "/vigilances", icon: <CloudSun size={14} className="text-orange-400"/> },
      ]
    },
    {
      title: "Rendez-vous",
      icon: <MapPin className="w-5 h-5 text-red-600" />,
      links: [
        { name: "RDV des sorties à Toulouse", path: "/rendezvousjolimont" },
        { name: "26 Av. de la Colonne", path: "/avcolonne", desc: "31500 Toulouse" },
        { name: "4, rue Bornier", path: "/ruebornier", desc: "JF55+8MF Toulouse" },
      ]
    },
    {
      title: "Sous-domaines & Analyse",
      icon: <Globe className="w-5 h-5 text-purple-600" />,
      links: [
        { name: "Discord", path: "/discord", icon: <MessageCircle size={14} className="text-indigo-500"/> },
        { name: "WhatsApp Discord", path: "https://whatsapdiscord.ftstoulouse.online", isExternal: true },
        { name: "Meetup Toulouse Dev", path: "https://dev.ftstoulouse.online", isExternal: true },
        { name: "Accès Statistiques", path: "/analyse", icon: <BarChart2 size={14}/> },
      ]
    },
    {
      title: "Autres applications",
      icon: <Monitor className="w-5 h-5 text-emerald-600" />,
      links: [
        { 
          name: "Alejandra CV", 
          path: "https://alejandra-cv.vercel.app/", 
          desc: "Hébergé sur Vercel", 
          isExternal: true 
        }
      ]
    }
  ];

  const testPages = [
    "/atelatoi", "/calendar", "/jsontest", "/jsontest2", "/pagetest", 
    "/pageaccordeon", "/pageaccordenon", "/testcarte", "/testdata", 
    "/testhierarchieold", "/testleaflet"
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto"> {/* Ajustement de la largeur pour soutenir 5 colonnes */}
        
        {/* Header */}
        <header className="flex items-center gap-3 mb-10">
          <LayoutDashboard className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-extrabold text-slate-800">Tableau de Bord</h1>
        </header>

        {/* Grille des sections - S'adapte de 1 à 5 colonnes selon la taille de l'écran */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2">
                {section.icon}
                <h2 className="font-bold text-slate-700">{section.title}</h2>
              </div>
              <ul className="p-3">
                {section.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link 
                      href={link.path}
                      target={link.isExternal ? "_blank" : "_self"}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-indigo-50 transition-all group"
                    >
                      <div>
                        <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600 flex items-center gap-2">
                          {link.icon} {link.name}
                        </span>
                        {link.desc && <p className="text-xs text-slate-400 mt-0.5">{link.desc}</p>}
                      </div>
                      {link.isExternal ? (
                        <ExternalLink size={14} className="text-slate-300 group-hover:text-indigo-400" />
                      ) : (
                        <span className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Section Pages de Test */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-700 mb-4">
            <FlaskConical className="w-5 h-5 text-amber-500" /> Environnement de Test
          </h2>
          <div className="flex flex-wrap gap-3">
            {testPages.map((path) => (
              <Link 
                key={path} 
                href={path}
                className="py-2 px-4 bg-slate-100 hover:bg-amber-100 hover:text-amber-800 rounded-lg text-xs font-semibold text-slate-500 transition-colors border border-slate-200"
              >
                {path.replace('/', '')}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
