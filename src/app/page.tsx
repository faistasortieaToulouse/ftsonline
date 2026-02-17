'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Newspaper, Speech, Users, UserGroup, Smile, Handshake,
  ChevronDown, Wind, Droplets, Sun as SunIcon, Navigation,
  Timer, Mountain, Store, Share2, Download
} from "lucide-react";
import APKDownloadModal from "@/components/APKDownloadModal";
import InstallPWAiOS from "@/components/InstallPWAiOS";
import DesktopOnly from "@/components/DesktopOnly";
import DesktopQRCode from "@/components/DesktopQRCode";
import { Button } from "@/components/ui/button";

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

import SunCalc from 'suncalc';
import * as Astronomy from 'astronomy-engine';

// --- COMPTEURS MANUELS ---
const nbAgenda = 16;
const nbActualites = 2;
const nbMeetup = 6;
const nbToulouseEvents = 2;
const nbSpectacles = 2;
const nbCulture = 2;
const nbLibrairie = 5;
const nbCinema = 2;
const nbJeux = 3;
const nbDiscord = 1;
const nbFacebook = 1;
const nbFS = 1;
const nbCommunaute = 2;
const nbSport = 5;
const nbMusee = 13;
const nbVisite = 11;
const nbOccitanie = 18;
const nbTransport = 16;
const nbCafeLangue = 2;
const nbConsomamtion = 2;
const nbEmploi = 4;
const nbFlore = 1;
const nbEquipement = 3;
const nbGeographie = 5;
const nbHistoire = 3;
const nbMonument = 2;
const nbLittératureEt = 7;
const nbLittératureFr = 22;
const nbPrix = 21;
const nbArchitecture = 1;
const nbEurope = 6;
const nbFete = 2;
const nbFrancais = 3;
const nbHierarchie = 23;
const nbSaHistoire = 12;
const nbLangue = 1;
const nbMonde = 37;
const nbReligion = 3;
const nbTerritoire = 8;
const totalArticles = 
  nbAgenda + nbActualites + nbMeetup + nbToulouseEvents + 
  nbSpectacles + nbCulture + nbLibrairie + nbCinema + 
  nbJeux + nbDiscord + nbFacebook + nbFS + 
  nbCommunaute + nbSport + nbMusee + nbVisite + 
  nbOccitanie + nbTransport + nbCafeLangue + nbConsomamtion + 
  nbEmploi + nbFlore + nbEquipement + nbGeographie + 
  nbHistoire + nbMonument + nbLittératureEt + nbLittératureFr + 
  nbPrix + nbArchitecture + nbEurope + nbFete + 
  nbFrancais + nbHierarchie + nbSaHistoire + nbLangue + 
  nbMonde + nbReligion + nbTerritoire;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mon Application TWA/PWA",
          text: "Téléchargez Mon Application pour ne rien manquer de nos événements et discussions !",
          url: "https://faistasortieatoulouse.online",
        });
        toast({ title: "Partage réussi 🎉", description: "Merci d'avoir partagé l'application !" });
      } catch {
        toast({
          title: "Partage annulé",
          description: "Le partage a été interrompu ou non supporté par le navigateur.",
          variant: "destructive",
        });
      }
    } else {
      navigator.clipboard.writeText("https://faistasortieatoulouse.online");
      toast({
        title: "Lien copié !",
        description: "Le lien de l'application a été copié dans votre presse-papiers.",
      });
    }
  };

// --- DONNÉES DES CATÉGORIES ---
const categories = [
  { title: "Agenda des événements à Toulouse", href: "/agendatoulouse", icon: Calendar, isAgenda: true },
// const nbAgenda = 16;
	
  { title: "Actualités nationale et locale", href: "/actualites", icon: Newspaper, isActualites: true, actualitesSources: [
    { title: "Presse", href: "/presse" }
    { title: "Médias locaux", href: "/media" }
  ]},
// const nbActualites = 2;	

  { title: "Événements Meetup à Toulouse", href: "/meetup-full", icon: Music, isMeetup: true, meetupSources: [
    { title: "Les évènements Meetup", href: "/meetup-full" },
    { title: "Nos évènements Meetup", href: "/meetup-events" },
    { title: "Évènements Happy People 31", href: "/meetup-happy" },
    { title: "Évènements de nos groupes - Coloc", href: "/meetup-coloc" },
    { title: "Évènements de nos groupes - Expats", href: "/meetup-expats" },
    { title: "Évènements de nos groupes - Sorties", href: "/meetup-sorties" },
  ]},
// const nbMeetup = 6;
	
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
	// const nbToulouseEvents = 2;
	
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
// const nbSpectacles = 2;	

  { title: "Actualités culturelles et scientifiques", href: "/culture", icon: Theater, isCulture: true, cultureSources: [
    { title: "Actualités culturelles", href: "/cotetoulouse" },
    { title: "Actualités scientifiques", href: "/canalu" },
  ]},
// const nbCulture = 2;	

  { title: "Sorties en librairie", href: "/librairie", icon: Book, isLibrairie: true, librairieSources: [
    { title: "Sorties en librairie", href: "/podlibrairies" },
    { title: "Librairies à Toulouse", href: "/toulouselibrairies" },
    { title: "Marathon des Mots", href: "/podmarathon" },
    { title: "Librairie Ombrs Blanches", href: "/podombres" },
    { title: "Librairie Terra Nova", href: "/podterra" },
  ]},
// const nbLibrairie = 5;	

  { title: "Sorties cinéma", href: "/cinema", icon: Film, isCinema: true, cinemaSources: [
	{ title: "Sorties cinéma", href: "/cinematoulouse" },
	{ title: "Programmes cinéma", href: "/cinemastoulouse" }
  ] },
// const nbCinema = 2;	

  { title: "Sorties jeux de société", href: "/jeux", icon: Gamepad, isJeux: true, jeuxSources: [
    { title: "Tric Trac", href: "/trictracphilibert" },
    { title: "Philibert", href: "/philibertnet" },
    { title: "Jeu de Plateau", href: "/jeuplateau" },
  ]},
// const nbJeux = 3;	

  { title: "Discord FTS", href: "/discordfts", icon: MessageSquare },
//  const nbDiscord = 1;
	
  { title: "Facebook FTS", href: "/facebookfts", icon: Facebook },
//  const nbFacebook = 1;
	
  { title: "Fais Ta Sortie FTS", href: "/ftsfts", icon: Globe },
//  const nbFS = 1;

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
//  const nbCommunaute = 2;

  { title: "Culture, sport à Toulouse", href: "/air", icon: Palette, isSites: true, sitesSources: [
    { title: "Bibliothèques à Toulouse", href: "/bibliomap" },
    { title: "Cinémas de Toulouse et sa banlieue", href: "/cinemas31" },
    { title: "Galeries d'art de Toulouse", href: "/visitegalerieart" },
    { title: "Équipements de sport à Toulouse", href: "/sport" },
    { title: "Parcs et jardins de Toulouse", href: "/parcjardin" },
  ]},
//  const nbSport = 5;

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
//  const nbMusee = 13;

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
    { title: "Rando-vélo à Toulouse", href: "/randovelos" },
  ]},
//  const nbVisite = 11;

  { title: "Visites en Occitanie", href: "/visites-occitanie", icon: MapPin, isOccitanie: true, occitanieSources: [
    { title: "Plages de mer", href: "/plages" },
    { title: "Plages de lac", href: "/lacbaignade" },
    { title: "Stations de ski", href: "/ski" },
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
//  const nbOccitanie = 18;

  { title: "Transports & Trafic", href: "/transports-tisseo", icon: Bus, isTransport: true, transportSources: [
    { title: "Tisséo Arrêts par itinéraire", href: "/tisseoarretitineraire" },
    { title: "Tisséo Arrêts Logiques", href: "/tisseoarretlogique" },
    { title: "Tisséo Arrêts Physiques", href: "/tisseoarretphysique" },
    { title: "Tisséo Départs et Terminus", href: "/tisseoitineraire" },
    { title: "Tisséo Lignes de bus", href: "/tisseoligne" },
    { title: "Tisséo Parking Relais", href: "/tisseoparking" },
    { title: "Tisséo TAD de la banlieue", href: "/tisseotad" },
    { title: "Tisséo par quartier", href: "/tisseotia" },
    { title: "Tisséo itinéraire par quartier", href: "/tisseotiaiti" },
    { title: "Tisséo Vél'O Toulouse", href: "/tisseovelo" },
    { title: "train 1 euro Occitanie", href: "/train1euro" },
    { title: "Voyage", href: "/voyagetoulouse" },
    { title: "Automobile", href: "/automobile" },
    { title: "Circulation", href: "/voitures" },
	{ title: "Trafic Automobile", href: "/tomtom" },
  ]},
//  const nbTransport = 16;


  /* ---------------- TOULOUSE ---------------- */


  // --- Toulouse : Café des langues ---
  { 
    title: "Toulouse : Café des langues", 
    href: "/langue", 
    icon: Coffee, 
    isCafeLangues: true, 
    cafeLanguesSources: [
      { title: "Café des Langues", href: "/langue" },
      { title: "Forum des Langues", href: "/forum" },
    ]
  },
//  const nbCafeLangue = 2;

  { title: "Toulouse : Consommation", href: "/marches", icon: Apple, isOccitanie: true, occitanieSources: [
    { title: "Marchés", href: "/marches" },
	{ title: "Cuisine de Toulouse", href: "/cuisinetoulouse" },
  ]},
//  const nbConsomamtion = 2;

/* 3. Toulouse : Emploi */
  { 
    title: "Toulouse : Emploi", 
    href: "/emploi", 
    icon: Briefcase, 
    isEmploi: true, 
    emploiSources: [
      { title: "Evènements Emploi", href: "/toulousetravail" },
      { title: "Atelier Emploi", href: "/atelieremploi" },
      { title: "Entreprises à Toulouse", href: "/entreprisetoulouse" },
	  { title: "Formation et Orientation", href: "/formation" },
    ] 
  },
//  const nbEmploi = 4;

    { title: "Toulouse : Environnement", href: "/flore", icon: Flower, isOccitanie: true, occitanieSources: [
    { title: "Flore", href: "/flore" },
  ]},
//  const nbFlore = 1;

  { title: "Toulouse : Equipements", href: "/administration", icon: Home, isOccitanie: true, occitanieSources: [
    { title: "Administration", href: "/administration" },
    { title: "Salles de conférences", href: "/conference" },
    { title: "École & Culture", href: "/ecoleculture" },
  ]},
//  const nbEquipement = 3;

  { title: "Toulouse : Géographie", href: "/altitudes", icon: Map, isOccitanie: true, occitanieSources: [
    { title: "Altitudes", href: "/altitudes" },
    { title: "Codes postaux", href: "/codes-postaux" },
    { title: "Hydrographie", href: "/hydrographie" },
    { title: "Quartiers", href: "/quartiertoulouse" },
    { title: "Voies (carte)", href: "/voiesmap" },
  ]},
//  const nbGeographie = 5;

  { title: "Toulouse : Histoire", href: "/parcellaire", icon: History, isOccitanie: true, occitanieSources: [
    { title: "Capitale", href: "/capitale_toulouse" },
    { title: "Parcellaire de 1830", href: "/parcellaire" },
    { title: "Terminus des transports en 1863 et 1957", href: "/terminus" },
  ]},
//  const nbHistoire = 3;

  { title: "Toulouse : Monuments", href: "/lagrave", icon: Castle, isOccitanie: true, occitanieSources: [
    { title: "Hôpital de la Grave", href: "/lagrave" },
    { title: "Hôtel-Dieu", href: "/hoteldieu" },
  ]},
//  const nbMonument = 2;


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
//  const nbLittératureEt = 7;

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
//  const nbLittératureFr = 22;

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
//  const nbPrix = 21;


  /* ---------------- SAVOIRS ---------------- */


  { title: "Savoirs : Architecture", href: "/architecture", icon: DraftingCompass, isOccitanie: true, occitanieSources: [
    { title: "Architecture", href: "/architecture" },
  ]},
//  const nbArchitecture = 1;

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
      { title: "Villes de l'Europe", href: "/villeseurope" },
      { title: "Membres de l'OTAN", href: "/OTAN" },
      { title: "Partenaires de l'OTAN", href: "/OTANsup" }
    ] 
  },
//  const nbEurope = 6;

  { title: "Savoirs : Fêtes", href: "/datefetes", icon: PartyPopper, isOccitanie: true, occitanieSources: [
    { title: "Dates des fêtes", href: "/datefetes" },
    { title: "Constellations", href: "/constellation" },
  ]},
//  const nbFete = 2;

  { title: "Savoirs : Français", href: "/francais", icon: GraduationCap, isOccitanie: true, occitanieSources: [
    { title: "Français", href: "/francais" },
    { title: "Francophonie", href: "/francophonie" },
    { title: "Français Autres", href: "/francaisautres" },
  ]},
//  const nbFrancais = 3;

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
    { title: "Sunnite", href: "/hierarchieSunnite" },
    { title: "Sunnite Arabe", href: "/hierarchieSunniteArabe" },
    { title: "Sunnite Maghreb", href: "/hierarchieSunniteMaghreb" },
    { title: "Sunnite Ottoman", href: "/hierarchieSunniteOttoman" },
    { title: "Pape et Pops", href: "/ordreReligieuxPopPape" },
    { title: "type de Noblesse", href: "/typeNoblesse" },
  ]},
//  const nbHierarchie = 23;

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
//  const nbSaHistoire = 12;

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
//  const nbLangue = 1;

  // --- SAVOIRS : MONDE ---
  { 
    title: "Savoirs : Monde", 
    href: "/pib", 
    icon: Globe, 
    isSavoirsMonde: true, 
    savoirsMondeSources: [
      { title: "Mapmonde", href: "/mapmonde" },
      { title: "PIB (PPA/Nominal)", href: "/pib" },
      { title: "Villes d'Afrique du Sud ", href: "/afriquedusud" },
      { title: "Villes d'Andorre ", href: "/andorre" },
      { title: "Villes d'Argentine ", href: "/argentine" },
      { title: "Villes d'Australie ", href: "/australie" },
      { title: "Villes du Brésil", href: "/bresil" },
      { title: "Villes du Canada", href: "/canada" },
      { title: "Villes du Chili", href: "/chili" },
      { title: "Villes de la Chine", href: "/chine" },
      { title: "Villes de la Colombie", href: "/colombie" },
      { title: "Villes des Etats-Unis ", href: "/etatsunis" },
      { title: "Villes en Europe", href: "/europeen" },
      { title: "Villes d'Inde", href: "/inde" },
      { title: "Villes d'Iran ", href: "/iran" },
      { title: "Villes du Japon", href: "/japon" },
      { title: "Villes du Mexique", href: "/mexique" },
      { title: "Villes du Pérou", href: "/perou" },
      { title: "Villes de Russie", href: "/russie" },
      { title: "Villes de Turquie", href: "/turquie" },
      { title: "Pays et villes du monde", href: "/monde" },
      { title: "Niveau d'alphabétisation", href: "/pays_alphabetisation" },
      { title: "Bonheur National Brut", href: "/pays_bonheur_national" },
      { title: "Niveau d'éducation", href: "/pays_education" },
      { title: "Indice d'inégalités", href: "/pays_indice_inegalites" },
      { title: "Mécanisation agricole", href: "/pays_mecanique_agricole" },
      { title: "Natalité et Fécondité", href: "/pays_natalite_fecondite" },
      { title: "Niveau de développement", href: "/pays_niveau_developpement" },
      { title: "Niveau de vie", href: "/pays_niveau_vie" },
      { title: "Pauvreté d'apprentissage", href: "/pays_pauvrete_apprentissage" },
      { title: "Niveau de pollution", href: "/pays_pollution" },
      { title: "Pouvoir d'achat", href: "/pays_pouvoir_achat" },
      { title: "Niveau de la Recherche", href: "/pays_recherche" },
      { title: "Taux de pauvreté", href: "/pays_taux_pauvrete" },
      { title: "Niveau technologique", href: "/pays_technologie" },
      { title: "Valeur des monnaies", href: "/pays_valeur_monnaie" },
      { title: "Vie par pays", href: "/vivrebienpays" },
    ]
  },
//  const nbMonde = 37;

    { title: "Savoirs : Religion", href: "/religion", icon: Church, isOccitanie: true, occitanieSources: [
    { title: "Religion Chine", href: "/religionchine" },
    { title: "Religions Monde", href: "/religionsmonde" },
    { title: "Religions Part", href: "/religionspart" },
  ]},
//  const nbReligion = 3;

  { title: "Savoirs : Territoires français", href: "/territoires-francais", icon: Hexagon,
    isSavoirsTerritoires: true,
    savoirsTerritoiresSources: [
	{ title: "France", href: "/France" },
	{ title: "Frontières de la France", href: "/frontieres" },
	{ title: "Enclaves et Exclaves", href: "/enclave" },
	{ title: "Villes en France", href: "/population" },
	{ title: "PIB des villes en France", href: "/villespib" },
	{ title: "Anciens départements", href: "/anciensdepartements" },
	{ title: "Colonies en Europe", href: "/colonieeurope" },
	{ title: "Colonies dans le Monde", href: "/coloniefrance" }
  ]},
//  const nbTerritoire = 8;


  /* ---------------- FTS ---------------- */

];

// --- SOURCES ÉVÉNEMENTS ---
const eventSources = [
  { title: "Agenda Toulouse", href: "/agendatoulouse" },
  { title: "Agenda Trad Haute-Garonne", href: "/agenda-trad" },
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
  const [meteo, setMeteo] = useState({ temperature: "--", condition: "--", vitesseVent: "--" // On prépare la case pour le vent
});

// --- AJOUT : État pour les statistiques annuelles ---
  const [annuelData, setAnnuelData] = useState<any>(null);

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

// Logique automatique pour la tendance de la lumière
const moisActuel = heure.getMonth() + 1;
const jourActuel = heure.getDate();

// Du 21 juin au 20 décembre, la lumière baisse
const estEnBaisse = (moisActuel === 6 && jourActuel >= 21) || (moisActuel > 6 && moisActuel < 12) || (moisActuel === 12 && jourActuel < 21);

const tendanceLumiere = estEnBaisse ? "En diminution" : "En augmentation";
const iconeLumiere = estEnBaisse ? "📉" : "📈";

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
    // 1. Gestion de l'horloge (mise à jour toutes les minutes)
    const timer = setInterval(() => {
      setHeure(new Date());
    }, 60000);

    // 2. Fonction unique pour récupérer toutes les données
    const fetchData = async () => {
      try {
        const resMeteo = await fetch('/api/meteo');
        
        if (resMeteo.ok) {
          const m = await resMeteo.json();
          
          setAnnuelData(m); 
          
          setMeteo({
            temperature: `${m.stats?.avgTemp || '--'}°C`,
            condition: m.condition || 'Ensoleillé',
            vitesseVent: m.vitesseVent || 0
          });
        }
      } catch (e) {
        console.error("Erreur lors de la récupération des données:", e);
      }
    };

    fetchData();

    // Nettoyage à la fermeture de la page
    return () => clearInterval(timer);
  }, []); // Le tableau vide [] signifie "exécuter une seule fois au chargement"

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="text-center py-16 px-4 bg-pink-500 text-white rounded-b-3xl shadow-lg">
        <h1 className="text-5xl sm:text-6xl font-bold mb-4 drop-shadow-lg text-white">
          Bienvenue sur <span className="text-purple-200">FTS Toulouse</span>
        </h1>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="#categories" className="bg-purple-700 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition">
            Explorer les rubriques
          </Link>
          <a href="https://faistasortieatoulouse31.vercel.app/" target="_blank" rel="noopener noreferrer" className="bg-white hover:bg-pink-100 text-pink-600 font-semibold py-3 px-6 rounded-full shadow-lg transition">
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
<div className="bg-indigo-900/10 border-t border-purple-200 py-6 px-4 md:py-4 md:px-6">
  {/* 1. flex-wrap : permet aux deux grandes sections de passer l'une sous l'autre.
      2. justify-center : centre les blocs si on est en mode "empilé".
  */}
  <div className="flex flex-wrap justify-center md:justify-around items-center gap-y-8 gap-x-6 text-[11px] font-medium text-indigo-800">
    
    {/* SECTION 1 : LUMIÈRE & PHOTO */}
    {/* flex-wrap ici aussi pour que si les 3 items photo ne tiennent pas, ils créent une 2ème ligne */}
    <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4">
      <div className="flex items-center gap-1.5">
        <span className="text-sm">{iconeLumiere}</span> 
        <span className="whitespace-nowrap">
          Lumière : <b className="text-indigo-900">{tendanceLumiere}</b>
        </span>
      </div>
      
      {/* Utilisation de border-l seulement si on a de la place */}
      <div className="flex items-center gap-1.5 border-l border-indigo-200 pl-4">
        <span className="text-sm">📷</span> 
        <span className="whitespace-nowrap">Heure Dorée : <b className="text-indigo-900">{heureDoree}</b></span>
      </div>

      <div className="flex items-center gap-1.5 border-l border-indigo-200 pl-4">
        <span className="text-sm">🌃</span>
        <span className="whitespace-nowrap">Heure Bleue : <b className="text-indigo-900">{heureBleue}</b></span>
      </div>
    </div>

    {/* SECTION 2 : ENVIRONNEMENT */}
    {/* On ajoute une bordure à gauche SEULEMENT sur grand écran (md:border-l) */}
    <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4 md:border-l md:border-indigo-300 md:pl-6">
      
      {/* Vent */}
      <div className="flex items-center gap-2">
        <span className="text-sm">💨</span>
        <div className="flex flex-col leading-tight">
          <span className="whitespace-nowrap">
            Vent : <b className="text-indigo-900">{meteo?.vitesseVent || '--'} km/h</b>
          </span>
          <span className="text-[9px] opacity-70 italic">
             Autan : {meteo?.condition?.includes("Vent") ? "Actif" : "Calme"}
          </span>
        </div>
      </div>

      {/* Air */}
      <div className="flex items-center gap-2 border-l border-indigo-100 pl-4">
        <span className="text-sm">🍃</span>
        <span className="whitespace-nowrap">
          Air : <span className="text-emerald-700 font-extrabold">{qualiteAir}</span>
        </span>
      </div>

      {/* UV */}
      <div className="flex items-center gap-2 border-l border-indigo-100 pl-4">
        <span className="text-sm">🕶️</span>
        <span className="whitespace-nowrap">
          UV : <b className="text-indigo-900">{indiceUV}</b>
        </span>
      </div>
    </div>

  </div>
</div>

{/* 3. BILAN ANNUEL */}
<div className="flex flex-wrap items-center justify-center gap-3 border-l-2 md:border-l-0 md:border-t-2 border-indigo-300 bg-white/40 py-1.5 px-3 rounded-xl shadow-sm mx-auto w-fit">

  <div className="flex flex-col leading-none border-r border-indigo-200 pr-3 mr-1">
    <span className="text-[9px] uppercase font-black text-indigo-500 tracking-tighter">Bilan Toulouse</span>
    <span className="text-[10px] font-bold text-indigo-900 italic tracking-tight">Depuis le 1er janv.</span>
  </div>

  {/* Soleil : Réel vs Normale */}
  <div className="flex items-center gap-1.5">
    <span className="text-sm">☀️</span>
    <div className="flex flex-col leading-none">
      <span className="text-[11px]">Soleil : <b className="text-indigo-900">{annuelData?.stats?.totalSunshine || '--'}h</b></span>
      <span className="text-[8px] text-slate-400 font-bold">Normale : 2 112.3h</span>
    </div>
  </div>

  {/* Pluie : Réel vs Normale */}
  <div className="flex items-center gap-1.5 border-l border-indigo-100 pl-3">
    <span className="text-sm">💧</span>
    <div className="flex flex-col leading-none">
      <span className="text-[11px]">Pluie : <b className="text-indigo-900">{annuelData?.stats?.totalRain || '--'}mm</b></span>
      <span className="text-[8px] text-slate-400 font-bold">Normale : 600.1mm</span>
    </div>
  </div>

  {/* Vent Max */}
  <div className="flex items-center gap-1.5 border-l border-indigo-100 pl-3">
    <span className="text-sm">🌪️</span>
    <div className="flex flex-col leading-none">
      <span className="text-[11px]">Vent Max : <b className="text-indigo-900">{annuelData?.stats?.maxWind || '--'}km/h</b></span>
      <span className="text-[8px] text-slate-400 font-bold italic">Records 2026</span>
    </div>
  </div>

  {/* État du Sol */}
  <div className="flex items-center gap-1.5 border-l border-indigo-100 pl-3">
    <span className="text-sm">🌱</span>
    <div className="flex flex-col leading-none">
      <span className="text-[11px]">Sol : <b className={parseFloat(annuelData?.stats?.waterBalance) < 0 ? "text-orange-700" : "text-emerald-700"}>
        {annuelData?.stats?.waterBalance || '--'}mm
      </b></span>
      <span className="text-[8px] text-slate-400 font-bold uppercase">{parseFloat(annuelData?.stats?.waterBalance) < 0 ? "Déficit" : "Excédent"}</span>
    </div>
    </div>
	    </div>

{/* --- AJOUT DE TA PHRASE DE RÉFÉRENCE --- */}
  <div className="w-full text-center mb-1">
    <p className="text-[10px] font-medium text-indigo-700/80">
      Moyennes Toulouse : <span className="font-bold">2 112.3 h/an</span> d'ensoleillement • <span className="font-bold">600.1 mm/an</span> de pluie
    </p>
  </div>
  {/* ---------------------------------------- */}

{/* Ligne 4 : Astro (Zodiaque) */}
<div className="bg-blue-50/50 border-t border-purple-200 py-3 px-4 md:px-6">
  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 w-full text-sm">
    
    {/* Signe Solaire */}
    <div className="flex items-center gap-2">
      <span className="text-blue-500 text-lg">☀️</span>
      <span className="text-gray-500 font-medium italic">Signe :</span>
      <span className="font-bold text-blue-900">{signeZodiaque}</span>
    </div>

    {/* Séparateur vertical (caché sur mobile, affiché à partir de 'sm') */}
    <div className="hidden sm:block w-px h-4 bg-purple-200"></div>
    
    {/* Séparateur horizontal (affiché sur mobile, caché sur 'sm') */}
    <div className="sm:hidden w-1/4 h-px bg-purple-100"></div>

    {/* Ascendant */}
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
        <span className="text-sm font-bold text-purple-900/60 uppercase tracking-wider mr-2 self-center">
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
    <div className="bg-blue-700 text-white py-6 px-6 border-t border-blue-500/30">
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

    {/* Ligne 8 : NAVIGATION RAPIDE VERS LES MÉTÉOS SPÉCIFIQUES */}
    <div className="bg-slate-900 border-t border-white/10 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 mb-8 text-center">
          Accès rapide aux météos thématiques
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			
		{/* Bouton Météo Toulouse Futur */}
          <Link href="/meteofutur" className="group">
            <div className="bg-sky-600/10 hover:bg-sky-600 border border-sky-500/30 p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 group-hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] group-hover:-translate-y-1">
              <div className="bg-sky-500 text-white p-2 rounded-xl group-hover:bg-white group-hover:text-sky-600 transition-colors">
                <MapPin size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-sky-400 group-hover:text-white text-[10px] font-bold uppercase tracking-tight">Météo de</span>
                <span className="text-white font-black text-lg">Toulouse</span>
              </div>
            </div>
          </Link>
			
		{/* Bouton Météo Occitanie */}
          <Link href="/meteooccitanie" className="group">
            <div className="bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/30 p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 group-hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] group-hover:-translate-y-1">
              <div className="bg-indigo-500 text-white p-2 rounded-xl group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                <Navigation size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-indigo-400 group-hover:text-white text-[10px] font-bold uppercase tracking-tight">Météo en</span>
                <span className="text-white font-black text-lg">Occitanie</span>
              </div>
            </div>
          </Link>
          
          {/* Bouton Météo Aude */}
          <Link href="/meteoaude" className="group">
            <div className="bg-purple-600/10 hover:bg-purple-600 border border-purple-500/30 p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 group-hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] group-hover:-translate-y-1">
              <div className="bg-purple-500 text-white p-2 rounded-xl group-hover:bg-white group-hover:text-purple-600 transition-colors">
                <Navigation size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-purple-400 group-hover:text-white text-[10px] font-bold uppercase tracking-tight">Météo</span>
                <span className="text-white font-black text-lg">Aude (11)</span>
              </div>
            </div>
          </Link>

          {/* Bouton Météo des Lacs */}
          <Link href="/meteolac" className="group">
            <div className="bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/30 p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:-translate-y-1">
              <div className="bg-emerald-500 text-white p-2 rounded-xl group-hover:bg-white group-hover:text-emerald-600 transition-colors">
                <Navigation size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-emerald-400 group-hover:text-white text-[10px] font-bold uppercase tracking-tight">Météo des</span>
                <span className="text-white font-black text-lg">Lacs</span>
              </div>
            </div>
          </Link>

          {/* Bouton Météo Montagne */}
          <Link href="/meteomontagne" className="group">
            <div className="bg-blue-600/10 hover:bg-blue-600 border border-blue-500/30 p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:-translate-y-1">
              <div className="bg-blue-500 text-white p-2 rounded-xl group-hover:bg-white group-hover:text-blue-600 transition-colors">
                <Navigation size={22} className="rotate-45" />
              </div>
              <div className="flex flex-col">
                <span className="text-blue-400 group-hover:text-white text-[10px] font-bold uppercase tracking-tight">Météo de</span>
                <span className="text-white font-black text-lg">Montagne</span>
              </div>
            </div>
          </Link>

          {/* Bouton Météo Plage */}
          <Link href="/meteoplage" className="group">
            <div className="bg-orange-600/10 hover:bg-orange-600 border border-orange-500/30 p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] group-hover:-translate-y-1">
              <div className="bg-orange-500 text-white p-2 rounded-xl group-hover:bg-white group-hover:text-orange-600 transition-colors">
                <Sun size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-orange-400 group-hover:text-white text-[10px] font-bold uppercase tracking-tight">Météo de</span>
                <span className="text-white font-black text-lg">Plage</span>
              </div>
            </div>
          </Link>

{/* Bouton Météo Andorre */}
<Link href="/meteoandorre" className="group">
  <div className="bg-orange-600/10 hover:bg-orange-600 border border-orange-500/30 p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] group-hover:-translate-y-1">
    <div className="bg-orange-500 text-white p-2 rounded-xl group-hover:bg-white group-hover:text-orange-600 transition-colors">
      <Mountain size={22} />
    </div>
    <div className="flex flex-col">
      <span className="text-orange-400 group-hover:text-white text-[10px] font-bold uppercase tracking-tight">Météo en</span>
      <span className="text-white font-black text-lg">Andorre</span>
    </div>
  </div>
</Link>

			{/* Bouton Météo Espagne */}
          <Link href="/meteoespagne" className="group">
            <div className="bg-amber-600/10 hover:bg-amber-600 border border-amber-500/30 p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 group-hover:shadow-[0_0_20px_rgba(217,119,6,0.4)] group-hover:-translate-y-1">
              <div className="bg-amber-500 text-white p-2 rounded-xl group-hover:bg-white group-hover:text-amber-600 transition-colors">
                <Navigation size={22} className="rotate-90" />
              </div>
              <div className="flex flex-col">
                <span className="text-amber-400 group-hover:text-white text-[10px] font-bold uppercase tracking-tight">Météo en</span>
                <span className="text-white font-black text-lg">Espagne</span>
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  </section>
</div>

{/* Catégories */}
      <section id="categories" className="py-8 px-4 container mx-auto">
        <h2 className="text-3xl font-bold mb-10 text-center text-purple-700">Nos rubriques</h2>
		  {/* AJOUTE CETTE LIGNE CI-DESSOUS */}
		  {/* TON COMPTEUR ICI */}
		    <div className="text-center mb-4 font-medium text-slate-500 italic">
 		     Nombre total de ressources : <span className="font-bold text-purple-600">{totalArticles}</span> articles
		    </div>
		 <p className="text-center mt-8 mb-10 text-slate-600 font-medium">
		   Rejoins <a href="https://faistasortieatoulouse31.vercel.app/" className="text-blue-600 hover:underline font-bold">Fais ta Sortie à Toulouse</a> pour organiser tes sorties !
		 </p>
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
{/* Section téléchargement / partage */}
<section className="flex flex-col items-center gap-6 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl w-full overflow-hidden">
  
  {/* Ligne supérieure : Google Play + APK */}
  <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 w-full">
    <a
      href="https://play.google.com/store/apps/details?id=com.votre.appli.android"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center space-x-2 p-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition"
    >
      <Store className="h-5 w-5" />
      <Image
        src="/images/google-play-badge.png"
        alt="Disponible sur Google Play"
        width={180}
        height={53}
        className="w-auto h-auto"
      />
    </a>

{/* Téléchargement Direct de l'APK (Ton fichier dans /public) */}
    <a
      href="/fts-toulouse.apk"
      download="FTS_Toulouse_Online.apk"
      className="flex items-center space-x-2 p-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition"
    >
      <Download className="h-5 w-5" />
      <span className="font-semibold text-sm text-center">Télécharger l'APK <br/><span className="text-[10px] opacity-80">(Installation directe)</span></span>
    </a>

    <APKDownloadModal />
  </div>

{/* Ligne inférieure : QR code + bouton partager */}
<div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">

  <div className="flex flex-col items-center">
    <InstallPWAiOS />
  </div>

  {/* QR code centré sous le bloc */}
<DesktopOnly>
  <div className="no-desktop">
    <DesktopQRCode />
  </div>
</DesktopOnly>
  
  <Button
    onClick={handleShare}
    className="flex items-center justify-center space-x-2 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg transition w-full sm:w-auto"
  >
    <Share2 className="h-5 w-5" />
    <span className="font-semibold">Partager l'application</span>
  </Button>
</div>
</section>
    </div>
  );
}
