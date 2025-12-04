import { NextRequest, NextResponse } from "next/server";

interface ExilPlace {
  nomLieu: string;
  num: string;
  typeRue: string;
  nomRue: string;
  appartient: string;
  site: string;
  quartier: string;
  établissement: string;
  sigles: string;
  signification: string;
}

export async function GET(req: NextRequest) {
  const data: ExilPlace[] = [
{ nomLieu: "Casa Catala (1980)", num: "14", typeRue: "rue", nomRue: "Arnaud-Bernard", appartient: "exil", site: "centre", quartier: "Arnaud-Bernard", établissement: "immeuble", sigles: "CNT", signification: "Comité national des Travailleurs" },
{ nomLieu: "place du Capitole", num: "0", typeRue: "place", nomRue: "Capitole", appartient: "exil", site: "centre", quartier: "Capitole", établissement: "\"plaza mayor\" des exilés manifestations", sigles: "UGT", signification: "Union générale des travailleurs" },
{ nomLieu: "arcades", num: "0", typeRue: "place", nomRue: "Capitole", appartient: "zExil", site: "centre", quartier: "Capitole", établissement: "tableau sur l'Exil espagnol", sigles: "AIT", signification: "Association internationale des travailleurs" },
{ nomLieu: "place du Capitole", num: "0", typeRue: "place", nomRue: "Capitole", appartient: "zExil", site: "centre", quartier: "Capitole", établissement: "1946 : 30 mars, réception hôtel de ville du président en exil José Giral", sigles: "SI", signification: "Secrétariat International" },
{ nomLieu: "place du Capitole", num: "0", typeRue: "place", nomRue: "Capitole", appartient: "zExil", site: "centre", quartier: "Capitole", établissement: "1945 : 30 mai, manifestation contre la venue du représentant de Franco", sigles: "GTE", signification: "Groupement de Travail des Etrangers" },
{ nomLieu: "Congrès PSOE sept 44", num: "17", typeRue: "rue", nomRue: "Rémusat", appartient: "exil", site: "centre", quartier: "Capitole", établissement: "salle du Sénéchal", sigles: "PSO", signification: "Parti Social Ouvrier" },
{ nomLieu: "Congrès UGT nov 44", num: "17", typeRue: "rue", nomRue: "Rémusat", appartient: "exil", site: "centre", quartier: "Capitole", établissement: "salle du Sénéchal", sigles: "PSOE", signification: "Parti socialiste Ouvrier Espagnol" },
{ nomLieu: "Salle du Sénéchal", num: "17", typeRue: "rue", nomRue: "Rémusat", appartient: "zExil", site: "centre", quartier: "Capitole", établissement: "1944 : 1er Congrès du PSOE", sigles: "MLE", signification: "Mouvement Libertaire Espagnol" },
{ nomLieu: "Salle du Sénéchal", num: "17", typeRue: "rue", nomRue: "Rémusat", appartient: "zExil", site: "centre", quartier: "Capitole", établissement: "1944 : 1er Congrès de l'UGT, puis CNT, MSC, conférences, etc…", sigles: "FIJL", signification: "Fédération Ibérique de la Jeunesse Libertaire" },
{ nomLieu: "Palais des Beaux-Arts", num: "5", typeRue: "quai", nomRue: "Daurade", appartient: "zExil", site: "centre", quartier: "Daurade", établissement: "1950 : 9 décembre, Pablo Sen, artiste en exil expose", sigles: "SIA", signification: "Solidarité Internationale Antifaciste" },
{ nomLieu: "Congrès PCE", num: "0", typeRue: "place", nomRue: "Dupuy", appartient: "exil", site: "centre", quartier: "Dupuy", établissement: "halle aux Grains", sigles: "", signification: "" },
{ nomLieu: "Halle aux Grains", num: "0", typeRue: "place", nomRue: "Dupuy", appartient: "zExil", site: "centre", quartier: "Dupuy", établissement: "1945 : commémorations du 19 juillet 1936 CNT", sigles: "", signification: "théâtre" },
{ nomLieu: "Halle aux Grains", num: "0", typeRue: "place", nomRue: "Dupuy", appartient: "zExil", site: "centre", quartier: "Dupuy", établissement: "1945 : Fête du 19 juillet 1936 : Les espagnoles prennent les armes contre Franco", sigles: "", signification: "cimetière Rapas" },
{ nomLieu: "Halle aux Grains", num: "0", typeRue: "place", nomRue: "Dupuy", appartient: "zExil", site: "centre", quartier: "Dupuy", établissement: "1945 : meeting avec Dolores Ibárruri, secrétaire du PCE", sigles: "", signification: "" },
{ nomLieu: "immeuble", num: "14", typeRue: "rue", nomRue: "Etoile", appartient: "zExil", site: "centre", quartier: "Dupuy", établissement: "1950 : création El Ateneo, lieu de libre culture des anarchistes", sigles: "", signification: "" },
{ nomLieu: "Défile Guérillos sept 44", num: "0", typeRue: "all", nomRue: "François verdier", appartient: "exil", site: "centre", quartier: "Dupuy", établissement: "monument aux morts", sigles: "", signification: "" },
{ nomLieu: "réunion PSOE 1947", num: "58", typeRue: "rue", nomRue: "Gambetta", appartient: "exil", site: "centre", quartier: "Gambetta", établissement: "hôtel de Paris", sigles: "", signification: "" },
{ nomLieu: "Hôtel de Paris", num: "58", typeRue: "rue", nomRue: "Gambetta", appartient: "zExil", site: "centre", quartier: "Gambetta", établissement: "1947 : PSOE en congrès se retire du gouvernement républicain", sigles: "", signification: "" },
{ nomLieu: "imprimeur Casa Catala", num: "22", typeRue: "rue", nomRue: "Sainte-Ursule", appartient: "exil", site: "centre", quartier: "Gambetta", établissement: "immeuble", sigles: "", signification: "" },
{ nomLieu: "Croix-Rouge espagnole", num: "51", typeRue: "rue", nomRue: "Pargaminières", appartient: "exil", site: "centre", quartier: "Jacobins", établissement: "immeuble", sigles: "", signification: "" },
{ nomLieu: "réfectoire des Jacobins", num: "69", typeRue: "rue", nomRue: "Pargaminières", appartient: "zExil", site: "centre", quartier: "Jacobins", établissement: "1955 : 6ème Congrès du PSOE", sigles: "", signification: "" },
{ nomLieu: "réfectoire des Jacobins", num: "69", typeRue: "rue", nomRue: "Pargaminières", appartient: "zExil", site: "centre", quartier: "Jacobins", établissement: "1972 : Felipe Gonzalez, au mois d'aout, impose la rénovation du parti", sigles: "", signification: "" },
{ nomLieu: "réfectoire des Jacobins", num: "69", typeRue: "rue", nomRue: "Pargaminières", appartient: "zExil", site: "centre", quartier: "Jacobins", établissement: "1946 : 2ème Congrès du PSOE", sigles: "", signification: "" },
{ nomLieu: "réfectoire des Jacobins", num: "69", typeRue: "rue", nomRue: "Pargaminières", appartient: "zExil", site: "centre", quartier: "Jacobins", établissement: "1948 : 3ème congrès PSOE, Indalecio Prieto, président", sigles: "", signification: "" },
{ nomLieu: "réfectoire des Jacobins", num: "69", typeRue: "rue", nomRue: "Pargaminières", appartient: "zExil", site: "centre", quartier: "Jacobins", établissement: "2010 : 70ème anniversaire Retirada", sigles: "", signification: "" },
{ nomLieu: "Congrès PSOE 46 et 48", num: "69", typeRue: "rue", nomRue: "Pargaminières", appartient: "exil", site: "centre", quartier: "Jacobins", établissement: "réfectoire des Jacobins", sigles: "", signification: "" },
{ nomLieu: "ancienne Brasserie", num: "4", typeRue: "rue", nomRue: "Belfort", appartient: "zExil", site: "centre", quartier: "Jean Jaurès", établissement: "1945 : aout, Secretariat Internacional du CNT", sigles: "CNT", signification: "Comité national des Travailleurs" },
{ nomLieu: "cinéma Les Nouveautés", num: "54, 56", typeRue: "bd", nomRue: "Carnot", appartient: "zExil", site: "centre", quartier: "Jean Jaurès", établissement: "1948 : 1er mai, meeting du CNT", sigles: "CNT", signification: "Comité national des Travailleurs" },
{ nomLieu: "meetings espagnols", num: "54, 56", typeRue: "bd", nomRue: "Carnot", appartient: "exil", site: "centre", quartier: "Jean Jaurès", établissement: "cinéma Nouveautés", sigles: "", signification: "" },
{ nomLieu: "siège du CNT", num: "3", typeRue: "rue", nomRue: "Merly", appartient: "zExil", site: "centre", quartier: "Jeanne d'Arc", établissement: "CNT", sigles: "CNT", signification: "Comité national des Travailleurs" },
{ nomLieu: "librairie des Editions Espagnoles", num: "", typeRue: "angle", nomRue: "rue Merly et bd Arcole", appartient: "", site: "centre", quartier: "Jeanne d'Arc", établissement: "librairie de Josep Salvador-Puignau", sigles: "", signification: "" },
{ nomLieu: "CTDEE", num: "8", typeRue: "rue", nomRue: "Maurice Fort", appartient: "zExil", site: "centre", quartier: "Manufacture", établissement: "Centre toulousain de documentation sur l’exil espagnol", sigles: "", signification: "" },
{ nomLieu: "Consulat Espagne", num: "16", typeRue: "rue", nomRue: "Sainte-Anne", appartient: "zExil", site: "centre", quartier: "Saint-Etienne", établissement: "occupé à la Libération par les républicains contre Franco", sigles: "", signification: "" },
{ nomLieu: "CNT - MLE", num: "20", typeRue: "place", nomRue: "Saint-Sernin", appartient: "exil", site: "centre", quartier: "Saint-Sernin", établissement: "Bourse du Travail", sigles: "CNT - MLE", signification: "" },
{ nomLieu: "Bourse du Travail", num: "20", typeRue: "place", nomRue: "Saint-Sernin", appartient: "zExil", site: "centre", quartier: "Saint-Sernin", établissement: "1950 : 1944 - 1950 : réunions (plena) du PCE interdit en 1950", sigles: "PCE", signification: "Parti Communiste Espagnol" },
{ nomLieu: "Bourse du Travail", num: "20", typeRue: "place", nomRue: "Saint-Sernin", appartient: "zExil", site: "centre", quartier: "Saint-Sernin", établissement: "1946 : 9 mai, 2ème congrès UGT pro URSS", sigles: "UGT", signification: "Union Générale des Travailleurs" },
{ nomLieu: "Bourse du Travail", num: "20", typeRue: "place", nomRue: "Saint-Sernin", appartient: "zExil", site: "centre", quartier: "Saint-Sernin", établissement: "1970 : siège du CEAT : Comité de l'Espagne Anti-Franquiste", sigles: "CEAT", signification: "Comité de l'Espagne Anti-Franquiste" },
{ nomLieu: "Casa del Pueblo", num: "69", typeRue: "rue", nomRue: "Taur", appartient: "zExil", site: "centre", quartier: "Saint-Sernin", établissement: "au 1er étage, ancien ciné Espoir", sigles: "", signification: "" },
{ nomLieu: "PSOE", num: "69", typeRue: "rue", nomRue: "Taur", appartient: "exil", site: "centre", quartier: "Saint-Sernin", établissement: "immeuble", sigles: "PSOE", signification: "Parti Socialiste Ouvrier Espagnol" },
{ nomLieu: "UGT", num: "71", typeRue: "rue", nomRue: "Taur", appartient: "exil", site: "centre", quartier: "Saint-Sernin", établissement: "immeuble", sigles: "UGT", signification: "Union Générale des Travailleurs" },
{ nomLieu: "Casa del Pueblo", num: "71", typeRue: "rue", nomRue: "Taur", appartient: "zExil", site: "centre", quartier: "Saint-Sernin", établissement: "siège du SDE", sigles: "SDE", signification: "" },
{ nomLieu: "ancien séminaire", num: "30 bis", typeRue: "rue", nomRue: "Valade", appartient: "zExil", site: "centre", quartier: "Saint-Sernin", établissement: "1971 : XIème congrès UGT : Nicolas Redondo prend la tête du syndicat", sigles: "UGT", signification: "Union Générale des Travailleurs" },
{ nomLieu: "place Wilson", num: "0", typeRue: "place", nomRue: "Wilson", appartient: "exil", site: "centre", quartier: "Wilson", établissement: "lieu de rencontre des républicains", sigles: "", signification: "" },
{ nomLieu: "square Wilson", num: "0", typeRue: "place", nomRue: "Wilson", appartient: "zExil", site: "centre", quartier: "Wilson", établissement: "Parlement des espagnols", sigles: "", signification: "" },
{ nomLieu: "square Wilson", num: "0", typeRue: "place", nomRue: "Wilson", appartient: "zExil", site: "centre", quartier: "Wilson", établissement: "lieu de vente des journaux espagnols", sigles: "", signification: "" },
{ nomLieu: "square Wilson", num: "0", typeRue: "place", nomRue: "Wilson", appartient: "zExil", site: "centre", quartier: "Wilson", établissement: "CNT, Ruta, Mundo Obrero, El Socialista", sigles: "CNT", signification: "Comité National des Travailleurs" },
{ nomLieu: "meetings espagnols", num: "6", typeRue: "place", nomRue: "Wilson", appartient: "exil", site: "centre", quartier: "Wilson", établissement: "cinéma Plaza", sigles: "", signification: "" },
{ nomLieu: "cinéma Plaza", num: "6", typeRue: "place", nomRue: "Wilson", appartient: "zExil", site: "centre", quartier: "Wilson", établissement: "1945 : meeting Toulouse - Barcelone", sigles: "", signification: "" },
{ nomLieu: "groupement II", num: "4", typeRue: "rue", nomRue: "Belfort", appartient: "exil", site: "hypercentre", quartier: "Bayard", établissement: "immeuble", sigles: "", signification: "" },
{ nomLieu: "SI", num: "4", typeRue: "rue", nomRue: "Belfort", appartient: "exil", site: "hypercentre", quartier: "Bayard", établissement: "immeuble", sigles: "SI", signification: "Secrétariat International" },
{ nomLieu: "CNT - MLE", num: "4", typeRue: "rue", nomRue: "Belfort", appartient: "exil", site: "hypercentre", quartier: "Bayard", établissement: "immeuble", sigles: "CNT - MLE", signification: "" },
{ nomLieu: "FIJL", num: "4", typeRue: "rue", nomRue: "Belfort", appartient: "exil", site: "hypercentre", quartier: "Bayard", établissement: "immeuble", sigles: "FIJL", signification: "Fédération Ibérique de la Jeunesse Libertaire" },
{ nomLieu: "SIA", num: "4", typeRue: "rue", nomRue: "Belfort", appartient: "exil", site: "hypercentre", quartier: "Bayard", établissement: "immeuble", sigles: "SIA", signification: "Solidarité Internationale Antifasciste" },
{ nomLieu: "Casa Catala (1944)", num: "16", typeRue: "bd", nomRue: "Bonrepos", appartient: "exil", site: "hypercentre", quartier: "Bayard", établissement: "immeuble", sigles: "", signification: "" },
{ nomLieu: "Casa de Espana (av 1980)", num: "31", typeRue: "rue", nomRue: "Chalets", appartient: "exil", site: "hypercentre", quartier: "Châlets", établissement: "Institut Cervantes", sigles: "", signification: "" },
{ nomLieu: "Casa Catala (1970)", num: "17", typeRue: "rue", nomRue: "7 Troubadours", appartient: "exil", site: "hypercentre", quartier: "Jean Jaurès", établissement: "immeuble", sigles: "", signification: "" },
{ nomLieu: "El Ateneo Espanol", num: "14", typeRue: "rue", nomRue: "Etoile", appartient: "exil", site: "hypercentre", quartier: "Saint-Aubin", établissement: "centre culturel anarcho-syndicaliste", sigles: "", signification: "" },
{ nomLieu: "David Elbaz", num: "0", typeRue: "rue", nomRue: "David Elbaz", appartient: "résistance", site: "primocouronne", quartier: "Jolimont", établissement: "a donné son nom à une rue", sigles: "", signification: "" },
{ nomLieu: "AIT", num: "47", typeRue: "rue", nomRue: "Jonquières", appartient: "exil", site: "primocouronne", quartier: "la Gloire", établissement: "immeuble", sigles: "AIT", signification: "Association Internationale des Travailleurs" },
{ nomLieu: "Casa de Espana", num: "85", typeRue: "av", nomRue: "Minimes", appartient: "exil", site: "primocouronne", quartier: "Minimes", établissement: "plaque", sigles: "", signification: "" },
{ nomLieu: "Casa de Espana", num: "85", typeRue: "av", nomRue: "Minimes", appartient: "exil", site: "primocouronne", quartier: "Minimes", établissement: "stèle", sigles: "", signification: "" },
{ nomLieu: "monument Exil", num: "85", typeRue: "av", nomRue: "Minimes", appartient: "exil", site: "primocouronne", quartier: "Minimes", établissement: "Exil espagnol", sigles: "", signification: "" },
{ nomLieu: "Manuel Serra", num: "3", typeRue: "pl", nomRue: "Lafourcade", appartient: "résistance", site: "primocouronne", quartier: "Saint-Michel", établissement: "héros Libération", sigles: "", signification: "" },
{ nomLieu: "camp réfugiés espagnols", num: "0", typeRue: "chem", nomRue: "Loge", appartient: "zExil", site: "primocouronne", quartier: "Saint-Michel", établissement: "ancienne Poudrerie bombardée", sigles: "", signification: "" },
{ nomLieu: "prison Saint-Michel", num: "18", typeRue: "gde rue", nomRue: "Saint-Michel", appartient: "exil", site: "primocouronne", quartier: "Saint-Michel", établissement: "communistes et anarchistes sont enfermés en 1940", sigles: "", signification: "" },
{ nomLieu: "prison Saint-Michel", num: "18", typeRue: "gde rue", nomRue: "Saint-Michel", appartient: "exil", site: "primocouronne", quartier: "Saint-Michel", établissement: "plaque morts exécutés", sigles: "", signification: "" },
{ nomLieu: "Enzo Godeas", num: "18", typeRue: "gde rue", nomRue: "Saint-Michel", appartient: "résistance", site: "primocouronne", quartier: "Saint-Michel", établissement: "mort pour la France", sigles: "", signification: "" },
{ nomLieu: "Francisco Ponzan", num: "18", typeRue: "gde rue", nomRue: "Saint-Michel", appartient: "Vichy", site: "primocouronne", quartier: "Saint-Michel", établissement: "dit \"Vidal\", instituteur espagnol, fait passer les aviateurs à travers les Pyrénées", sigles: "", signification: "" },
{ nomLieu: "Francisco Ponzan", num: "18", typeRue: "gde rue", nomRue: "Saint-Michel", appartient: "Vichy", site: "primocouronne", quartier: "Saint-Michel", établissement: "arrêté, enfermé à la prison Saint-Michel, est exécuté à Buzet-sur-Tarn", sigles: "", signification: "zzz voir articles de la Dépêche Résistance Toulouse" },
{ nomLieu: "Conchita Ramos", num: "18", typeRue: "gde rue", nomRue: "Saint-Michel", appartient: "Vichy", site: "primocouronne", quartier: "Saint-Michel", établissement: "espagnole, agent de Liaison à Foix, arrêtée, incarnée à la prison Saint-Michel", sigles: "", signification: "idem pour Exil espagnol" },
{ nomLieu: "Diego Rodriguez-Rollado", num: "18", typeRue: "gde rue", nomRue: "Saint-Michel", appartient: "résistance", site: "primocouronne", quartier: "Saint-Michel", établissement: "mort pour la France", sigles: "", signification: "" },
{ nomLieu: "Frederica Montseny", num: "63", typeRue: "rue", nomRue: "cim. St Cyprien", appartient: "exil", site: "rives Gauche", quartier: "Saint-Cyprien", établissement: "tombe de la dirigeante du CNT", sigles: "CNT", signification: "Comité National des Travailleurs" },
{ nomLieu: "baraquements", num: "0", typeRue: "cours", nomRue: "Dillon", appartient: "exil", site: "rives Gauche", quartier: "Saint-Cyprien", établissement: "institutions espagnoles", sigles: "", signification: "" },
{ nomLieu: "dispensaire", num: "0", typeRue: "cours", nomRue: "Dillon", appartient: "zExil", site: "rives gauche", quartier: "Saint-Cyprien", établissement: "Cours Dillon", sigles: "", signification: "" },
{ nomLieu: "maternité", num: "0", typeRue: "cours", nomRue: "Dillon", appartient: "zExil", site: "rives gauche", quartier: "Saint-Cyprien", établissement: "Cours Dillon", sigles: "", signification: "" },
{ nomLieu: "salle de théâtre", num: "0", typeRue: "cours", nomRue: "Dillon", appartient: "zExil", site: "rives gauche", quartier: "Saint-Cyprien", établissement: "Cours Dillon", sigles: "", signification: "" },
{ nomLieu: "casa Catala", num: "0", typeRue: "cours", nomRue: "Dillon", appartient: "zExil", site: "rives gauche", quartier: "Saint-Cyprien", établissement: "Cours Dillon", sigles: "", signification: "" },
{ nomLieu: "école permanente Art espagnol", num: "0", typeRue: "cours", nomRue: "Dillon", appartient: "zExil", site: "rives gauche", quartier: "Saint-Cyprien", établissement: "ancien siège CNT", sigles: "CNT", signification: "Comité National des Travailleurs" },
{ nomLieu: "CNT", num: "0", typeRue: "cours", nomRue: "Dillon", appartient: "zExil", site: "rives gauche", quartier: "Saint-Cyprien", établissement: "ancien siège CNT", sigles: "CNT", signification: "Comité National des Travailleurs" },
{ nomLieu: "Casa Catala (1960)", num: "7", typeRue: "rue", nomRue: "Novarts", appartient: "exil", site: "rives Gauche", quartier: "Saint-Cyprien", établissement: "immeuble", sigles: "", signification: "" },
{ nomLieu: "Groupe Terra Lliure", num: "48", typeRue: "rue", nomRue: "République", appartient: "exil", site: "rives Gauche", quartier: "Saint-Cyprien", établissement: "groupe catalan", sigles: "", signification: "" },
{ nomLieu: "hôpital de Varsovie", num: "15", typeRue: "rue", nomRue: "Varsovie", appartient: "exil", site: "rives Gauche", quartier: "Saint-Cyprien", établissement: "hôpital", sigles: "", signification: "" },
{ nomLieu: "quai Exil espagnol", num: "0", typeRue: "port", nomRue: "Viguerie", appartient: "zExil", site: "rives gauche", quartier: "Saint-Cyprien", établissement: "quai Exil espagnol", sigles: "", signification: "" },
  ];

  return NextResponse.json(data);
}
