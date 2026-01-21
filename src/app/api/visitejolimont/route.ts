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
    { nomLieu: "Couvent des Capucins (Carmes)", num: "33", typeRue: "Av.", nomRue: "Jean Rieux", appartient: "religieux", site: "colline", quartier: "Guilheméry", établissement: "Couvent / Monastère", sigles: "", signification: "Couvent des Carmes déchaussés", lat: 43.5975, lng: 1.4608 },
    { nomLieu: "Église Sainte-Thérèse", num: "12", typeRue: "Rue", nomRue: "Belle Paule", appartient: "religieux", site: "colline", quartier: "Guilheméry", établissement: "Église moderne", sigles: "", signification: "Église de l'Enfant Jésus de Prague", lat: 43.5991, lng: 1.4661 },
    { nomLieu: "Lycée Le Caousou", num: "42", typeRue: "Av.", nomRue: "Camille Pujol", appartient: "éducatif", site: "colline", quartier: "Guilheméry", établissement: "Institution privée historique", sigles: "LE C", signification: "Institution d'enseignement privé catholique", lat: 43.6019, lng: 1.4632 },
    { nomLieu: "Caserne Pérignon", num: "42", typeRue: "Av.", nomRue: "Camille Pujol", appartient: "militaire", site: "colline", quartier: "Guilheméry", établissement: "Ancienne caserne (proche Lycée Le Caousou)", sigles: "", signification: "Zone militaire transformée en équipements", lat: 43.6033, lng: 1.4645 },
    { nomLieu: "Parc ancien Château Sacarin", num: "2", typeRue: "rue", nomRue: "Jean Micloud", appartient: "parc", site: "plaine", quartier: "Bonnefoy", établissement: "Espace vert", sigles: "", signification: "Vestiges d'un ancien domaine bourgeois", lat: 43.6198, lng: 1.4556 },
    { nomLieu: "Parc et Kiosque à Musique Pinel", num: "0", typeRue: "Pl.", nomRue: "Marius Pinel", appartient: "parc", site: "plaine", quartier: "Marengo", établissement: "Place publique", sigles: "", signification: "Kiosque historique au centre de la place", lat: 43.6092, lng: 1.4583 },
    { nomLieu: "Statuaire (Rue de Luppé)", num: "11", typeRue: "Rue", nomRue: "de Luppé", appartient: "architecture", site: "plaine", quartier: "Marengo", établissement: "Façade remarquable", sigles: "", signification: "Bâtiment avec éléments décoratifs", lat: 43.6085, lng: 1.4552 },
    { nomLieu: "Maison Virebent", num: "24", typeRue: "av", nomRue: "du Cimetière", appartient: "architecture", site: "plaine", quartier: "Marengo", établissement: "Maison historique", sigles: "", signification: "Utilisation de la terre cuite décorative (Virebent)", lat: 43.6111, lng: 1.4578 },
    { nomLieu: "Obélisque et Chambre Funéraire", num: "1", typeRue: "av", nomRue: "du Cimetière", appartient: "monument", site: "plaine", quartier: "Marengo", établissement: "Monument funéraire", sigles: "", signification: "Entrée du cimetière Terre-Cabade (1814)", lat: 43.6115, lng: 1.4592 },
    { nomLieu: "Maison Giscard", num: "31", typeRue: "rue", nomRue: "Paul Dupin", appartient: "architecture", site: "colline", quartier: "Marengo", établissement: "Maison décorée", sigles: "", signification: "Façade décorée par la famille Giscard", lat: 43.6121, lng: 1.4558 },
    { nomLieu: "Fabrique Giscard", num: "25", typeRue: "av", nomRue: "de la Colonne", appartient: "historique", site: "colline", quartier: "Jolimont", établissement: "Ancienne manufacture", sigles: "MH", signification: "Fabrique de terre cuite, classée Monument Historique", lat: 43.6108, lng: 1.4599 },
    { nomLieu: "Parc Reilles", num: "17", typeRue: "rue", nomRue: "Reille", appartient: "parc", site: "colline", quartier: "Jolimont", établissement: "Espace vert", sigles: "", signification: "Parc public du quartier", lat: 43.6151, lng: 1.4642 },
    { nomLieu: "Collège des Ursulines", num: "34", typeRue: "av", nomRue: "de la Colonne", appartient: "religieux", site: "colline", quartier: "Jolimont", établissement: "Institution éducative", sigles: "", signification: "Ancien couvent et établissement scolaire", lat: 43.6121, lng: 1.4605 },
    { nomLieu: "Église Saint-Sylve", num: "6", typeRue: "rue", nomRue: "Reille", appartient: "religieux", site: "colline", quartier: "Jolimont", établissement: "Église paroissiale", sigles: "", signification: "Lieu de culte local", lat: 43.6146, lng: 1.4635 },
    { nomLieu: "Parc Saint-Sylve", num: "6", typeRue: "rue", nomRue: "Reille", appartient: "parc", site: "colline", quartier: "Jolimont", établissement: "Jardin public", sigles: "", signification: "Espace vert attenant à l'église", lat: 43.6148, lng: 1.4638 },
    { nomLieu: "Maison Octogonale (Montcabrier)", num: "35", typeRue: "rue", nomRue: "Montcabrier", appartient: "architecture", site: "colline", quartier: "Jolimont", établissement: "Villa bourgeoise", sigles: "", signification: "Architecture distinctive sur la colline", lat: 43.6141, lng: 1.4619 },
    { nomLieu: "Maison Vierge et Mosaïques", num: "3", typeRue: "rue", nomRue: "de l'Obélisque", appartient: "architecture", site: "colline", quartier: "Marengo", établissement: "Maison décorée", sigles: "", signification: "Façade avec décorations religieuses et mosaïques", lat: 43.6105, lng: 1.4589 },
    { nomLieu: "Maison Octogonale (Obélisque)", num: "1", typeRue: "rue", nomRue: "de l'Obélisque", appartient: "architecture", site: "colline", quartier: "Marengo", établissement: "Villa bourgeoise", sigles: "", signification: "Architecture distinctive sur la colline", lat: 43.6103, lng: 1.4588 },
    { nomLieu: "Observatoire et Parc", num: "1", typeRue: "Av.", nomRue: "Camille Flammarion", appartient: "scientifique", site: "colline", quartier: "Jolimont", établissement: "Observatoire", sigles: "SAP", signification: "Société d'Astronomie Populaire de Toulouse", lat: 43.6133, lng: 1.4628 },
    { nomLieu: "Parc de la Colonne et Obélisque", num: "16", typeRue: "Av.", nomRue: "Camille Flammarion", appartient: "monument", site: "colline", quartier: "Jolimont", établissement: "Obélisque / Parc", sigles: "1814", signification: "Monument commémoratif de la Bataille de Toulouse", lat: 43.6115, lng: 1.4618 },
    { nomLieu: "Parc Félix Lavit", num: "16", typeRue: "rue", nomRue: "Urbain le Verrier", appartient: "parc", site: "colline", quartier: "Jolimont", établissement: "Jardin public", sigles: "", signification: "Espace vert local", lat: 43.6155, lng: 1.4612 },
    { nomLieu: "Villa Méricant", num: "64", typeRue: "Rue", nomRue: "du Dix Avril", appartient: "architecture", site: "colline", quartier: "Marengo", établissement: "Maison historique", sigles: "", signification: "Ancienne villa de plaisance", lat: 43.6135, lng: 1.4568 },
    { nomLieu: "Maison à Tourelles", num: "15", typeRue: "Rue", nomRue: "Jolimont", appartient: "architecture", site: "colline", quartier: "Jolimont", établissement: "Résidence bourgeoise", sigles: "", signification: "Caractéristique avec éléments décoratifs (tourelles)", lat: 43.6158, lng: 1.4631 },
    { nomLieu: "Jardin Michelet", num: "27", typeRue: "rue", nomRue: "Périole", appartient: "parc", site: "plaine", quartier: "Bonnefoy", établissement: "Espace vert", sigles: "", signification: "Jardin public du quartier Bonnefoy", lat: 43.6171, lng: 1.4525 },
    { nomLieu: "Église de l'Immaculée Conception", num: "1", typeRue: "Pl.", nomRue: "du Chanoine Philippe Ravary", appartient: "religieux", site: "colline", quartier: "Bonnefoy", établissement: "Église principale", sigles: "", signification: "Lieu de culte et institution de Bonnefoy", lat: 43.6181, lng: 1.4552 },
    { nomLieu: "Grotte de Lourdes/Sanctuaire Notre-Dame", num: "2", typeRue: "Pl.", nomRue: "du Chanoine Philippe Ravary", appartient: "religieux", site: "colline", quartier: "Bonnefoy", établissement: "Sanctuaire", sigles: "", signification: "Grotte de Lourdes et fontaine miraculeuse", lat: 43.6183, lng: 1.4556 },
    { nomLieu: "Communauté des Filles de Jésus", num: "0", typeRue: "Pl.", nomRue: "du Chanoine Philippe Ravary", appartient: "religieux", site: "colline", quartier: "Bonnefoy", établissement: "Communauté / Institution", sigles: "CDDJ", signification: "Filles de Jésus, liées à l'institution Notre-Dame de Rivières", lat: 43.6182, lng: 1.4549 },
  ];

  return NextResponse.json(data);
}
