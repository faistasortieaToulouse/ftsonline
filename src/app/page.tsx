'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Book, Film, MapPin, Music, Globe, Gamepad, Calendar, 
  Theater, Palette, Archive, Building, Bus,
  Sun, Cloud, CloudRain, CloudLightning, CloudSnow,
  MessageSquare, Facebook, Laptop, ShoppingCart, Apple,
  Leaf, Sprout, Landmark, Files, Map, History, Scroll,
  Castle, Home, DraftingCompass, Construction, Cake,
  PartyPopper, Church, GraduationCap, Lightbulb, BookOpen,
  Library, Flower, TrainFront, TramFront, Car, Bike, Plane,
  Amphora, CalendarDays, Trees, Hexagon, Languages, PenTool,
  Trophy, Medal, Award, Job, Ticket, Briefcase, Coffee,
  Newspaper, Speech, Users, UserGroup, Smile, Handshake
} from "lucide-react";

import { getSaintDuJour } from "../lib/saints";
import { getDictonDuJour } from "../lib/dictons";
import { getCelebrationsDuJour } from "../lib/celebrations";
import { getConseilsJardin } from "../lib/jardin";
import { getSigneZodiaque, getAscendant } from "../lib/astro";

// Ces lignes doivent être AVANT le "export default function..."
// Si tes fichiers sont dans src/data/celebration/
import annuellesData from "../../data/celebration/celebrations_annuelles.json";
import religieusesData from "../../data/celebration/celebrations_religieuses.json";
import saintsData from "../../data/celebration/celebrations_saints.json";
import bienheureuxData from "../../data/celebration/celebrations_bienheureux.json";
import orthodoxesData from "../../data/celebration/celebrations_orthodoxes.json";
import prenomsData from "../../data/celebration/prenoms_du_jour.json";
import { ChevronDown } from "lucide-react";

import SunCalc from 'suncalc';
import * as Astronomy from 'astronomy-engine';

// --- DONNÉES DES CATÉGORIES ---
const categories = [
  { title: "Agenda des événements à Toulouse", href: "/agendatoulouse", icon: Calendar, isAgenda: true },
  { title: "Actualités nationale et locale", href: "/actualites", icon: Newspaper, isActualites: true, actualitesSources: [
    { title: "Presse", href: "/presse" }
  ]},

  { title: "Événements Meetup à Toulouse", href: "/meetup-full", icon: Music, isMeetup: true, meetupSources: [
    { title: "Les évènements Meetup", href: "/meetup-full" },
    { title: "Nos évènements Meetup", href: "/meetup-events" },
    { title: "Évènements Happy People 31", href: "/meetup-happy" },
    { title: "Évènements de nos groupes - Coloc", href: "/meetup-coloc" },
    { title: "Évènements de nos groupes - Expats", href: "/meetup-expats" },
    { title: "Évènements de nos groupes - Sorties", href: "/meetup-sorties" },
  ]},

/* 1. Évènements Toulouse */
{ 
    title: "Evènements Toulouse", 
    href: "/toulouse-edu-events", // Clé unique
    icon: CalendarDays, 
    isToulouseEvents: true, 
    toulouseEventsSources: [
      { title: "Evènements Toulouse", href: "/toulouseevent" },
      { title: "Évènements à l'université", href: "/universites" },
    ] 
  },

/* 2. Billet spectacle */
  { 
    title: "Billets spectacle", 
    href: "/spectacles", 
    icon: Ticket, 
    isSpectacle: true, 
    spectacleSources: [
      { title: "Billets évènements des Associations", href: "/assotoulouse" },
      { title: "Billèterie Spectacles", href: "/billetticket" }
    ] 
  },

  { title: "Actualités culturelles et scientifiques", href: "/culture", icon: Theater, isCulture: true, cultureSources: [
    { title: "Actualités culturelles", href: "/cotetoulouse" },
    { title: "Actualités scientifiques", href: "/canalu" },
  ]},

  { title: "Sorties en librairie", href: "/librairie", icon: Book, isLibrairie: true, librairieSources: [
    { title: "Sorties en librairie", href: "/podlibrairies" },
    { title: "Librairies à Toulouse", href: "/toulouselibrairies" },
    { title: "Marathon des Mots", href: "/podmarathon" },
    { title: "Librairie Ombrs Blanches", href: "/podombres" },
    { title: "Librairie Terra Nova", href: "/podterra" },
  ]},

  { title: "Sorties cinéma", href: "/cinema", icon: Film, isCinema: true, cinemaSources: [
	{ title: "Sorties cinéma", href: "/cinematoulouse" },
	{ title: "Programmes cinéma", href: "/cinemastoulouse" }
  ] },

  { title: "Sorties jeux de société", href: "/jeux", icon: Gamepad, isJeux: true, jeuxSources: [
    { title: "Tric Trac", href: "/trictracphilibert" },
    { title: "Philibert", href: "/philibertnet" },
    { title: "Jeu de Plateau", href: "/jeuplateau" },
  ]},

  { title: "Discord FTS", href: "/discordfts", icon: MessageSquare },
  { title: "Facebook FTS", href: "/facebookfts", icon: Facebook },
  { title: "Fais Ta Sortie FTS", href: "/ftsfts", icon: Globe },

  // --- Communautés : Sorties et Culture ---
  { 
    title: "Communautés : Sorties et Culture", 
    href: "/communautes", 
    icon: Users, 
    isCommuSorties: true, 
    commuSortiesSources: [
      { title: "Agenda des Communautés", href: "/communautes" },
    ]
  },

  { title: "Culture, sport à Toulouse", href: "/air", icon: Palette, isSites: true, sitesSources: [
    { title: "Bibliothèques à Toulouse", href: "/bibliomap" },
    { title: "Cinémas de Toulouse et sa banlieue", href: "/cinemas31" },
    { title: "Galeries d'art de Toulouse", href: "/visitegalerieart" },
    { title: "Équipements de sport à Toulouse", href: "/sport" },
    { title: "Parcs et jardins de Toulouse", href: "/parcjardin" },
  ]},

  { title: "Musées à Toulouse et en banlieue", href: "/musee", icon: Archive, isMusee: true, museeSources: [
    { title: "Occitanie", href: "/museeoccitanie" },
    { title: "Toulouse", href: "/museestoulouse" },
    { title: "Ariège", href: "/museeariege" },
    { title: "Aude", href: "/museeaude" },
    { title: "Aveyron", href: "/museeaveyron" },
    { title: "Gers", href: "/museegers" },
    { title: "Hérault", href: "/museeherault" },
    { title: "Haute-Garonne", href: "/museehg" },
    { title: "Hautes-Pyrénées", href: "/museehp" },
    { title: "Lot", href: "/museelot" },
    { title: "Pyrénées-Orientales", href: "/museepo" },
    { title: "Tarn", href: "/museetarn" },
    { title: "Tarn-et-Garonne", href: "/museetarngaronne" },
  ]},

  { title: "Visites de Toulouse", href: "/visites-toulouse", icon: Building, isVisites: true, visitesSources: [
    { title: "Centre de Toulouse", href: "/visitetoulouse" },
    { title: "Quartiers de Toulouse", href: "/visiteruetoulouse" },
    { title: "Exil espagnol", href: "/visiteexil" },
    { title: "Occupation et Résistance", href: "/visiteresistance" },
    { title: "Quartier Saint-Michel", href: "/visitesaintmichel" },
    { title: "Quartier Jolimont", href: "/visitejolimont" },
    { title: "Fontaines de Toulouse", href: "/visitefontaines" },
    { title: "Hôtels particuliers de Toulouse", href: "/hotelsparticuliers" },
    { title: "Monuments actuels et disparus de Toulouse", href: "/visitetoulousetotal" },
    { title: "Circuits à Toulouse", href: "/balade" },
    { title: "RAndo-vélo à Toulouse", href: "/randovelos" },
  ]},

  { title: "Visites en Occitanie", href: "/visites-occitanie", icon: MapPin, isOccitanie: true, occitanieSources: [
    { title: "Ariège", href: "/ariege" },
    { title: "Randonnées Ariège", href: "/randoariege" },
    { title: "Aude", href: "/aude" },
    { title: "Écrivains de l'Aude", href: "/ecrivainsaude" },
    { title: "Châteaux Cathares", href: "/chateaucathare" },
    { title: "Aveyron", href: "/aveyron" },
    { title: "Gers", href: "/gers" },
    { title: "Clochers murs du Midi-Toulousain", href: "/clochermur" },
    { title: "Patrimoine Haute-Garonne", href: "/patrimoine31" },
    { title: "Pyrénées-Orientales", href: "/pyreneesorientales" },
    { title: "Lot", href: "/lot" },
    { title: "Hautes Pyrénées", href: "/hautespyrenees" },
    { title: "Tarn", href: "/tarn" },
    { title: "Tarn-Garonne", href: "/tarngaronne" },
    { title: "Cirque et sommet", href: "/montcirque" },
  ]},

  { title: "Transports & Trafic", href: "/transports-tisseo", icon: Bus, isTransport: true, transportSources: [
    { title: "Tisséo Toulouse", href: "/tisseotoulouse" },
    { title: "Bison Futé 31", href: "/bisonfute" },
    { title: "train 1 euro Occitanie", href: "/train1euro" },
    { title: "Voyage", href: "/voyagetoulouse" },
    { title: "Automobile", href: "/automobile" },
  ]},


  /* ---------------- TOULOUSE ---------------- */


  // --- Toulouse : Café des langues ---
  { 
    title: "Toulouse : Café des langues", 
    href: "/langue", 
    icon: Coffee, 
    isCafeLangues: true, 
    cafeLanguesSources: [
      { title: "Café des Langues", href: "/langue" },
    ]
  },

  { title: "Toulouse : Consommation", href: "/marches", icon: Apple, isOccitanie: true, occitanieSources: [
    { title: "Marchés", href: "/marches" },
  ]},

/* 3. Toulouse : Emploi */
  { 
    title: "Toulouse : Emploi", 
    href: "/emploi", 
    icon: Briefcase, 
    isEmploi: true, 
    emploiSources: [
      { title: "Evènements Emploi", href: "/toulousetravail" },
      { title: "Atelier Emploi", href: "/atelieremploi" },
    ] 
  },

  { title: "Toulouse : Environnement", href: "/flore", icon: Flower, isOccitanie: true, occitanieSources: [
    { title: "Flore", href: "/flore" },
  ]},

  { title: "Toulouse : Equipements", href: "/administration", icon: Home, isOccitanie: true, occitanieSources: [
    { title: "Administration", href: "/administration" },
    { title: "Salles de conférences", href: "/conference" },
    { title: "École & Culture", href: "/ecoleculture" },
  ]},

  { title: "Toulouse : Géographie", href: "/altitudes", icon: Map, isOccitanie: true, occitanieSources: [
    { title: "Altitudes", href: "/altitudes" },
    { title: "Codes postaux", href: "/codes-postaux" },
    { title: "Hydrographie", href: "/hydrographie" },
    { title: "Quartiers", href: "/quartiertoulouse" },
    { title: "Voies (carte)", href: "/voiesmap" },
  ]},

  { title: "Toulouse : Histoire", href: "/parcellaire", icon: History, isOccitanie: true, occitanieSources: [
    { title: "Capitale", href: "/capitale_toulouse" },
    { title: "Parcellaire de 1830", href: "/parcellaire" },
    { title: "Terminus des transports en 1863 et 1957", href: "/terminus" },
  ]},

  { title: "Toulouse : Monuments", href: "/lagrave", icon: Castle, isOccitanie: true, occitanieSources: [
    { title: "Hôpital de la Grave", href: "/lagrave" },
    { title: "Hôtel-Dieu", href: "/hoteldieu" },
  ]},


  /* ---------------- LITTERATURE ---------------- */

  { 
    title: "Littératures étrangères", 
    href: "/litterature-etrangere", 
    icon: Languages,
    isLitteratureEtrangere: true, 
    litteratureEtrangereSources: [
      { title: "Littérature Allemande", href: "/LitteratureAllemande" },
      { title: "Littérature Belge", href: "/LitteratureBelge" },
      { title: "Littérature Britannique", href: "/LitteratureBritannique" },
      { title: "Littérature Italienne", href: "/LitteratureItalienne" },
      { title: "Littérature Latino-Américaine", href: "/LitteratureLatinoAmericaine" },
      { title: "Littérature Russe", href: "/LitteratureRusse" },
      { title: "Littérature Suédoise", href: "/LitteratureSuedoise" }
    ]
  },

{ 
    title: "Littérature française", 
    href: "/litterature-francaise", 
    icon: PenTool,
    isLitteratureFrancaise: true, 
    litteratureFrancaiseSources: [
      { title: "Littérature d'Amour", href: "/LitteratureAmour" },
      { title: "Littérature autobiographique", href: "/LitteratureAutoBiographie" },
      { title: "Littérature d'aventure", href: "/LitteratureAventure" },
      { title: "Littérature de Biographie", href: "/LitteratureBiographie" },
      { title: "Littérature Classique", href: "/LitteratureClassique" },
      { title: "Littérature des contes", href: "/LitteratureContes" },
      { title: "Littérature d'Enfance", href: "/LitteratureEnfance" },
      { title: "Littérature d'Espionnage", href: "/LitteratureEspionnage" },
      { title: "Littérature Fantsay", href: "/LitteratureFantasy" },
      { title: "Littérature Historique", href: "/LitteratureHistorique" },
      { title: "Littérature Humaniste", href: "/LitteratureHumaniste" },
      { title: "Littérature d'Humour", href: "/LitteratureHumour" },
      { title: "Littérature des Nouvelles", href: "/LitteratureNouvelles" },
      { title: "Littérature de Philosophie", href: "/LitteraturePhilosophie" },
      { title: "Littérature de Poésie", href: "/LitteraturePoesie" },
      { title: "Littérature Policier", href: "/LitteraturePolicier" },
      { title: "Littérature Politique", href: "/LitteraturePolitique" },
      { title: "Littérature de Science-Fiction", href: "/LitteratureScienceFiction" },
      { title: "Littérature de Théâtre", href: "/LitteratureTheatre" },
      { title: "Littérature de Thrillers", href: "/LitteratureThrillers" },
      { title: "Littérature Triste", href: "/LitteratureTriste" },
      { title: "Littérature de Voyage", href: "/LitteratureVoyage" }
    ]
  },

  { 
    title: "Livres : Prix littéraires", 
    href: "/prix-litteraires", 
    icon: Trophy,
    isLivresPrix: true, 
    livresPrixSources: [
      { title: "Grand Prix Fémina", href: "/GrandPrixFemina" },
      { title: "Prix des Deux Magots", href: "/PrixDeuxMagots" },
      { title: "Prix Flore", href: "/PrixFlore" },
      { title: "Prix France Culture", href: "/prixFranceCulture" },
      { title: "Prix France Culture Télérama", href: "/prixFranceCultureTelerama" },
      { title: "Prix France Télévisions", href: "/PrixFranceTelevisions" },
      { title: "Prix Gongourt", href: "/PrixGoncourt" },
      { title: "Prix Interallié", href: "/PrixInterallie" },
      { title: "Prix des Librairies", href: "/PrixLibraires" },
      { title: "Prix des Livres Magazine Lire", href: "/PrixLivresMagazineLire" },
      { title: "Prix de la Maison de la Presse", href: "/PrixMaisonPresse" },
      { title: "Prix Maurice Renard", href: "/PrixMauriceRenard" },
      { title: "Prix Médicis", href: "/PrixMedicis" },
      { title: "Prix Montyon Littéraire", href: "/PrixMontyonLitteraire" },
      { title: "Prix Montyon Scientifique", href: "/PrixMontyonScientifique" },
      { title: "Prix Montyon de la Vertu", href: "/PrixMontyonVertu" },
      { title: "Prix du Premier Roman", href: "/PrixPremierRoman" },
      { title: "Prix du Quai des Orfèvres", href: "/PrixQuaiOrfevres" },
      { title: "Prix Renaissance", href: "/PrixRenaissance" },
      { title: "Prix Renaudot", href: "/PrixRenaudot" },
      { title: "Prix Total par écrivains", href: "/TotalPrixEcrivain" }
    ]
  },


  /* ---------------- SAVOIRS ---------------- */


  { title: "Savoirs : Architecture", href: "/architecture", icon: DraftingCompass, isOccitanie: true, occitanieSources: [
    { title: "Architecture", href: "/architecture" },
  ]},

/* 4. Savoirs : Europe */
  { 
    title: "Savoirs : Europe", 
    href: "/europe", 
    icon: GraduationCap, 
    isEurope: true, 
    savoirsEuropeSources: [
      { title: "Pays de l'Europe", href: "/europe" },
      { title: "Membres de l'Union Eruopéenne", href: "/membresue" },
      { title: "États associés à l'UE", href: "/associeseurope" },
      { title: "Membres de l'OTAN", href: "/OTAN" },
      { title: "Partenaires de l'OTAN", href: "/OTANsup" }
    ] 
  },

  { title: "Savoirs : Fêtes", href: "/datefetes", icon: PartyPopper, isOccitanie: true, occitanieSources: [
    { title: "Dates des fêtes", href: "/datefetes" },
  ]},

  { title: "Savoirs : Français", href: "/francais", icon: GraduationCap, isOccitanie: true, occitanieSources: [
    { title: "Français", href: "/francais" },
    { title: "Francophonie", href: "/francophonie" },
    { title: "Français Autres", href: "/francaisautres" },
  ]},

  { title: "Savoirs : Hiérarchie", href: "/hierarchie", icon: Library, isOccitanie: true, occitanieSources: [
    { title: "Abyssinien", href: "/hierarchieAbyssinien" },
    { title: "Arabe", href: "/hierarchieArabe" },
    { title: "Chartreux", href: "/hierarchieChartreux" },
    { title: "Chiite", href: "/hierarchieChiite" },
    { title: "Chiite Perse", href: "/hierarchieChiitePerse" },
    { title: "Église", href: "/hierarchieEglise" },
    { title: "Ordre des Hospitaliers", href: "/hierarchieHospitalier" },
    { title: "Empire Indien", href: "/hierarchieInde" },
    { title: "Empire du Japon", href: "/hierarchieJapon" },
    { title: "Ordre de Jérusalem", href: "/hierarchieJerusalem" },
    { title: "Ordre de Malte", href: "/hierarchieMalte" },
    { title: "Empire Moghol", href: "/hierarchieMoghol" },
    { title: "Noblesse", href: "/hierarchieNoblesse" },
    { title: "Ordre d'Orient", href: "/hierarchieOrient" },
    { title: "Empire Ottoman", href: "/hierarchieOttoman" },
    { title: "Papauté", href: "/hierarchiePape" },
    { title: "Empire Perse", href: "/hierarchiePerse" },
    { title: "Sunnite Arabe", href: "/hierarchieSunniteArabe" },
    { title: "Sunnite Maghreb", href: "/hierarchieSunniteMaghreb" },
    { title: "Sunnite Ottoman", href: "/hierarchieSunniteOttoman" },
    { title: "Sunnite", href: "/hierarchieSunnite" },
    { title: "Pape et Pops", href: "/ordreReligieuxPopPape" },
    { title: "type de Noblesse", href: "/typeNoblesse" },
  ]},

  { title: "Savoirs : Histoire", href: "/histoire", icon: Car, isOccitanie: true, occitanieSources: [
    { title: "Dynastie Islam", href: "/dynastieislam" },
    { title: "Expansion Islam", href: "/expansionislam" },
    { title: "Expansion Christianisme", href: "/expansionchristianisme" },
    { title: "Expansion Hébraïsme", href: "/expansionhebraisme" },
    { title: "Hordes & Khanats", href: "/hordes_khanats" },
    { title: "Capitales France", href: "/capitales_france" },
    { title: "Royaumes France", href: "/royaumes_france" },
    { title: "Dynastie Islam Simple", href: "/dynastieislamsimple" },
    { title: "Expansion Islam Simple", href: "/expansionislamsimple" },
    { title: "Hordes & Khanats Simple", href: "/hordes_khanats_simple" },
    { title: "Royaumes France Simple", href: "/royaumes_france_simple" },
    { title: "Entrée des Etats aux USA", href: "/EtatsUSA" },
  ]},

  // --- SAVOIRS : LANGUES ---
  { 
    title: "Savoirs : Langues", 
    href: "/langues", 
    icon: Speech, 
    isSavoirsLangues: true, 
    savoirsLanguesSources: [
      { title: "Les Langues", href: "/langues" },
    ]
  },

  // --- SAVOIRS : MONDE ---
  { 
    title: "Savoirs : Monde", 
    href: "/pib", 
    icon: Globe, 
    isSavoirsMonde: true, 
    savoirsMondeSources: [
      { title: "PIB (PPA/Nominal)", href: "/pib" },
    ]
  },

  { title: "Savoirs : Religion", href: "/religion", icon: Church, isOccitanie: true, occitanieSources: [
    { title: "Religion Chine", href: "/religionchine" },
    { title: "Religions Monde", href: "/religionsmonde" },
    { title: "Religions Part", href: "/religionspart" },
  ]},

  { title: "Savoirs : Territoires français", href: "/territoires-francais", icon: Hexagon,
    isSavoirsTerritoires: true,
    savoirsTerritoiresSources: [
	{ title: "France", href: "/France" },
	{ title: "Anciens départements", href: "/anciensdepartements" },
	{ title: "Colonies en Europe", href: "/colonieeurope" },
	{ title: "Colonies dans le Monde", href: "/coloniefrance" }
  ]},


  /* ---------------- FTS ---------------- */

];

// --- SOURCES ÉVÉNEMENTS ---
const eventSources = [
  { title: "Agenda Toulouse", href: "/agendatoulouse" },
  { title: "Agenda Trad Haute-Garonne", href: "/agenda-trad-haute-garonne" },
  { title: "Agenda Culturel", href: "/agendaculturel" },
  { title: "Capitole Min", href: "/capitole-min" },
  { title: "Cinéma Toulouse", href: "/cinematoulouse" },
  { title: "ComDT", href: "/comdt" },
  { title: "Culture en Mouvements", href: "/cultureenmouvements" },
  { title: "Demosphere", href: "/demosphere" },
  { title: "Discord", href: "/discord" },
  { title: "Écluse", href: "/ecluse" },
  { title: "Haute-Garonne", href: "/hautegaronne" },
  { title: "Radar Squat", href: "/radarsquat" },
  { title: "Théâtre du Pavé", href: "/theatredupave" },
  { title: "Toulouse Métropole", href: "/toulousemetropole" },
  { title: "Tourisme Haute-Garonne", href: "/tourismehautegaronne" },
  { title: "UT3 Min", href: "/ut3-min" },
];

/* ------------------------------------------------------------------ */
/*  MÉTÉO                                                              */
/* ------------------------------------------------------------------ */

// --- COMPOSANT ICÔNE MÉTÉO ---
const WeatherIcon = ({ condition }: { condition: string }) => {
  const iconProps = { size: 36, strokeWidth: 2 };
  const cond = condition?.toLowerCase() || "";
  if (cond.includes("soleil") || cond.includes("ensoleillé")) return <Sun {...iconProps} className="text-orange-500 fill-orange-100" />;
  if (cond.includes("nuage") || cond.includes("couvert")) return <Cloud {...iconProps} className="text-gray-400 fill-gray-100" />;
  if (cond.includes("pluie") || cond.includes("averse")) return <CloudRain {...iconProps} className="text-blue-500" />;
  if (cond.includes("orage")) return <CloudLightning {...iconProps} className="text-yellow-600" />;
  if (cond.includes("neige")) return <CloudSnow {...iconProps} className="text-blue-200" />;
  return <Sun {...iconProps} className="text-orange-500" />;
};

// --- COMPOSANT PRINCIPAL ---
export default function HomePage() {
  const [heure, setHeure] = useState(new Date());
  const [meteo, setMeteo] = useState({ temperature: "25°C", condition: "Ensoleillé" });

  // 1. Coordonnées de Toulouse
  const lat = 43.6045;
  const lng = 1.4442;

  // 2. Calculs Soleil (SunCalc) sécurisés
  const sunTimes = SunCalc.getTimes(heure, lat, lng);
  const dureeMs = sunTimes.sunset.getTime() - sunTimes.sunrise.getTime();
  const dureeHeures = Math.floor(dureeMs / 3600000);
  const dureeMinutes = Math.floor((dureeMs % 3600000) / 60000);

	
  // --- AJOUT POUR L'HEURE DORÉE ET BLEUE ---
// 'goldenHour' est la fin de l'heure dorée le soir
const heureDoree = sunTimes.goldenHour.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'});
// 'dusk' correspond à la fin du crépuscule civil (début de l'heure bleue profonde)
const heureBleue = sunTimes.dusk.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'});

// --- POUR L'INDICE UV / AIR ---
// Si votre API météo ne renvoie pas encore l'UV, on peut l'initialiser par défaut
const indiceUV = meteo.uv || "Faible (1)"; 
const qualiteAir = "Bon (Indice 22)"; // Idéalement à mapper sur meteo.air
	

  // 3. Calculs Lune
  const moonIllum = SunCalc.getMoonIllumination(heure);
  const phase = moonIllum.phase;
  let emojiLune = "🌙";
  if (phase <= 0.05 || phase > 0.95) emojiLune = "🌑";
  else if (phase > 0.45 && phase <= 0.55) emojiLune = "🌕";

  // 4. Calcul Sirius (Correction RA/Dec pour éviter l'erreur "Unknown body")
  const observer = new Astronomy.Observer(lat, lng, 0);
  const siriusRA = 6.75247;
  const siriusDec = -16.7161;

// On supprime le dernier argument pour utiliser le calcul par défaut
const starHorizon = Astronomy.Horizon(
  heure, 
  observer, 
  siriusRA, 
  siriusDec
);

  const siriusVisible = starHorizon.altitude > 0;

  // 5. Constellations avec sécurité (pour éviter le crash au changement de mois)
  const constellationsData = {
    0: { n: "Orion, Taureau", s: "Grand Chien, Carène" },
    1: { n: "Lion, Cancer", s: "Voiles, Hydre" },
    2: { n: "Bouvier, Vierge", s: "Centaure, Croix du Sud" },
    3: { n: "Hercule, Lyre", s: "Loup, Règle" },
    4: { n: "Cygne, Aigle", s: "Scorpion, Sagittaire" },
    5: { n: "Flèche, Dauphin", s: "Autel, Télescope" },
    6: { n: "Pégase, Andromède", s: "Grue, Toucan" },
    7: { n: "Persée, Cassiopée", s: "Phénix, Sculpteur" },
    8: { n: "Baleine, Poissons", s: "Fourneau, Horloge" },
    9: { n: "Céphée, Dragon", s: "Table, Octant" },
    10: { n: "Girafe, Cocher", s: "Peintre, Dorade" },
    11: { n: "Persée, Orion", s: "Colomb, Lièvre" }
  };
  const currentMonth = heure.getMonth();
  const constMonth = constellationsData[currentMonth as keyof typeof constellationsData] || { n: "N/A", s: "N/A" };
  
  const celebrations = getCelebrationsDuJour(heure);
  const dictonDuJour = getDictonDuJour(heure);
  const conseilJardin = getConseilsJardin(heure);
  const signeZodiaque = getSigneZodiaque(heure);
  const ascendant = getAscendant(heure);

  useEffect(() => {
    const timer = setInterval(() => setHeure(new Date()), 60000);
    const fetchWeather = async () => {
      try {
        const response = await fetch('/api/weather');
        if (response.ok) {
          const data = await response.json();
          setMeteo({ temperature: `${Math.round(data.temp)}°C`, condition: data.description });
        }
      } catch (e) { console.error("Erreur météo:", e); }
    };
    fetchWeather();
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="text-center py-16 px-4 bg-pink-500 text-white rounded-b-3xl shadow-lg">
        <h1 className="text-5xl sm:text-6xl font-bold mb-4 drop-shadow-lg text-white">
          Bienvenue sur <span className="text-purple-200">FTS Online</span>
        </h1>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="#categories" className="bg-purple-700 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition">
            Explorer les rubriques
          </Link>
          <a href="https://faistasortieatoulouse.vercel.app/" target="_blank" rel="noopener noreferrer" className="bg-white hover:bg-pink-100 text-pink-600 font-semibold py-3 px-6 rounded-full shadow-lg transition">
            Fais Ta sortie à Toulouse
          </a>
        </div>
      </section>

      {/* Texte de présentation avec barre défilante */}
      <section className="py-10 px-4 max-w-4xl mx-auto">
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-purple-100 p-6 shadow-inner">
          <div className="h-36 overflow-y-auto pr-4 text-center scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent">
            <p className="text-lg text-purple-700 leading-relaxed">
              Cette page présente l'agenda des événements à Toulouse, ainsi que toutes les actualités nationales et locales et les informations sur les transports.
              <br /><br />
              Vous y trouverez les événements de Meetup à Toulouse, l'actualité culturelle et les initiatives de diffusion du savoir.
              Découvrez les sorties en librairie, au cinéma et les activités de jeux de société.
              <br /><br />
              Prenez vos billets pour les spectacles à Toulouse et en banlieue. Rejoignez nos communautés WhatsApp à partir de l’Aegnda des Communautés ou salons Discord pour organiser les sorties ou l’application Sortir à Toulouse.
              <br /><br />
              Explorez les sites culturels de Toulouse et de sa banlieue, les parcs et jardins, ainsi que les équipements sportifs de la métropole. Partez à la découverte des galeries d'art et des visites thématiques à Toulouse : l'exil espagnol, l'occupation allemande et la résistance, les quartiers Saint-Michel et Jolimont, les fontaines et le centre-ville historique, ainsi que tous les quartiers de la ville.
              <br /><br />
              Découvrez les cafés des langues à Toulouse, aidez-vous de nos ressources en matière d’Emploi, parcourez les données sur Toulouse.
              <br /><br />
              Explorez les sites culturels de Toulouse et de sa banlieue, les parcs et jardins, ainsi que les équipements sportifs de la métropole.
              Partez à la découverte des galeries d'art et des visites thématiques à Toulouse : l'exil espagnol, l'occupation allemande et la résistance, les quartiers Saint-Michel et Jolimont, les fontaines et le centre-ville historique, ainsi que tous les quartiers de la ville.
              <br /><br />
              En Occitanie, profitez des itinéraires littéraires dans l'Aude, des randonnées en Ariège, des châteaux cathares, des cirques et sommets régionaux, et explorez chaque département : Ariège, Aude, Aveyron, Gers, Haute-Garonne, Hautes-Pyrénées, Lot, Pyrénées-Orientales, Tarn et Tarn-et-Garonne.
              Enfin, restez informé sur les transports Tisséo et la circulation en Haute-Garonne.
              <br /><br />
              Et complétez vos connaissances en matière de livres à lire à travers les documents sur la Littérature française ou étrangère. Les Savoirs sur la France, l’Europe et le Monde.
            </p>
          </div>
          {/* Petit indicateur visuel qu'il y a du texte en dessous */}
          <div className="text-center mt-2 text-purple-300 animate-bounce">
            ↓
          </div>
        </div>
      </section>

{/* Barre d'informations */}
<div className="px-4 max-w-6xl mx-auto mb-12">
  <section className="bg-purple-100 text-purple-700 rounded-2xl shadow-md border border-purple-200 overflow-hidden flex flex-col">
    
    {/* Ligne 1 : Date, Heure, Saint, Dicton et Météo */}
    <div className="py-4 px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex flex-col items-center text-center min-w-[200px]">
        <span className="font-bold capitalize text-purple-800">
          {heure.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </span>
        <span className="font-medium text-3xl text-purple-900">
          {heure.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      <div className="flex-1 text-center border-purple-200 md:border-x px-4 flex flex-col justify-center gap-2">
        <div className="font-medium">
          Saint du jour : <span className="font-bold text-purple-900">{getSaintDuJour(heure)}</span>
        </div>
        <div className="font-medium">
          Dicton du jour : <span className="font-bold text-purple-900 italic">"{dictonDuJour}"</span>
        </div>
      </div>

      <div className="flex items-center gap-4 min-w-[160px] justify-end">
        <WeatherIcon condition={meteo.condition} />
        <div className="flex flex-col text-right">
          <span className="text-[10px] uppercase font-bold opacity-60">Météo Toulouse</span>
          <span className="font-bold text-2xl leading-none">{meteo.temperature}</span>
          <span className="text-xs font-medium capitalize">{meteo.condition}</span>
        </div>
      </div>
    </div>

    {/* Ligne 2 : Célébrations textuelles */}
    <div className="bg-purple-200/50 border-t border-purple-200 py-2 px-6">
      <div className="flex items-center justify-center gap-3 w-full">
        <span className="text-pink-500 text-lg">✨</span>
        <p className="text-sm font-bold text-purple-900 text-center">{celebrations.join(" • ")}</p>
        <span className="text-pink-500 text-lg">✨</span>
      </div>
    </div>

    {/* Ligne 3 : Conseil Jardinage */}
    <div className="bg-green-100/50 border-t border-purple-200 py-3 px-6">
      <div className="flex items-center gap-3 w-full">
        <span className="text-xl">🌱</span>
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-bold uppercase text-green-700">Le conseil jardinage du mois</span>
          <p className="text-xs md:text-sm text-gray-700 italic">{conseilJardin}</p>
        </div>
      </div>
    </div>

{/* --- Bloc unique : Éphéméride & Environnement --- */}
<div className="bg-indigo-900/10 border-t border-purple-200 py-2 px-6">
  <div className="flex flex-wrap justify-around items-center gap-y-3 gap-x-6 text-[11px] font-medium text-indigo-800">
    
    {/* 1. Tendance Lumière */}
    <div className="flex items-center gap-1.5">
      <span className="text-sm">📈</span> 
      <span>Lumière : <b className="text-indigo-900">En augmentation</b></span>
    </div>

    {/* 2. Groupe Photo (Dorée & Bleue) */}
    <div className="flex items-center gap-4 border-l border-indigo-200 pl-4">
      <div className="flex items-center gap-1.5">
        <span className="text-sm" title="Heure Dorée (Lumière chaude)">📷</span> 
        <span>Heure Dorée : <b className="text-indigo-900">{heureDoree}</b></span>
      </div>
      <div className="flex items-center gap-1.5 border-l border-indigo-100 pl-4">
        <span className="text-sm" title="Heure Bleue (Crépuscule)">🌃</span>
        <span>Heure Bleue : <b className="text-indigo-900">{heureBleue}</b></span>
      </div>
    </div>

    {/* 3. Environnement (Vent & Air) */}
    <div className="flex items-center gap-4 border-l border-indigo-200 pl-4">
      <div className="flex items-center gap-1.5">
        <span className="text-sm" title="Vent d'Autan">💨</span>
        <span>Vent d'Autan : <b className="text-indigo-900">{meteo.condition.includes("Vent") ? "Actif" : "Calme"}</b></span>
      </div>
      <div className="flex items-center gap-1.5 border-l border-indigo-100 pl-4">
        <span className="text-sm" title="Qualité de l'air">🍃</span>
        <span>Air : <span className="text-emerald-700 font-extrabold">{qualiteAir}</span></span>
      </div>
    </div>

    {/* 4. Santé (UV) */}
    <div className="flex items-center gap-1.5 border-l border-indigo-200 pl-4">
      <span className="text-sm" title="Indice UV">🕶️</span>
      <span>UV : <b className="text-indigo-900">{indiceUV}</b></span>
    </div>

  </div>
</div>

    {/* Ligne 4 : Astro (Zodiaque) */}
    <div className="bg-blue-50/50 border-t border-purple-200 py-2 px-6">
      <div className="flex items-center justify-center gap-6 w-full text-sm">
        <div className="flex items-center gap-2">
          <span className="text-blue-500 text-lg">☀️</span>
          <span className="text-gray-500 font-medium italic">Signe :</span>
          <span className="font-bold text-blue-900">{signeZodiaque}</span>
        </div>
        <div className="w-px h-4 bg-purple-200 hidden sm:block"></div>
        <div className="flex items-center gap-2">
          <span className="text-indigo-500 text-lg">🌅</span>
          <span className="text-gray-500 font-medium italic">Ascendant :</span>
          <span className="font-bold text-indigo-900">{ascendant}</span>
        </div>
      </div>
    </div>

    {/* Ligne 5 : MENUS DÉROULANTS */}
    <div className="bg-white/40 border-t border-purple-200 py-3 px-6">
      <div className="flex flex-wrap justify-center gap-3">
        <span className="text-sm font-bold text-purple-900/60 uppercase tracking-wider mr-2">
          Célébrations :
        </span>

        {(() => {
          const jourMois = heure.toLocaleDateString("fr-FR", { day: "numeric", month: "long" }).toLowerCase();
          
          const sections = [
            { 
              label: "Nationales", 
              data: (() => {
                const specific = annuellesData.find(d => d.date.toLowerCase().trim() === jourMois);
                if (specific) return specific.details;
                const generales = annuellesData.find(d => d.date === "Internationales et nationales");
                return generales ? generales.details : [];
              })()
            },
            { label: "Religieuses", data: religieusesData.find(d => d.date.toLowerCase() === jourMois)?.celebrations },
            { label: "Saints", data: saintsData.find(d => d.date.toLowerCase() === jourMois)?.saints },
            { label: "Bienheureux", data: bienheureuxData.find(d => d.date_standard.toLowerCase() === jourMois)?.personnalites },
            { label: "Orthodoxes", data: orthodoxesData.find(d => d.date_propre.toLowerCase() === jourMois)?.saints },
            { label: "Prénoms", data: prenomsData.find(d => d.date.toLowerCase() === jourMois)?.prenoms },
          ];

          return sections.map((sec, idx) => (
            <div key={idx} className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-purple-600 hover:text-white text-purple-700 rounded-lg text-sm font-bold transition-all border border-purple-200 shadow-sm">
                {sec.label}
                <ChevronDown className="w-4 h-4 opacity-50" />
              </button>

              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-80 bg-white border border-purple-200 shadow-2xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-4">
                <div className="text-xs font-black uppercase text-purple-400 mb-2 border-b border-purple-50 pb-2">
                  {sec.label} du {jourMois}
                </div>
                <ul className="max-h-60 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-purple-200 pr-2">
                  {sec.data && sec.data.length > 0 ? (
                    sec.data.map((text: string, i: number) => (
                      <li key={i} className="text-base text-slate-700 leading-relaxed list-none pl-0 border-b border-slate-50 last:border-0 pb-2">
                        • {text}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-400 italic text-center py-2">Aucune donnée pour aujourd'hui</li>
                  )}
                </ul>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white"></div>
              </div>
            </div>
          ));
        })()}
      </div>
    </div>

{/* Ligne 6 : ÉPHÉMÉRIDES ASTRONOMIQUES */}
<div className="bg-blue-600 text-yellow-400 border-t border-purple-200 py-3 px-6">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
    
    {/* Soleil */}
    <div className="flex items-center gap-3 justify-center md:justify-start">
      <span className="text-yellow-400 text-xl">☀️</span>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold text-yellow-400">Soleil (Toulouse)</span>
        <div className="text-xs font-bold text-slate-200">
          {sunTimes.sunrise.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})} 
          <span className="mx-2 text-slate-600">|</span>
          {sunTimes.sunset.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}
        </div>
        <span className="text-[10px] italic text-yellow-200/50">Jour : {dureeHeures}h {dureeMinutes}min</span>
      </div>
    </div>

    {/* Lune & Sirius */}
    <div className="flex items-center gap-3 justify-center border-y md:border-y-0 md:border-x border-slate-800 py-2 md:py-0">
      <span className="text-2xl">{emojiLune}</span>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold text-yellow-400">Lune & Étoiles</span>
        <span className="text-xs text-slate-200">Phase : <b>{(moonIllum.fraction * 100).toFixed(0)}%</b></span>
        <span className={`text-[10px] font-medium ${siriusVisible ? 'text-cyan-400' : 'text-red-400'}`}>
          ✨ Sirius : {siriusVisible ? `Visible (${starHorizon.altitude.toFixed(0)}°)` : "Sous l'horizon"}
        </span>
      </div>
    </div>

    {/* Constellations */}
    <div className="flex flex-col items-center md:items-end">
      <span className="text-[10px] uppercase font-bold text-yellow-400 mb-1">Ciel du mois</span>
      <div className="flex flex-col gap-1 text-[10px] text-center md:text-right">
        <div><span className="text-blue-400 font-bold">Nord:</span> {constMonth.n}</div>
        <div><span className="text-emerald-400 font-bold">Sud:</span> {constMonth.s}</div>
      </div>
    </div>
  </div>
</div>

    {/* Ligne 7 : EXPLICATIONS SOLSTICES TOULOUSE */}
    <div className="bg-blue-700 text-white py-4 px-6 border-t border-blue-500/30">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-xs uppercase font-black tracking-widest text-yellow-400 mb-3 text-center md:text-left">
          ☀️ Variations saisonnières à Toulouse
        </h3>
        <p className="text-sm leading-relaxed mb-4 text-slate-100">
          À Toulouse, les variations de la durée du jour sont marquées par les deux solstices :
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-800/40 p-3 rounded-lg border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🌻</span>
              <span className="font-bold text-yellow-300 text-sm">Le jour le plus long</span>
            </div>
            <p className="text-[11px] text-slate-200">
              <span className="font-bold">Solstice d'été (v. 21 juin) :</span> La durée du jour atteint environ <span className="text-white font-bold">15h 25min</span>. Lever à 6h05, coucher à 21h30.
            </p>
          </div>
          <div className="bg-blue-800/40 p-3 rounded-lg border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">❄️</span>
              <span className="font-bold text-cyan-300 text-sm">Le jour le plus court</span>
            </div>
            <p className="text-[11px] text-slate-200">
              <span className="font-bold">Solstice d'hiver (v. 21 décembre) :</span> La durée du jour descend à environ <span className="text-white font-bold">8h 56min</span>. Lever à 8h20, coucher à 17h20.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

{/* Catégories */}
      <section id="categories" className="py-8 px-4 container mx-auto">
        <h2 className="text-3xl font-bold mb-10 text-center text-purple-700">Nos rubriques</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const sources =
              (cat.isAgenda && eventSources) ||
              (cat.isMeetup && (cat as any).meetupSources) ||
              ((cat as any).isToulouseEvents && (cat as any).toulouseEventsSources) ||
              (cat.isCulture && (cat as any).cultureSources) ||
              (cat.isLibrairie && (cat as any).librairieSources) ||
              (cat.isCinema && (cat as any).cinemaSources) ||
              (cat.isJeux && (cat as any).jeuxSources) ||
              (cat.isSites && (cat as any).sitesSources) ||
              (cat.isMusee && (cat as any).museeSources) ||
              (cat.isActualites && (cat as any).actualitesSources) ||
              (cat.isVisites && (cat as any).visitesSources) ||
              
              // --- NOUVELLES CATÉGORIES AJOUTÉES ICI ---
              (cat.isCafeLangues && (cat as any).cafeLanguesSources) ||
              (cat.isCommuSorties && (cat as any).commuSortiesSources) ||
              (cat.isSavoirsLangues && (cat as any).savoirsLanguesSources) ||
              (cat.isSavoirsMonde && (cat as any).savoirsMondeSources) ||
              // -----------------------------------------

              (cat.isSpectacle && (cat as any).spectacleSources) ||
              (cat.isEmploi && (cat as any).emploiSources) ||
              (cat.isTransport && (cat as any).transportSources) ||
              (cat.isEurope && (cat as any).savoirsEuropeSources) ||
              (cat.isOccitanie && (cat as any).occitanieSources) ||
              (cat.savoirSources && (cat as any).savoirSources) ||
              (cat.isLitteratureEtrangere && (cat as any).litteratureEtrangereSources) ||
              (cat.isLitteratureFrancaise && (cat as any).litteratureFrancaiseSources) ||
              (cat.isLivresPrix && (cat as any).livresPrixSources) ||
              (cat.isSavoirsTerritoires && (cat as any).savoirsTerritoiresSources) ||
              [];

            return (
              <div key={cat.href} className="flex flex-col h-full p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition border border-gray-100">
                <Icon className="w-10 h-10 text-pink-500 mb-3 mx-auto" />
                <h3 className="text-2xl font-semibold mb-2 text-purple-700 text-center">{cat.title}</h3>
                <div className="text-gray-500 text-sm text-center mb-4 flex-grow">
                  {cat.isAgenda 
                    ? "Accédez à l’agenda complet ou choisissez une source spécifique." 
                    : `Cliquez pour explorer ${cat.title.toLowerCase()}.`}
                </div>

                {sources.length === 0 ? (
                  <Link href={cat.href} className="mt-auto bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold py-2 px-4 rounded-xl transition text-center">
                    Voir la rubrique
                  </Link>
                ) : (
                  <div className="overflow-x-auto w-full py-2 mt-auto">
                    <div className="flex gap-4">
                      {sources.map((src: any) => (
                        <Link key={src.href} href={src.href} className="flex-shrink-0 w-52 bg-purple-50 rounded-xl shadow-sm p-3 hover:shadow-md transition text-center border border-gray-100">
                          <p className="text-purple-700 font-medium text-sm">{src.title}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
