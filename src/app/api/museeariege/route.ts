// src/app/api/museeariege/route.ts

// Définition du type pour les données de musée/patrimoine
export type Musee = {
  nom: string;
  commune: string;
  adresse: string;
  categorie: string;
  url: string;
  lat: number;
  lng: number;
};

// Liste des musées et sites d'intérêt de l'Ariège (09), triée par Commune
const museesAriège: Musee[] = [
  { nom: "Batteuse hydraulique d'Andressein", commune: "Andressein", adresse: "09240 Andressein", categorie: "Industrie/Patrimoine", url: "https://www.ariegepyrenees.com/offre/andressien-visite-de-la-batteuse-hydraulique-andressien-fr-1246197/", lat: 43.0234, lng: 1.1398 },
  { nom: "Fabrique de sabots de Bethmale", commune: "Arrien-en-Bethmale", adresse: "09160 Arrien-en-Bethmale", categorie: "Industrie/Patrimoine", url: "https://www.ariegepyrenees.com/offre/la-saboterie-dart-traditionnel-darrien-en-bethmale-arrien-en-bethmale-fr-1245648/", lat: 42.9463, lng: 1.0965 },
  { nom: "Le Barri, maison des patrimoines, mines d'aluminium", commune: "Auzat", adresse: "09220 Auzat", categorie: "Industrie", url: "https://www.vallee-du-sabat.com/village/auzat/", lat: 42.7561, lng: 1.5413 },
  { nom: "Usine hydro-électrique d'Ax-les-Thermes", commune: "Ax-les-Thermes", adresse: "09110 Ax-les-Thermes", categorie: "Industrie", url: "https://www.vallee-du-sabat.com/village/ax-les-thermes/", lat: 42.7196, lng: 1.8329 },
  { nom: "Moulin de Laurède", commune: "Burret", adresse: "D315, 09000 Burret", categorie: "Patrimoine", url: "https://lemoulindelalaurede.fr/", lat: 43.0189, lng: 1.5120 },
  { nom: "Château des Comtes de Foix", commune: "Foix", adresse: "Rue des Comtes de Foix, 09000 Foix", categorie: "Patrimoine", url: "https://www.sites-touristiques-ariege.fr/chateau-de-foix/", lat: 42.9667, lng: 1.6094 },
  { nom: "Musée du textile et du peigne en corne", commune: "Lavelanet", adresse: "Avenue Pierre Mendes France, 09300 Lavelanet", categorie: "Industrie", url: "https://www.ariegepyrenees.com/offre/musee-du-textile-et-du-peigne-en-corne-lavelanet-fr-1245710/", lat: 42.9463, lng: 1.8540 },
  { nom: "Maison de Pierre Bayle", commune: "Le Carla-Bayle", adresse: "Place de l'Europe, 09130 Le Carla-Bayle", categorie: "Patrimoine", url: "https://www.ariegepyrenees.com/offre/maison-pierre-bayle-le-carla-bayle-fr-1245785/", lat: 43.1417, lng: 1.4880 },
  { nom: "Moulin à eau de l'Espine", commune: "L'Espine", adresse: "09100 L'Espine", categorie: "Patrimoine", url: "https://www.ariegepyrenees.com/patrimoine-culturel/moulin-a-eau-de-lespine/", lat: 43.0805, lng: 1.6570 },
  { nom: "Musée d'Aristide Bergès", commune: "Lorp-Sentaraille", adresse: "09190 Lorp-Sentaraille", categorie: "Industrie/Patrimoine", url: "https://www.ariegepyrenees.com/offre/musee-daristide-berges-lorp-sentaraille-fr-1245778/", lat: 43.0116, lng: 1.1578 },
  { nom: "Carrière de Talc de Trimouns", commune: "Luzenac", adresse: "09250 Luzenac", categorie: "Industrie", url: "https://www.vallee-du-sabat.com/fiche/carriere-de-talc-de-trimouns/", lat: 42.7937, lng: 1.7056 },
  { nom: "Chemin d'inspiration (Bayletou)", commune: "Massat", adresse: "09320 Massat", categorie: "Patrimoine", url: "https://www.tourisme-couserans-pyrenees.com/equipement/le-chemin-de-bayletou/", lat: 42.9248, lng: 1.4190 },
  { nom: "Vieux moulin de Massat", commune: "Massat", adresse: "09320 Massat", categorie: "Patrimoine", url: "https://www.lespyrenees.net/sites-visiter/PCU3d81180b55e34/detail/massat/le-vieux-moulin-de-massat", lat: 42.9300, lng: 1.4080 },
  { nom: "Maison de l'Affabuloscope", commune: "Le Mas-d'Azil", adresse: "09290 Le Mas-d'Azil", categorie: "Patrimoine", url: "https://www.ariegepyrenees.com/offre/la-maison-de-laffabuloscope-le-mas-dazil-fr-1245790/", lat: 43.0765, lng: 1.3412 },
  { nom: "Musée de la Préhistoire", commune: "Le Mas-d'Azil", adresse: "Avenue du Colonel-Vénéras, 09290 Le Mas-d'Azil", categorie: "Patrimoine/Préhistoire", url: "http://www.sites-touristiques-ariege.fr/grotte-du-mas-d-azil/", lat: 43.0710, lng: 1.3468 },
  { nom: "Musée pastelier de Mazères", commune: "Mazères", adresse: "09270 Mazères", categorie: "Patrimoine", url: "https://www.ariegepyrenees.com/offre/musee-pastel-mazeres-fr-1245803/", lat: 43.2755, lng: 1.6702 },
  { nom: "Musée du Fer et de la Forge", commune: "Montgailhard", adresse: "09330 Montgailhard", categorie: "Industrie", url: "https://www.ariegepyrenees.com/offre/musee-du-fer-montgailhard-fr-1245731/", lat: 42.9904, lng: 1.6241 },
  { nom: "Musée des enfants du château", commune: "Montégut-Plantaurel", adresse: "09100 Montégut-Plantaurel", categorie: "Patrimoine", url: "https://www.ariegepyrenees.com/offre/musee-des-enfants-du-chateau-montegut-plantaurel-fr-1245781/", lat: 43.0984, lng: 1.5540 },
  { nom: "Musée historique et archéologique de Montségur", commune: "Montségur", adresse: "09300 Montségur", categorie: "Patrimoine/Histoire", url: "https://www.ariegepyrenees.com/offre/musee-de-montsegur-montsegur-fr-1245759/", lat: 42.8795, lng: 1.8329 },
  { nom: "Musée pyrénéen", commune: "Niaux", adresse: "Rue de la Mairie, 09220 Niaux", categorie: "Patrimoine/Préhistoire", url: "https://www.museepyreneenniaux.com/", lat: 42.8277, lng: 1.6033 },
  { nom: "Centrale hydroélectrique d'Orlu", commune: "Orlu", adresse: "09150 Orlu", categorie: "Industrie", url: "https://www.vallee-du-sabat.com/village/orlu/", lat: 42.7481, lng: 1.8624 },
  { nom: "Maison de la liberté, résistance", commune: "Saint-Girons", adresse: "09200 Saint-Girons", categorie: "Patrimoine/Histoire", url: "http://www.st-girons.fr/La-Maison-de-la-Liberte", lat: 43.0121, lng: 1.1444 },
  { nom: "Musée du Palais des Evêques", commune: "Saint-Lizier", adresse: "09190 Saint-Lizier", categorie: "Patrimoine/Histoire", url: "http://www.ariege-cazeres.com/palaisdeseveques", lat: 43.0035, lng: 1.1309 },
  { nom: "Musée des arts et traditions", commune: "Sainte-Croix-Volvestre", adresse: "09230 Sainte-Croix-Volvestre", categorie: "Patrimoine", url: "https://www.saintec-volvestre.fr/musee-des-arts-et-traditions/", lat: 43.1852, lng: 1.1718 },
  { nom: "Château de Seix", commune: "Seix", adresse: "09140 Seix", categorie: "Patrimoine", url: "https://www.ariegepyrenees.com/offre/le-chateau-de-seix-seix-fr-1246193/", lat: 42.9163, lng: 1.3439 },
  { nom: "Rêve et magie du rail", commune: "Tarascon-sur-Ariège", adresse: "09400 Tarascon-sur-Ariège", categorie: "Transport", url: "https://www.ariegepyrenees.com/offre/reve-et-magie-du-rail-tarascon-sur-ariege-fr-1245758/", lat: 42.8550, lng: 1.6062 },
  { nom: "Maison de la mine de fer", commune: "Val de Sos", adresse: "09220 Val de Sos", categorie: "Industrie/Patrimoine", url: "https://www.vallee-du-sabat.com/village/val-de-sos/", lat: 42.7937, lng: 1.5432 },
  { nom: "Mémorial du camp de déportation", commune: "Le Vernet", adresse: "09700 Le Vernet", categorie: "Patrimoine/Histoire", url: "http://www.campduvernet.eu/", lat: 43.1789, lng: 1.6601 },
];

// Gestionnaire GET pour l'API
export async function GET() {
  // Simuler un léger délai pour la récupération des données
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return new Response(JSON.stringify(museesAriège), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // Ajouter des en-têtes CORS si nécessaire
    },
  });
}
