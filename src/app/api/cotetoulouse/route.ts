// src/app/api/cotetoulouse/route.ts
import { NextResponse } from "next/server";

// src/app/api/cotetoulouse/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const categories = [
    { label: "Toulouse : ce week-end", url: "https://infolocale.actu.fr/evenements/toulouse-31000/sortir-ce-weekend" },
    { label: "Toulouse", url: "https://infolocale.actu.fr/occitanie/haute-garonne/toulouse-31000" },
    { label: "Toulouse : aujourd'hui", url: "https://infolocale.actu.fr/evenements/toulouse-31000/aujourd-hui" },
    { label: "Toulouse : ce soir", url: "https://infolocale.actu.fr/evenements/toulouse-31000/ce-soir" },

    { label: "Agenda Loisirs et sports de Toulouse", url: "https://infolocale.actu.fr/evenements?rubrique%5B0%5D=Loisirs%20et%20sports%20%3E%20Activit%C3%A9%20de%20loisirs&rubrique%5B1%5D=Loisirs%20et%20sports%20%3E%20Visite%2C%20balade&rubrique%5B2%5D=Loisirs%20et%20sports%20%3E%20Sport&rubrique%5B3%5D=Loisirs%20et%20sports%20%3E%20Acheter%2C%20chiner&rubrique%5B4%5D=Loisirs%20et%20sports%20%3E%20Jeux%2C%20concours%2C%20rallye&rubrique%5B5%5D=Loisirs%20et%20sports%20%3E%20Sortie%2C%20voyage&commune=31555" },
    { label: "Agenda Culture et idées de Toulouse", url: "https://infolocale.actu.fr/evenements?rubrique%5B0%5D=Culture%20et%20id%C3%A9es%20%3E%20Exposition%2C%20mus%C3%A9e&rubrique%5B1%5D=Culture%20et%20id%C3%A9es%20%3E%20Conf%C3%A9rence%2C%20d%C3%A9bat&rubrique%5B2%5D=Culture%20et%20id%C3%A9es%20%3E%20Cin%C3%A9ma&rubrique%5B3%5D=Culture%20et%20id%C3%A9es%20%3E%20Litt%C3%A9rature&rubrique%5B4%5D=Culture%20et%20id%C3%A9es%20%3E%20Patrimoine&commune=31555" },
    { label: "Agenda Concerts, spectacles de Toulouse", url: "https://infolocale.actu.fr/evenements?rubrique%5B0%5D=Concerts%2C%20spectacles%20%3E%20Spectacle&rubrique%5B1%5D=Concerts%2C%20spectacles%20%3E%20Concert%2C%20spectacle%20musical&rubrique%5B2%5D=Concerts%2C%20spectacles%20%3E%20Festival&commune=31555" },
    { label: "Agenda Convivialité et partage de Toulouse", url: "https://infolocale.actu.fr/evenements?rubrique%5B0%5D=Convivialit%C3%A9%20et%20partage%20%3E%20Social%20et%20solidaire&rubrique%5B1%5D=Convivialit%C3%A9%20et%20partage%20%3E%20Danser&rubrique%5B2%5D=Convivialit%C3%A9%20et%20partage%20%3E%20%C3%80%20table&rubrique%5B3%5D=Convivialit%C3%A9%20et%20partage%20%3E%20F%C3%AAte&commune=31555" },
    { label: "Agenda de Toulouse", url: "https://infolocale.actu.fr/occitanie/haute-garonne/toulouse-31000" },
    { label: "Agenda Concert, spectacle musical de Toulouse", url: "https://infolocale.actu.fr/evenements?rubrique=Concerts%2C%20spectacles%20%3E%20Concert%2C%20spectacle%20musical&commune=31555" },
    { label: "Agenda Spectacle de Toulouse", url: "https://infolocale.actu.fr/evenements?rubrique=Concerts%2C%20spectacles%20%3E%20Spectacle&commune=31555" },
    { label: "Agenda Sport de Toulouse", url: "https://infolocale.actu.fr/evenements?rubrique=Loisirs%20et%20sports%20%3E%20Sport&commune=31555" },
    { label: "Agenda Activité de loisirs de Toulouse", url: "https://infolocale.actu.fr/evenements?rubrique=Loisirs%20et%20sports%20%3E%20Activit%C3%A9%20de%20loisirs&commune=31555" },
    { label: "Agenda Festival de Toulouse", url: "https://infolocale.actu.fr/evenements?rubrique=Concerts%2C%20spectacles%20%3E%20Festival&commune=31555" },

    { label: "Agenda Exposition, musée de Toulouse", url: "https://infolocale.actu.fr/evenements/toulouse-31555/exposition-musee" },
    { label: "Agenda Cinéma de Toulouse", url: "https://infolocale.actu.fr/evenements/toulouse-31555/cinema" },
    { label: "Agenda Conférence, débat de Toulouse", url: "https://infolocale.actu.fr/evenements/toulouse-31555/conference-debat" },
    { label: "Agenda Visite, balade de Toulouse", url: "https://infolocale.actu.fr/evenements/toulouse-31555/visite-balade" },
    { label: "Agenda Littérature de Toulouse", url: "https://infolocale.actu.fr/evenements/toulouse-31555/litterature" },

    { label: "Agenda Patrimoine de Toulouse", url: "https://infolocale.actu.fr/evenements?rubrique=Culture%20et%20id%C3%A9es%20%3E%20Patrimoine&commune=31555" },
    { label: "Agenda Théâtre de Toulouse", url: "https://infolocale.actu.fr/activites?rubrique=Loisirs%20et%20sports%20%3E%20Activit%C3%A9%20de%20loisirs%20%3E%20Th%C3%A9%C3%A2tre&commune=31555" },
    { label: "Agenda Cirque de Toulouse", url: "https://infolocale.actu.fr/evenements?q=cirque&commune=31555" },
    { label: "Agenda Contes de Toulouse", url: "https://infolocale.actu.fr/evenements?q=contes&commune=31555" },

    { label: "Agenda Danse de Toulouse", url: "https://infolocale.actu.fr/activites/rubrique-loisirs-et-sports/categorie-sport/genre-danse?commune=31555" },
    { label: "Agenda Relaxation, bien-être de Toulouse", url: "https://infolocale.actu.fr/activites/rubrique-loisirs-et-sports/categorie-activite-de-loisirs/genre-relaxation-bien-etre?commune=31555" },
    { label: "Agenda Forme, fitness, musculation de Toulouse", url: "https://infolocale.actu.fr/activites/rubrique-loisirs-et-sports/categorie-sport/genre-forme-fitness-musculation?commune=31555" },
    { label: "Agenda Musique", url: "https://infolocale.actu.fr/activites/rubrique-loisirs-et-sports/categorie-activite-de-loisirs/genre-musique?commune=31555" },
    { label: "Agenda Dessin, peinture", url: "https://infolocale.actu.fr/activites/rubrique-loisirs-et-sports/categorie-activite-de-loisirs/genre-dessin-peinture?commune=31555" },
    { label: "Agenda Théâtre", url: "https://infolocale.actu.fr/activites/rubrique-loisirs-et-sports/categorie-activite-de-loisirs/genre-theatre?commune=31555" },
    { label: "Agenda Gymnastique", url: "https://infolocale.actu.fr/activites/rubrique-loisirs-et-sports/categorie-sport/genre-gymnastique?commune=31555" },

    { label: "Agenda Comédie, humour de Toulouse", url: "https://infolocale.actu.fr/evenements?q=Com%C3%A9die%2C+humour&commune=31555" },
    { label: "Agenda Jazz de Toulouse", url: "https://infolocale.actu.fr/evenements?q=Jazz&commune=31555" },
    { label: "Agenda Classique de Toulouse", url: "https://infolocale.actu.fr/evenements?q=Classique&commune=31555" },
    { label: "Agenda Musiques du monde de Toulouse", url: "https://infolocale.actu.fr/evenements?commune=31555&q=Musiques+du+monde" },
    { label: "Agenda Numérique de Toulouse", url: "https://infolocale.actu.fr/activites?rubrique=Loisirs%20et%20sports%20%3E%20Activit%C3%A9%20de%20loisirs%20%3E%20Num%C3%A9rique&commune=31555" },
    { label: "Agenda Dédicace de Toulouse", url: "https://infolocale.actu.fr/evenements?q=D%C3%A9dicace&commune=31555" },
    { label: "Agenda Visite de Toulouse", url: "https://infolocale.actu.fr/activites?rubrique=Loisirs%20et%20sports%20%3E%20Visite%2C%20balade%20%3E%20Visite&commune=31555" },
    { label: "Agenda Exposition de Toulouse", url: "https://infolocale.actu.fr/evenements?q=Exposition&commune=31555" },
    { label: "Agenda Conférence sciences humaines de Toulouse", url: "https://infolocale.actu.fr/evenements?q=Conf%C3%A9rence+sciences+humaines&commune=31555" },
    { label: "Agenda Variété de Toulouse", url: "https://infolocale.actu.fr/evenements?q=Vari%C3%A9t%C3%A9&commune=31555" },

    { label: "Agenda Rock de Toulouse", url: "https://infolocale.actu.fr/evenements?q=Rock&commune=31555" },
    { label: "Agenda Hip-hop de Toulouse", url: "https://infolocale.actu.fr/evenements?q=Hip-hop&commune=31555" },
    { label: "Agenda Marionnettes de Toulouse", url: "https://infolocale.actu.fr/evenements?q=Marionnettes&commune=31555" },
    { label: "Agenda Musée de Toulouse", url: "https://infolocale.actu.fr/evenements?q=Mus%C3%A9e&commune=31555" },
    { label: "Agenda Animation de Toulouse", url: "https://infolocale.actu.fr/activites?rubrique=Loisirs%20et%20sports%20%3E%20Activit%C3%A9%20de%20loisirs%20%3E%20Animation&commune=31555" },
    { label: "Agenda Nature de Toulouse", url: "https://infolocale.actu.fr/activites?rubrique=Loisirs%20et%20sports%20%3E%20Visite%2C%20balade%20%3E%20Sortie%20nature&commune=31555" },
    { label: "Agenda Photographie de Toulouse", url: "https://infolocale.actu.fr/activites?rubrique=Loisirs%20et%20sports%20%3E%20Activit%C3%A9%20de%20loisirs%20%3E%20Photographie&commune=31555" },
    { label: "Agenda Livre, Lecture de Toulouse", url: "https://infolocale.actu.fr/evenements?q=Livre%2C+Lecture&commune=31555" },

    { label: "Les organismes de Toulouse", url: "https://infolocale.actu.fr/organismes?commune=31555" },
    { label: "Les associations de Toulouse", url: "https://infolocale.actu.fr/organismes?typologie=Association&commune=31555" },
    { label: "Toulouse : Découvrez des activités à pratiquer", url: "https://infolocale.actu.fr/activites?commune=31555" },
    { label: "Toulouse : Découvrez des activités de loisirs et sports à pratiquer", url: "https://infolocale.actu.fr/activites?rubrique%5B0%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Danse&rubrique%5B1%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Forme%2C%20fitness%2C%20musculation&rubrique%5B2%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Gymnastique&rubrique%5B3%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Sports%20de%20combat%20-%20arts%20martiaux&rubrique%5B4%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Sports%20collectifs&rubrique%5B5%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Marche&rubrique%5B6%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Karat%C3%A9&rubrique%5B7%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Judo-Jujitsu&rubrique%5B8%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Sports%20de%20plein%20air%20et%20de%20nature&rubrique%5B9%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Sports%20nautiques&rubrique%5B10%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Randonn%C3%A9e&rubrique%5B11%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Cyclisme%2C%20cyclo%2C%20VTT&rubrique%5B12%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Natation%2C%20piscine%2C%20plong%C3%A9e&rubrique%5B13%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Badminton&rubrique%5B14%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Sports%20de%20glisse&rubrique%5B15%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Tennis%20de%20table&rubrique%5B16%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Equitation&rubrique%5B17%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Football&rubrique%5B18%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Tennis&rubrique%5B19%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Volley-ball&rubrique%5B20%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Basketball&rubrique%5B21%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Bridge&rubrique%5B22%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Sports%20de%20cible&rubrique%5B23%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Rugby&rubrique%5B24%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Course%2C%20running&rubrique%5B25%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Handball&rubrique%5B26%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Sports%20de%20raquette&rubrique%5B27%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Athl%C3%A9tisme&rubrique%5B28%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Sports%20de%20glace%2C%20patinage&rubrique%5B29%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Sports%20avec%20animaux&rubrique%5B30%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Sports%20a%C3%A9riens&rubrique%5B31%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Balade&rubrique%5B32%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20P%C3%A9tanque&rubrique%5B33%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Sports%20motoris%C3%A9s&rubrique%5B34%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Hippisme&rubrique%5B35%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20P%C3%AAche&commune=31555" },

    { label: "Toulouse : Découvrez des activités de sport à pratiquer", url: "https://infolocale.actu.fr/activites?rubrique%5B0%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Danse&rubrique%5B1%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Forme%2C%20fitness%2C%20musculation&rubrique%5B2%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Gymnastique&rubrique%5B3%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Sports%20de%20combat%20-%20arts%20martiaux&rubrique%5B4%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Sports%20collectifs&rubrique%5B5%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Marche&rubrique%5B6%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Karat%C3%A9&rubrique%5B7%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Judo-Jujitsu&rubrique%5B8%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Sports%20de%20plein%20air%20et%20de%20nature&rubrique%5B9%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Sports%20nautiques&rubrique%5B10%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Randonn%C3%A9e&rubrique%5B11%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Cyclisme%2C%20cyclo%2C%20VTT&rubrique%5B12%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Natation%2C%20piscine%2C%20plong%C3%A9e&rubrique%5B13%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Badminton&rubrique%5B14%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Sports%20de%20glisse&rubrique%5B15%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Tennis%20de%20table&rubrique%5B16%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Equitation&rubrique%5B17%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Football&rubrique%5B18%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Tennis&rubrique%5B19%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Volley-ball&rubrique%5B20%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Basketball&rubrique%5B21%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Bridge&rubrique%5B22%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Sports%20de%20cible&rubrique%5B23%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Rugby&rubrique%5B24%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Course%2C%20running&rubrique%5B25%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Handball&rubrique%5B26%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Sports%20de%20raquette&rubrique%5B27%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Athl%C3%A9tisme&rubrique%5B28%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Sports%20de%20glace%2C%20patinage&rubrique%5B29%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Sports%20avec%20animaux&rubrique%5B30%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Sports%20a%C3%A9riens&rubrique%5B31%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Balade&rubrique%5B32%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20P%C3%A9tanque&rubrique%5B33%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Sports%20motoris%C3%A9s&rubrique%5B34%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20Hippisme&rubrique%5B35%5D=Loisirs%20et%20sports%20%3E%20Sport%20%3E%20P%C3%AAche&commune=31555" },

    { label: "L'agenda des sorties ur Toulouse et aux alentours", url: "https://infolocale.actu.fr/evenements?commune=31555" },
    { label: "Les commerces et services sur Toulouse et aux alentours", url: "https://infolocale.actu.fr/commerces-et-services?commune=31555" },
    { label: "Découvrez les activités à Toulouse et aux alentours", url: "https://infolocale.actu.fr/activites?commune=31555" },
    { label: "Dernières infos partagées sur Toulouse et aux alentours", url: "https://infolocale.actu.fr/publications?commune=31555" },
    { label: "Forum des associations et clubs sur Toulouse et autour", url: "https://infolocale.actu.fr/organismes?commune=31555" },
    { label: "Services et informations pratiques sur Toulouse et autour", url: "https://infolocale.actu.fr/vie-pratique?commune=31555" }
  ];

  return NextResponse.json({ records: categories });
}

