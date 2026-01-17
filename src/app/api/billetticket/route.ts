import { NextResponse } from 'next/server';

export async function GET() {
  const billetteries = [
    {
      id: 1,
      nom: "BilletRéduc Toulouse",
      description: "Théâtre, humour et sorties culturelles à prix réduits dans la ville rose.",
      type: "Spectacles & Humour",
      url: "https://www.billetreduc.com/a-toulouse/spectacles-r37/",
      style: "border-red-200 bg-red-50 text-red-700"
    },
    {
      id: 2,
      nom: "Billetnet",
      description: "Agenda complet et réservations pour les sorties toulousaines.",
      type: "Agenda Sorties",
      url: "https://www.billetnet.fr/?s=Toulouse",
      style: "border-slate-200 bg-slate-50 text-slate-700"
    },
    {
      id: 3,
      nom: "Eventbrite",
      description: "Ateliers, conférences et événements communautaires toulousains.",
      type: "Événements & Ateliers",
      url: "https://www.eventbrite.fr/d/france--toulouse/toulouse/",
      style: "border-orange-600 bg-orange-100 text-orange-800"
    },
    {
      id: 4,
      nom: "Fever Toulouse",
      description: "Expériences immersives, concerts Candlelight et sorties insolites.",
      type: "Expériences",
      url: "https://feverup.com/fr/toulouse",
      style: "border-purple-200 bg-purple-50 text-purple-700"
    },
    {
      id: 5,
      nom: "France Billet",
      description: "Large choix de billetterie pour les musées, parcs et concerts à Toulouse.",
      type: "Culture & Loisirs",
      url: "https://www.francebillet.com/city/toulouse-2032/",
      style: "border-orange-200 bg-orange-50 text-orange-700"
    },
    {
      id: 6,
      nom: "Ticketmaster Toulouse",
      description: "Concerts, festivals et grands événements au Zénith ou au Stadium.",
      type: "Généraliste",
      url: "https://www.ticketmaster.fr/fr/resultat?ipSearch=toulouse",
      style: "border-blue-200 bg-blue-50 text-blue-700"
    },
    {
      id: 7,
      nom: "TicketSwap Toulouse",
      description: "Achat et revente sécurisée de billets entre particuliers (dernière minute).",
      type: "Revente Sécurisée",
      url: "https://www.ticketswap.fr/city/toulouse/587",
      style: "border-teal-200 bg-teal-50 text-teal-700"
    }
  ];

  // Tri automatique par nom avant l'envoi
  const sortedBilletteries = billetteries.sort((a, b) => a.nom.localeCompare(b.nom));

  return NextResponse.json(sortedBilletteries);
}