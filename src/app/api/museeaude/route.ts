// src/app/api/museeaude/route.ts
import { MuseeAude } from '@/app/museeaude/museeaude'; // Assurez-vous que le chemin d'importation est correct

// Liste des musées et sites d'intérêt de l'Aude (11), triée par Commune
const museesAude: MuseeAude[] = [
  { commune: "Aragon", nom: "Musée des vieux outils vignerons", adresse: "12 Rue Saint-Jean, 11600 Aragon", categorie: "Patrimoine/Industrie", url: "https://www.grand-carcassonne-tourisme.fr/site-culturel/musee-des-vieux-outils-vignerons/", lat: 43.3080, lng: 2.3168 },
  { commune: "Arques", nom: "Maison de Déodat Roque", adresse: "Place du Fort, 11190 Arques", categorie: "Patrimoine/Histoire", url: "https://www.tourisme-occitanie.com/maison-de-deodat-roque/arques/tabid/37151/offreid/7298c4b1-876e-44e2-9382-36c567a5b3a3/detail.aspx", lat: 42.9372, lng: 2.3860 },
  { commune: "Axat", nom: "Grotte de l'Aguzou", adresse: "118 route de Saint-Georges, 11140 Axat", categorie: "Patrimoine Naturel", url: "http://www.aguzou.com/", lat: 42.8120, lng: 2.2470 },
  { commune: "Belvis", nom: "Musée de la Préhistoire La Cauna", adresse: "11340 Belvis", categorie: "Patrimoine/Préhistoire", url: "http://www.lacauna.com/", lat: 42.8711, lng: 2.0525 },
  { commune: "Bize-Minervois", nom: "Odyssée de l'olivier", adresse: "11120 Bize-Minervois", categorie: "Patrimoine/Industrie", url: "https://www.bizeminervois.com/l-odyssee-de-l-olivier", lat: 43.2721, lng: 2.8020 },
  { commune: "Bizanet", nom: "Musée des Granoliers", adresse: "Rue Jean-Jacques Rousseau, 11200 Bizanet", categorie: "Industrie/Patrimoine", url: "https://bizanet.fr/espace-des-granoliers/", lat: 43.1538, lng: 2.9090 },
  { commune: "Boutenac", nom: "Musée des Boissons et de la Sommellerie", adresse: "11200 Boutenac", categorie: "Patrimoine/Industrie", url: "https://musee-boissons.com/pages/za_corbieres_boutenac.html", lat: 43.1250, lng: 2.7664 },
  { commune: "Boutenac", nom: "Musée de la faune de Gasparets", adresse: "Gasparets, 11200 Boutenac", categorie: "Patrimoine/Nature", url: "https://www.monnuage.fr/point-d-interet/musee-de-la-faune-de-boutenac-a91133", lat: 43.1300, lng: 2.7700 },
  { commune: "Bram", nom: "Eburomagus, musée archéologique de Bram", adresse: "Avenue de la Gare, 11150 Bram", categorie: "Patrimoine/Archéologie", url: "https://www.musee-bram.fr/", lat: 43.2424, lng: 2.1265 },
  { commune: "Brousses et Villaret", nom: "Moulin à papier de Brousses et Villaret", adresse: "11390 Brousses et Villaret", categorie: "Industrie/Patrimoine", url: "http://moulinapapier.com/", lat: 43.3300, lng: 2.3780 },
  { commune: "Cabrespine", nom: "Gouffre géant de Cabrespine", adresse: "11160 Cabrespine", categorie: "Patrimoine Naturel", url: "http://www.gouffre-de-cabrespine.com/", lat: 43.3551, lng: 2.4578 },
  { commune: "Carcassonne", nom: "Musée des Beaux-arts de Carcassonne", adresse: "15 Rue de Verdun, 11000 Carcassonne", categorie: "Art", url: "https://www.carcassonne.org/visiter-carcassonne/musees-et-lieux-dexposition/musee-des-beaux-arts", lat: 43.2100, lng: 2.3508 },
  { commune: "Carcassonne", nom: "Musée de l'école", adresse: "3 Rue du Pont-Vieux, 11000 Carcassonne", categorie: "Patrimoine", url: "http://www.musee-ecole.fr/", lat: 43.2089, lng: 2.3500 },
  { commune: "Carcassonne", nom: "Maison des mémoires, centre Joe Bousquet", adresse: "53 Rue de Verdun, 11000 Carcassonne", categorie: "Patrimoine/Histoire", url: "https://www.aude.fr/maison-des-memoires-centre-joebousquet", lat: 43.2130, lng: 2.3482 },
  { commune: "Carcassonne", nom: "Musée du trésor de Notre-Dame de l'abbaye", adresse: "Place Saint-Nazaire (Basilique), 11000 Carcassonne", categorie: "Patrimoine/Religion", url: "https://www.tourisme-occitanie.com/musee-du-tresor-notre-dame-de-labbaye/carcassonne/tabid/37151/offreid/81333790-25e2-482a-89a3-5c02970a2569/detail.aspx", lat: 43.2030, lng: 2.3620 },
  { commune: "Carcassonne", nom: "Atelier du livre", adresse: "11 Rue du Puits Vert, 11000 Carcassonne", categorie: "Art/Patrimoine", url: "https://www.carcassonne.org/association/latelier-du-livre", lat: 43.2085, lng: 2.3505 },
  { commune: "Carcassonne", nom: "Centre d'histoire vivante médiévale", adresse: "La Cité (adresse dans les remparts), 11000 Carcassonne", categorie: "Patrimoine/Histoire", url: "https://www.tripadvisor.fr/Attraction_Review-g187151-d13083145-Reviews-Centre_d_Histoire_Vivante_Medievale-Carcassonne_Center_Carcassonne_Aude_Occitani.html", lat: 43.2045, lng: 2.3635 },
  { commune: "Carcassonne", nom: "Musée de l'Inquisition", adresse: "Rue du Vieux Portail, 11000 Carcassonne", categorie: "Histoire", url: "http://www.musee-inquisition-carcassonne.com/", lat: 43.2040, lng: 2.3600 },
  { commune: "Carcassonne", nom: "Musée lapidaire", adresse: "Château comtal de la Cité, 11000 Carcassonne", categorie: "Patrimoine/Archéologie", url: "http://www.chateau-comtal.fr/", lat: 43.2045, lng: 2.3645 },
  { commune: "Castelnaudary", nom: "Musée archéologique du Lauragais", adresse: "1 Place de la République, 11400 Castelnaudary", categorie: "Patrimoine/Archéologie", url: "https://www.tourisme-castelnaudary.fr/musee-archeologique-du-lauragais/", lat: 43.3150, lng: 1.9560 },
  { commune: "Castelnaudary", nom: "Musée \"Le Présidial\"", adresse: "Rampe du Présidial, 11491 Castelnaudary", categorie: "Patrimoine/Histoire", url: "https://www.infomusee.org/ville/castelnaudary_11400/", lat: 43.3160, lng: 1.9570 },
  { commune: "Caunes-Minervois", nom: "Carrière de marbre du roy", adresse: "11160 Caunes-Minervois", categorie: "Industrie/Patrimoine", url: "https://www.tourisme-occitanie.com/carrieres-de-marbre-du-roy/caunes-minervois/tabid/37151/offreid/742b71fa-12cd-416b-a279-88005b8109d9/detail.aspx", lat: 43.3210, lng: 2.5270 },
  { commune: "Cucugnan", nom: "Théâtre Achille Mir", adresse: "11350 Cucugnan", categorie: "Patrimoine", url: "https://www.cucugnan.fr/theatre-achille-mir/", lat: 42.8550, lng: 2.5710 },
  { commune: "Cuxac-d'Aude", nom: "Cité des Abeilles et des Fleurs", adresse: "11590 Cuxac-d'Aude", categorie: "Industrie/Nature", url: "https://www.cuxacd-aude.fr/cit%C3%A9-des-abeilles-et-des-fleurs/", lat: 43.2030, lng: 2.9750 },
  { commune: "Douzens", nom: "Musée des Oiseaux et de la Faune", adresse: "11700 Douzens", categorie: "Patrimoine/Nature", url: "https://www.net1901.org/association/ASSOCIATION-ORNITHOLOGIQUE-DOUZENOISE,2875778.html", lat: 43.1900, lng: 2.5830 },
  { commune: "Esperaza", nom: "Musée des dinosaures", adresse: "26 Rue d'Amont, 11260 Esperaza", categorie: "Patrimoine/Paléontologie", url: "http://www.dinosauria.org/", lat: 42.9460, lng: 2.2270 },
  { commune: "Esperaza", nom: "Musée de la chapellerie", adresse: "11260 Esperaza", categorie: "Industrie/Patrimoine", url: "http://www.musee-chapellerie.com/", lat: 42.9450, lng: 2.2300 },
  { commune: "Fabrezan", nom: "Musée Charles Cros", adresse: "11200 Fabrezan", categorie: "Patrimoine/Histoire", url: "https://www.tourisme-occitanie.com/musee-charles-cros/fabrezan/tabid/37151/offreid/72f44c20-4357-4183-b930-b539c2d1b7d5/detail.aspx", lat: 43.1290, lng: 2.7210 },
  { commune: "Floure", nom: "Musée militaire", adresse: "11800 Floure", categorie: "Patrimoine/Histoire", url: "https://www.floure.fr/musee-militaire", lat: 43.1810, lng: 2.4500 },
  { commune: "Fontcouverte", nom: "Ma séduction Française", adresse: "Route de Moux, 11700 Fontcouverte", categorie: "Industrie/Patrimoine", url: "https://www.maseductionfrancaise.fr/", lat: 43.1550, lng: 2.6500 },
  { commune: "Ginestas", nom: "Musée de la Chapellerie du Somail", adresse: "11120 Ginestas", categorie: "Industrie/Patrimoine", url: "http://www.lesomail.com/musee-de-la-chapellerie.php", lat: 43.2350, lng: 2.9240 },
  { commune: "Gruissan", nom: "Salin de Gruissan", adresse: "Avenue de la Douane, 11430 Gruissan", categorie: "Industrie/Patrimoine", url: "https://lesalingruissan.fr/", lat: 43.1110, lng: 3.1200 },
  { commune: "La Palme", nom: "Salin de La Palme", adresse: "Route des Salins, 11480 La Palme", categorie: "Industrie/Patrimoine", url: "https://www.tourisme-lapalme.fr/activite/salin-de-la-palme/", lat: 42.9800, lng: 3.0180 },
  { commune: "Lagrasse", nom: "Abbaye de Lagrasse", adresse: "11800 Lagrasse", categorie: "Patrimoine/Religion", url: "https://www.aude.fr/abbaye-de-lagrasse", lat: 43.0900, lng: 2.6200 },
  { commune: "Lagrasse", nom: "Le 1900 - Musée, Caveau, Vinaigrerie", adresse: "11800 Lagrasse", categorie: "Industrie/Patrimoine", url: "https://www.le1900lagrasse.com/", lat: 43.0880, lng: 2.6180 },
  { commune: "Limousis", nom: "Grotte de Limousis", adresse: "11600 Limousis", categorie: "Patrimoine Naturel", url: "http://www.grottes-de-limousis.fr/", lat: 43.3270, lng: 2.3780 },
  { commune: "Narbonne", nom: "Abbaye de Fontfroide", adresse: "Route Départementale 613, 11100 Narbonne", categorie: "Patrimoine/Religion", url: "https://www.fontfroide.com/", lat: 43.1250, lng: 2.9560 }
];

// Gestionnaire GET pour l'API
export async function GET() {
  // Simuler un léger délai pour la récupération des données
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return new Response(JSON.stringify(museesAude), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // Ajouter des en-têtes CORS si nécessaire
    },
  });
}
