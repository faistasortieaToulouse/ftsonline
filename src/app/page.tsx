'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Book, Film, MapPin, Music, Globe, Gamepad, Calendar, 
  Theater, Palette, Archive, Building, Bus,
  Sun, Cloud, CloudRain, CloudLightning, CloudSnow,
  MessageSquare, Facebook, laptop // Nouvelles icônes pour les 3 cartes
} from "lucide-react";

import { getSaintDuJour } from "../lib/saints";
import { getDictonDuJour } from "../lib/dictons";
import { getCelebrationsDuJour } from "../lib/celebrations";
import { getConseilsJardin } from "../lib/jardin";
import { getSigneZodiaque, getAscendant } from "../lib/astro";

// --- DONNÉES DES CATÉGORIES ---
const categories = [
  { title: "Agenda des événements à Toulouse", href: "/agendatoulouse", icon: Calendar, isAgenda: true },
  {
    title: "Actualités nationale et locale",
    href: "/actualites",
    icon: Globe,
    isActualites: true,
    actualitesSources: [{ title: "Presse", href: "/presse" }],
  },
  {
    title: "Événements Meetup à Toulouse",
    href: "/meetup-full",
    icon: Music,
    isMeetup: true,
    meetupSources: [
      { title: "Les évènements Meetup", href: "/meetup-full" },
      { title: "Nos évènements Meetup", href: "/meetup-events" },
      { title: "Évènements Happy People 31", href: "/meetup-happy" },
      { title: "Évènements de nos groupes - Coloc", href: "/meetup-coloc" },
      { title: "Évènements de nos groupes - Expats", href: "/meetup-expats" },
      { title: "Évènements de nos groupes - Sorties", href: "/meetup-sorties" },
    ],
  },
  {
    title: "Actualités culturelles et scientifiques",
    href: "/culture",
    icon: Theater,
    isCulture: true,
    cultureSources: [
      { title: "Actualités culturelles", href: "/cotetoulouse" },
      { title: "Actualités scientifiques", href: "/canalu" },
    ],
  },
  {
    title: "Sorties en librairie",
    href: "/librairie",
    icon: Book,
    isLibrairie: true,
    librairieSources: [
      { title: "Sorties en librairie", href: "/podlibrairies" },
      { title: "Marathon des Mots", href: "/podmarathon" },
      { title: "Librairie Ombrs Blanches", href: "/podombres" },
      { title: "Librairie Terra Nova", href: "/podterra" },
    ],
  },
  {
    title: "Sorties cinéma",
    href: "/cinema",
    icon: Film,
    isCinema: true,
    cinemaSources: [{ title: "Sorties cinéma", href: "/cinematoulouse" }],
  },
  {
    title: "Sorties jeux de société",
    href: "/jeux",
    icon: Gamepad,
    isJeux: true,
    jeuxSources: [
      { title: "Tric Trac", href: "/trictracphilibert" },
      { title: "Philibert", href: "/philibertnet" },
      { title: "Jeu de Plateau", href: "/jeuplateau" },
    ],
  },
  {
    title: "Culture, sport à Toulouse",
    href: "/air",
    icon: Palette,
    isSites: true,
    sitesSources: [
      { title: "Bibliothèques à Toulouse", href: "/bibliomap" },
      { title: "Cinémas de Toulouse et sa banlieue", href: "/cinemas31" },
      { title: "Galeries d'art de Toulouse", href: "/visitegalerieart" },
      { title: "Équipements de sport à Toulouse", href: "/sport" },
      { title: "Parcs et jardins de Toulouse", href: "/parcjardin" },
    ],
  },
  {
    title: "Musées à Toulouse et en banlieue",
    href: "/musee",
    icon: Archive,
    isMusee: true,
    museeSources: [
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
    ],
  },
  {
    title: "Visites de Toulouse",
    href: "/visites-toulouse",
    icon: Building,
    isVisites: true,
    visitesSources: [
      { title: "Centre de Toulouse", href: "/visitetoulouse" },
      { title: "Quartiers de Toulouse", href: "/visiteruetoulouse" },
      { title: "Exil espagnol", href: "/visiteexil" },
      { title: "Occupation et Résistance", href: "/visiteresistance" },
      { title: "Quartier Saint-Michel", href: "/visitesaintmichel" },
      { title: "Quartier Jolimont", href: "/visitejolimont" },
      { title: "Fontaines de Toulouse", href: "/visitefontaines" },
    ],
  },
  {
    title: "Visites en Occitanie",
    href: "/visites-occitanie",
    icon: MapPin,
    isOccitanie: true,
    occitanieSources: [
      { title: "Ariège", href: "/ariege" },
      { title: "Randonnées Ariège", href: "/randoariege" },
      { title: "Aude", href: "/aude" },
      { title: "Écrivains de l'Aude", href: "/ecrivainsaude" },
      { title: "Châteaux Cathares", href: "/chateaucathare" },
      { title: "Aveyron", href: "/aveyron" },
      { title: "Gers", href: "/gers" },
      { title: "Patrimoine Haute-Garonne", href: "/patrimoine31" },
      { title: "Pyrénées-Orientales", href: "/pyreneesorientales" },
      { title: "Lot", href: "/lot" },
      { title: "Hautes Pyrénées", href: "/hautespyrenees" },
      { title: "Tarn", href: "/tarn" },
      { title: "Tarn-Garonne", href: "/tarngaronne" },
      { title: "Cirque et sommet", href: "/montcirque" },
    ],
  },
  { title: "Transports Tisséo et circulation", href: "/transports-tisseo", icon: Bus },
  
  // --- AJOUT DES 3 NOUVELLES CARTES ICI ---
  { title: "Discord FTS", href: "/discordfts", icon: MessageSquare },
  { title: "Facebook FTS", href: "/facebookfts", icon: Facebook },
  { title: "FTS Online", href: "/ftsfts", icon: Globe },
];

const eventSources = [
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

export default function HomePage() {
  const [heure, setHeure] = useState(new Date());
  const [meteo, setMeteo] = useState({ temperature: "25°C", condition: "Ensoleillé" });
  
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
              Explorez les sites culturels de Toulouse et de sa banlieue, les parcs et jardins, ainsi que les équipements sportifs de la métropole.
              Partez à la découverte des galeries d'art et des visites thématiques à Toulouse : l'exil espagnol, l'occupation allemande et la résistance, les quartiers Saint-Michel et Jolimont, les fontaines et le centre-ville historique, ainsi que tous les quartiers de la ville.
              <br /><br />
              En Occitanie, profitez des itinéraires littéraires dans l'Aude, des randonnées en Ariège, des châteaux cathares, des cirques et sommets régionaux, et explorez chaque département : Ariège, Aude, Aveyron, Gers, Haute-Garonne, Hautes-Pyrénées, Lot, Pyrénées-Orientales, Tarn et Tarn-et-Garonne.
              Enfin, restez informé sur les transports Tisséo et la circulation en Haute-Garonne.
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
          {/* Ligne 1 */}
          <div className="py-4 px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center text-center min-w-[200px]">
              <span className="font-bold capitalize text-purple-800">
                {heure.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </span>
              <span className="font-medium text-3xl text-purple-900">
                {heure.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className="flex-1 text-center border-purple-200 md:border-x px-4">
              <div className="font-medium">Saint du jour : <span className="font-bold text-purple-900">{getSaintDuJour(heure)}</span></div>
              <div className="italic text-sm mt-1 text-purple-600 opacity-80">"{dictonDuJour}"</div>
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
          {/* Ligne 2 */}
          <div className="bg-purple-200/50 border-t border-purple-200 py-2 px-6">
            <div className="flex items-center justify-center gap-3 w-full">
              <span className="text-pink-500 text-lg">✨</span>
              <p className="text-sm font-bold text-purple-900 text-center">{celebrations.join(" • ")}</p>
              <span className="text-pink-500 text-lg">✨</span>
            </div>
          </div>
          {/* Ligne 3 */}
          <div className="bg-green-100/50 border-t border-purple-200 py-3 px-6">
            <div className="flex items-center gap-3 w-full">
              <span className="text-xl">🌱</span>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold uppercase text-green-700">Le conseil jardinage du mois</span>
                <p className="text-xs md:text-sm text-gray-700 italic">{conseilJardin}</p>
              </div>
            </div>
          </div>
          {/* Ligne 4 */}
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
        </section>
      </div>

      {/* Catégories Principales (Incluant maintenant Discord, Facebook et FTS) */}
      <section id="categories" className="py-8 px-4 container mx-auto">
        <h2 className="text-3xl font-bold mb-10 text-center text-purple-700">Nos rubriques</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => {
            const Icon = cat.icon;
            // On vérifie s'il y a des sources définies, sinon on renvoie un tableau vide
            const sources = (cat.isAgenda && eventSources) || (cat.isMeetup && (cat as any).meetupSources) || (cat.isCulture && (cat as any).cultureSources) || (cat.isLibrairie && (cat as any).librairieSources) || (cat.isCinema && (cat as any).cinemaSources) || (cat.isJeux && (cat as any).jeuxSources) || (cat.isSites && (cat as any).sitesSources) || (cat.isMusee && (cat as any).museeSources) || (cat.isActualites && (cat as any).actualitesSources) || (cat.isVisites && (cat as any).visitesSources) || (cat.isOccitanie && (cat as any).occitanieSources) || [];

            return (
              <div key={cat.href} className="flex flex-col h-full p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition border border-gray-100">
                <Icon className="w-10 h-10 text-pink-500 mb-3 mx-auto" />
                <h3 className="text-2xl font-semibold mb-2 text-purple-700 text-center">{cat.title}</h3>
                <div className="text-gray-500 text-sm text-center mb-4 flex-grow">
                   {cat.isAgenda 
                     ? "Accédez à l’agenda complet ou choisissez une source spécifique." 
                     : `Cliquez pour explorer ${cat.title.toLowerCase()}.`}
                </div>
                
                {/* Bouton pour les rubriques sans sources (comme Discord, Facebook, FTS) */}
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