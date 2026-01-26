import { NextResponse } from "next/server";

export async function GET() {
  const links = [
    {
      id: 1,
      title: "Billets 1€ - Site Officiel TER",
      url: "https://www.ter.sncf.com/occitanie/tarifs-cartes/billets-un-euro",
      description: "Le portail direct pour réserver vos billets à 1 euro en Occitanie.",
      category: "Réservation"
    },
    {
      id: 2,
      title: "Fairtiq, trouve un billet à 1€",
      url: "https://fairtiq.com/fr/",
      description: "L'application pour voyager sans billet papier, idéale pour les trajets lio.",
      category: "Application"
    },
    {
      id: 3,
      title: "SNCF Connect, découvre chaque jour des billets à 1€",
      url: "https://www.sncf-connect.com/",
      description: "Achat de billets et consultation des horaires en temps réel.",
      category: "Réservation"
    },
    {
      id: 4,
      title: "Trainline, trouve des train à 1€",
      url: "https://www.thetrainline.com/fr/compagnies-ferroviaires/ter/train-1-euro",
      description: "Alternative pour comparer et acheter vos billets TER à petit prix.",
      category: "Comparateur"
    },
    {
      id: 5,
      title: "Tourisme Occitanie, premier week-end, billets de train à 1€",
      url: "https://www.tourisme-occitanie.com/pratique/transports/venir-en-train/profitez-des-week-ends-lio-train-a-1-euro/",
      description: "Informations pratiques sur les week-ends à 1 euro et idées de sorties.",
      category: "Infos & Tourisme"
    },
    {
      id: 5,
      title: "Tourisme Occitanie, LIO, billet de train à 1€",
      url: "https://www.tourisme-occitanie.com/pratique/transports/venir-en-train/profitez-des-week-ends-lio-train-a-1-euro/",
      description: "Informations pratiques sur les week-ends à 1 euro et idées de sorties.",
      category: "Infos & Tourisme"
    }
  ];

  return NextResponse.json(links);
}
