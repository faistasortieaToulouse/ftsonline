import { NextResponse } from 'next/server';

export async function GET() {
  const evenements = [
    {
      id: 1,
      nom: "Casino Barrière Toulouse",
      description: "Spectacles, concerts, dîners-spectacles et animations dans le grand complexe de l'Île du Ramier.",
      type: "Spectacle & Loisirs",
      url: "https://www.casinosbarriere.com/fr/toulouse.html",
      color: "border-gold-200 bg-amber-50 text-amber-800"
    },
    {
      id: 2,
      nom: "Conservatoire de Toulouse",
      description: "Agenda des concerts, auditions et événements artistiques des élèves et professeurs du CRR.",
      type: "Musique & Danse",
      url: "https://conservatoire.toulouse.fr/",
      color: "border-slate-200 bg-slate-50 text-slate-800"
    },
    {
      id: 3,
      nom: "Halles de la Transition",
      description: "Événements éco-responsables, ateliers DIY et rencontres autour de l'écologie urbaine.",
      type: "Tiers-Lieu / Écolo",
      url: "https://www.leshallesdelatransition.com/",
      color: "border-emerald-200 bg-emerald-50 text-emerald-800"
    },
    {
      id: 4,
      nom: "Halles de la Cartoucherie",
      description: "Le nouveau lieu de vie toulousain : programmation culturelle, sport et gastronomie.",
      type: "Tiers-Lieu / Mixte",
      url: "https://halles-cartoucherie.fr/",
      color: "border-indigo-200 bg-indigo-50 text-indigo-800"
    },
    {
      id: 5,
      nom: "isdaT - Institut des Arts",
      description: "Expositions, conférences et événements publics de l'Institut supérieur des arts de Toulouse.",
      type: "Art & Design",
      url: "https://www.isdat.fr/",
      color: "border-pink-200 bg-pink-50 text-pink-800"
    },
    {
      id: 6,
      nom: "Toulouse Tourisme - Agenda",
      description: "L'agenda officiel complet de la ville : festivals, visites guidées et grands événements.",
      type: "Office de Tourisme",
      url: "https://www.toulouse-tourisme.com/",
      color: "border-red-200 bg-red-50 text-red-800"
    },
    {
      id: 7,
      nom: "Zénith Toulouse Métropole",
      description: "Programmation des plus grands concerts nationaux et internationaux à Toulouse.",
      type: "Grande Salle de Concert",
      url: "https://zenith-toulousemetropole.com/",
      color: "border-blue-200 bg-blue-50 text-blue-800"
    }
  ];

  // Tri alphabétique automatique par le nom
  const sortedEvents = evenements.sort((a, b) => a.nom.localeCompare(b.nom));

  return NextResponse.json(sortedEvents);
}