import { NextResponse } from 'next/server';

export async function GET() {
  const cinemas = [
    { 
      name: "Pathé Wilson", 
      address: "3 Place du Président Thomas Wilson, 31000 Toulouse",
      url: "https://www.pathe.fr/cinemas/cinema-pathe-wilson", 
      category: "Multiplexe" 
    },
    { 
      name: "UGC Toulouse", 
      address: "9 Allée du Président Franklin Roosevelt, 31000 Toulouse",
      url: "https://www.ugc.fr/cinema.html?id=56", 
      category: "Multiplexe" 
    },
    { 
      name: "Véo Grand Central", 
      address: "10 Place de la Charte des Libertés Communales, 31300 Toulouse",
      url: "https://cartoucherie.veocinemas.fr/", 
      category: "Art & Essai" 
    },
    { 
      name: "ABC Toulouse", 
      address: "13 Rue Saint-Bernard, 31000 Toulouse",
      url: "https://abc-toulouse.fr/", 
      category: "Art & Essai" 
    },
    { 
      name: "American Cosmograph", 
      address: "24 Rue Montardy, 31000 Toulouse",
      url: "https://www.american-cosmograph.fr/", 
      category: "Indépendant" 
    },
    { 
      name: "Utopia Toulouse", 
      address: "24 Rue de la Colombette, 31000 Toulouse",
      url: "https://www.cinemas-utopia.org/toulouse/", 
      category: "Art & Essai" 
    },
    { 
      name: "Le Cratère", 
      address: "95 Grande Rue Saint-Michel, 31400 Toulouse",
      url: "https://www.cinemalecratere.fr/", 
      category: "Indépendant" 
    },
    { 
      name: "Gaumont Labège", 
      address: "Place du Commerce, 31670 Labège",
      url: "https://www.allocine.fr/seance/salle_gen_csalle=W3100.html", 
      category: "Multiplexe" 
    },
    { 
      name: "Le Métro", 
      address: "2 Rue du Lieutenant-Colonel Pélissier, 31000 Toulouse",
      url: "https://metropole.toulouse.fr/annuaire/cinema-le-metro", 
      category: "Municipal" 
    }
  ];

  return NextResponse.json(cinemas);
}