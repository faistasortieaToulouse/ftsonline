// src/app/api/cotetoulouse/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const categories = [
    { label: "Toulouse : ce week-end", url: "https://infolocale.actu.fr/recherche/?com=31555&start=2025-01-10&end=2025-01-12" },
    { label: "Toulouse", url: "https://infolocale.actu.fr/agenda?com=31555" },
    { label: "Toulouse : aujourd'hui", url: "https://infolocale.actu.fr/recherche/?com=31555&start=2025-01-10&end=2025-01-10" },
    { label: "Toulouse : ce soir", url: "https://infolocale.actu.fr/recherche/?com=31555&categories=261" },
    { label: "Agenda Loisirs et sports de Toulouse", url: "https://infolocale.actu.fr/loisirs-sports?com=31555" },
    { label: "Agenda Culture et idées de Toulouse", url: "https://infolocale.actu.fr/culture-idees?com=31555" },
    { label: "Agenda Concerts, spectacles de Toulouse", url: "https://infolocale.actu.fr/concerts-spectacles?com=31555" },
    { label: "Agenda Convivialité et partage de Toulouse", url: "https://infolocale.actu.fr/convivialite-partage?com=31555" },
    { label: "Agenda de Toulouse", url: "https://infolocale.actu.fr/agenda/?com=31555" },
    { label: "Agenda Concert, spectacle musical de Toulouse", url: "https://infolocale.actu.fr/concert-spectacle-musical?com=31555" },
    { label: "Agenda Spectacle de Toulouse", url: "https://infolocale.actu.fr/spectacle?com=31555" },
    { label: "Agenda Sport de Toulouse", url: "https://infolocale.actu.fr/sport?com=31555" },
    { label: "Agenda Activité de loisirs de Toulouse", url: "https://infolocale.actu.fr/activite-de-loisirs?com=31555" },
    { label: "Agenda Festival de Toulouse", url: "https://infolocale.actu.fr/festival?com=31555" },
    { label: "Agenda Exposition, musée de Toulouse", url: "https://infolocale.actu.fr/exposition-musee?com=31555" },
    { label: "Agenda Littérature de Toulouse", url: "https://infolocale.actu.fr/litterature?com=31555" },
    { label: "Agenda Patrimoine de Toulouse", url: "https://infolocale.actu.fr/patrimoine?com=31555" },
    { label: "Agenda Cinéma de Toulouse", url: "https://infolocale.actu.fr/cinema?com=31555" },
    { label: "Agenda Conférence, débat de Toulouse", url: "https://infolocale.actu.fr/conference-debat?com=31555" },
    { label: "Agenda Visite, balade de Toulouse", url: "https://infolocale.actu.fr/visite-balade?com=31555" },
    { label: "Agenda Danse de Toulouse", url: "https://infolocale.actu.fr/danse?com=31555" },
    { label: "Agenda Comédie, humour de Toulouse", url: "https://infolocale.actu.fr/comedie-humour?com=31555" },
    { label: "Agenda Théatre de Toulouse", url: "https://infolocale.actu.fr/theatre?com=31555" },
    { label: "Agenda Cirque de Toulouse", url: "https://infolocale.actu.fr/cirque?com=31555" },
    { label: "Agenda Contes de Toulouse", url: "https://infolocale.actu.fr/contes?com=31555" },
    { label: "Agenda Numérique de Toulouse", url: "https://infolocale.actu.fr/numerique?com=31555" },
    { label: "Agenda Dédicace de Toulouse", url: "https://infolocale.actu.fr/dedicace?com=31555" },
    { label: "Agenda Rock de Toulouse", url: "https://infolocale.actu.fr/rock?com=31555" },
    { label: "Agenda Jazz de Toulouse", url: "https://infolocale.actu.fr/jazz?com=31555" },
    { label: "Agenda Classique de Toulouse", url: "https://infolocale.actu.fr/classique?com=31555" },
    { label: "Agenda Musiques du monde de Toulouse", url: "https://infolocale.actu.fr/musiques-du-monde?com=31555" },
    { label: "Agenda Variété de Toulouse", url: "https://infolocale.actu.fr/variete?com=31555" },
    { label: "Agenda Visite de Toulouse", url: "https://infolocale.actu.fr/visite?com=31555" },
    { label: "Agenda Exposition de Toulouse", url: "https://infolocale.actu.fr/exposition?com=31555" },
    { label: "Agenda Conférence sciences humaines de Toulouse", url: "https://infolocale.actu.fr/conference-sciences-humaines?com=31555" },
    { label: "Agenda Hip-hop de Toulouse", url: "https://infolocale.actu.fr/hip-hop?com=31555" },
    { label: "Agenda Marionnettes de Toulouse", url: "https://infolocale.actu.fr/marionnettes?com=31555" },
    { label: "Agenda Musée de Toulouse", url: "https://infolocale.actu.fr/musee?com=31555" },
    { label: "Agenda Animation de Toulouse", url: "https://infolocale.actu.fr/animation?com=31555" },
    { label: "Agenda Nature de Toulouse", url: "https://infolocale.actu.fr/nature?com=31555" },
    { label: "Agenda Photographie de Toulouse", url: "https://infolocale.actu.fr/photographie?com=31555" },
    { label: "Agenda Livre, Lecture de Toulouse", url: "https://infolocale.actu.fr/livre-lecture?com=31555" },
    { label: "Les organismes de Toulouse", url: "https://infolocale.actu.fr/organismes?com=31555" },
    { label: "Les associations de Toulouse", url: "https://infolocale.actu.fr/associations/?com=31555" },
    { label: "Toulouse : Découvrez des activités de loisirs et sports à pratiquer", url: "https://infolocale.actu.fr/activites-pratiquer?com=31555" }
  ];

  return NextResponse.json({ records: categories });
}
