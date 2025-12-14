// src/app/api/visitejolimont/route.ts

import { NextRequest, NextResponse } from "next/server";

interface JolimontPlace {
  nomLieu: string;
  num: string;
  typeRue: string;
  nomRue: string;
  // lat: number; // Supprimé
  // lng: number; // Supprimé
  appartient: string;
  site: string;
  quartier: string;
  établissement: string;
  sigles: string;
  signification: string;
}

export async function GET(req: NextRequest) {
  const data: JolimontPlace[] = [
    { nomLieu: "Couvent des Capucins (Carmes)", num: "33", typeRue: "Av.", nomRue: "Jean Rieux", appartient: "religieux", site: "colline", quartier: "Guilheméry", établissement: "Couvent / Monastère", sigles: "", signification: "Couvent des Carmes déchaussés" },
    { nomLieu: "Église Sainte-Thérèse", num: "12", typeRue: "Rue", nomRue: "Belle Paule", appartient: "religieux", site: "colline", quartier: "Guilheméry", établissement: "Église moderne", sigles: "", signification: "Église de l'Enfant Jésus de Prague" },
    { nomLieu: "Lycée Le Caousou", num: "42", typeRue: "Av.", nomRue: "Camille Pujol", appartient: "éducatif", site: "colline", quartier: "Guilheméry", établissement: "Institution privée historique", sigles: "LE C", signification: "Institution d'enseignement privé catholique" },
    { nomLieu: "Caserne Pérignon", num: "42", typeRue: "Av.", nomRue: "Camille Pujol", appartient: "militaire", site: "colline", quartier: "Guilheméry", établissement: "Ancienne caserne (proche Lycée Le Caousou)", sigles: "", signification: "Zone militaire transformée en équipements" },
    { nomLieu: "Parc ancien Château Sacarin", num: "2", typeRue: "rue", nomRue: "Jean Micloud", appartient: "parc", site: "plaine", quartier: "Bonnefoy", établissement: "Espace vert", sigles: "", signification: "Vestiges d'un ancien domaine bourgeois" },
    { nomLieu: "Parc et Kiosque à Musique Pinel", num: "0", typeRue: "Pl.", nomRue: "Marius Pinel", appartient: "parc", site: "plaine", quartier: "Marengo", établissement: "Place publique", sigles: "", signification: "Kiosque historique au centre de la place" },
    { nomLieu: "Statuaire (Rue de Luppé)", num: "11", typeRue: "Rue", nomRue: "de Luppé", appartient: "architecture", site: "plaine", quartier: "Marengo", établissement: "Façade remarquable", sigles: "", signification: "Bâtiment avec éléments décoratifs" },
    { nomLieu: "Maison Virebent", num: "24", typeRue: "av", nomRue: "du Cimetière", appartient: "architecture", site: "plaine", quartier: "Marengo", établissement: "Maison historique", sigles: "", signification: "Utilisation de la terre cuite décorative (Virebent)" },
    { nomLieu: "Obélisque et Chambre Funéraire", num: "1", typeRue: "av", nomRue: "du Cimetière", appartient: "monument", site: "plaine", quartier: "Marengo", établissement: "Monument funéraire", sigles: "", signification: "Entrée du cimetière Terre-Cabade (1814)" },
    { nomLieu: "Maison Giscard", num: "31", typeRue: "rue", nomRue: "Paul Dupin", appartient: "architecture", site: "colline", quartier: "Marengo", établissement: "Maison décorée", sigles: "", signification: "Façade décorée par la famille Giscard" },
    { nomLieu: "Fabrique Giscard", num: "25", typeRue: "av", nomRue: "de la Colonne", appartient: "historique", site: "colline", quartier: "Jolimont", établissement: "Ancienne manufacture", sigles: "MH", signification: "Fabrique de terre cuite, classée Monument Historique" },
    { nomLieu: "Parc Reilles", num: "17", typeRue: "rue", nomRue: "Reille", appartient: "parc", site: "colline", quartier: "Jolimont", établissement: "Espace vert", sigles: "", signification: "Parc public du quartier" },
    { nomLieu: "Collège des Ursulines", num: "34", typeRue: "av", nomRue: "de la Colonne", appartient: "religieux", site: "colline", quartier: "Jolimont", établissement: "Institution éducative", sigles: "", signification: "Ancien couvent et établissement scolaire" },
    { nomLieu: "Église Saint-Sylve", num: "6", typeRue: "rue", nomRue: "Reille", appartient: "religieux", site: "colline", quartier: "Jolimont", établissement: "Église paroissiale", sigles: "", signification: "Lieu de culte local" },
    { nomLieu: "Parc Saint-Sylve", num: "6", typeRue: "rue", nomRue: "Reille", appartient: "parc", site: "colline", quartier: "Jolimont", établissement: "Jardin public", sigles: "", signification: "Espace vert attenant à l'église" },
    { nomLieu: "Maison Octogonale (Montcabrier)", num: "35", typeRue: "rue", nomRue: "Montcabrier", appartient: "architecture", site: "colline", quartier: "Jolimont", établissement: "Villa bourgeoise", sigles: "", signification: "Architecture distinctive sur la colline" },
    { nomLieu: "Maison Vierge et Mosaïques", num: "3", typeRue: "rue", nomRue: "de l'Obélisque", appartient: "architecture", site: "colline", quartier: "Marengo", établissement: "Maison décorée", sigles: "", signification: "Façade avec décorations religieuses et mosaïques" },
    { nomLieu: "Maison Octogonale (Obélisque)", num: "1", typeRue: "rue", nomRue: "de l'Obélisque", appartient: "architecture", site: "colline", quartier: "Marengo", établissement: "Villa bourgeoise", sigles: "", signification: "Architecture distinctive sur la colline" },
    { nomLieu: "Observatoire et Parc", num: "1", typeRue: "Av.", nomRue: "Camille Flammarion", appartient: "scientifique", site: "colline", quartier: "Jolimont", établissement: "Observatoire", sigles: "SAP", signification: "Société d'Astronomie Populaire de Toulouse" },
    { nomLieu: "Parc de la Colonne et Obélisque", num: "16", typeRue: "Av.", nomRue: "Camille Flammarion", appartient: "monument", site: "colline", quartier: "Jolimont", établissement: "Obélisque / Parc", sigles: "1814", signification: "Monument commémoratif de la Bataille de Toulouse" },
    { nomLieu: "Parc Félix Lavit", num: "16", typeRue: "rue", nomRue: "Urbain le Verrier", appartient: "parc", site: "colline", quartier: "Jolimont", établissement: "Jardin public", sigles: "", signification: "Espace vert local" },
    { nomLieu: "Villa Méricant", num: "64", typeRue: "Rue", nomRue: "du Dix Avril", appartient: "architecture", site: "colline", quartier: "Marengo", établissement: "Maison historique", sigles: "", signification: "Ancienne villa de plaisance" },
    { nomLieu: "Maison à Tourelles", num: "15", typeRue: "Rue", nomRue: "Jolimont", appartient: "architecture", site: "colline", quartier: "Jolimont", établissement: "Résidence bourgeoise", sigles: "", signification: "Caractéristique avec éléments décoratifs (tourelles)" },
    { nomLieu: "Jardin Michelet", num: "27", typeRue: "rue", nomRue: "Périole", appartient: "parc", site: "plaine", quartier: "Bonnefoy", établissement: "Espace vert", sigles: "", signification: "Jardin public du quartier Bonnefoy" },
    { nomLieu: "Église de l'Immaculée Conception", num: "1", typeRue: "Pl.", nomRue: "du Chanoine Philippe Ravary", appartient: "religieux", site: "colline", quartier: "Bonnefoy", établissement: "Église principale", sigles: "", signification: "Lieu de culte et institution de Bonnefoy" },
    { nomLieu: "Grotte de Lourdes/Sanctuaire Notre-Dame", num: "2", typeRue: "Pl.", nomRue: "du Chanoine Philippe Ravary", appartient: "religieux", site: "colline", quartier: "Bonnefoy", établissement: "Sanctuaire", sigles: "", signification: "Grotte de Lourdes et fontaine miraculeuse" },
    { nomLieu: "Communauté des Filles de Jésus", num: "0", typeRue: "Pl.", nomRue: "du Chanoine Philippe Ravary", appartient: "religieux", site: "colline", quartier: "Bonnefoy", établissement: "Communauté / Institution", sigles: "CDDJ", signification: "Filles de Jésus, liées à l'institution Notre-Dame de Rivières" },
  ];

  return NextResponse.json(data);
}