import { NextResponse } from 'next/server';

export async function GET() {
  const cinemas = [
    { 
      name: "Pathé Wilson", 
      address: "3 Place du Président Thomas Wilson, 31000 Toulouse",
      url: "https://www.pathe.fr/cinemas/cinema-pathe-wilson", 
      category: "Multiplexe",
      lat: 43.604561,
      lng: 1.4479128
    },
{ 
  name: "UGC Toulouse Montaudran", 
  address: "8 Avenue de l'Aérodrome de Montaudran, 31400 Toulouse",
  url: "https://www.ugc.fr/cinema.html?id=56", 
  category: "Multiplexe",
  lat: 43.5739, 
  lng: 1.4815
},
    { 
      name: "Véo Grand Central", 
      address: "10 Place de la Charte des Libertés Communales, 31300 Toulouse",
      url: "https://cartoucherie.veocinemas.fr/", 
      category: "Art & Essai",
      lat: 43.6020809,
      lng: 1.4070758
    },
    { 
      name: "ABC Toulouse", 
      address: "13 Rue Saint-Bernard, 31000 Toulouse",
      url: "https://abc-toulouse.fr/", 
      category: "Art & Essai",
      lat: 43.6090872,
      lng: 1.443919
    },
    { 
      name: "American Cosmograph", 
      address: "24 Rue Montardy, 31000 Toulouse",
      url: "https://www.american-cosmograph.fr/", 
      category: "Indépendant",
      lat: 43.603963,
      lng: 1.446794
    },
    { 
      name: "Utopia Toulouse", 
      address: "24 Rue de la Colombette, 31000 Toulouse",
      url: "https://www.cinemas-utopia.org/toulouse/", 
      category: "Art & Essai",
      lat: 43.604443, // Note: coordonnée centrée sur la Rue de la Colombette
      lng: 1.452668
    },
    { 
      name: "Le Cratère", 
      address: "95 Grande Rue Saint-Michel, 31400 Toulouse",
      url: "https://www.cinemalecratere.fr/", 
      category: "Indépendant",
      lat: 43.5889091,
      lng: 1.4456688
    },
    { 
      name: "Gaumont Labège", 
      address: "Place du Commerce, 31670 Labège",
      url: "https://www.allocine.fr/seance/salle_gen_csalle=W3100.html", 
      category: "Multiplexe",
      lat: 43.5399471,
      lng: 1.5106926
    },
    { 
      name: "Le Métro", 
      address: "2 Rue du Lieutenant-Colonel Pélissier, 31000 Toulouse",
      url: "https://metropole.toulouse.fr/annuaire/cinema-le-metro", 
      category: "Municipal",
      lat: 43.6036,
      lng: 1.4465
    }
  ];

  return NextResponse.json(cinemas);
}
