import { NextResponse } from 'next/server';

export async function GET() {
  const librairies = [
    // GÉNÉRALISTES & INSTITUTIONS
    { nom: "Ombres Blanches", type: "Généraliste / Institution", url: "https://www.ombres-blanches.fr/", lat: 43.6041, lng: 1.4421 },
    { nom: "Librairie Privat", type: "Généraliste / Institution", url: "https://www.librairieprivat.com/", lat: 43.6025, lng: 1.4461 },
    { nom: "Gibert Joseph Toulouse", type: "Généraliste / Occasion", url: "https://www.gibert.com/stores/toulouse-gibert-joseph-librairie", lat: 43.6053, lng: 1.4452 },
    { nom: "La Renaissance", type: "Généraliste", url: "https://www.librairie-renaissance.fr/", lat: 43.5938, lng: 1.4087 },
    { nom: "La Librairie", type: "Généraliste", url: "https://lalibrairietoulouse.com/", lat: 43.5934, lng: 1.4646 },
    { nom: "L'Autre Rive (Centre)", type: "Généraliste / Indépendante", url: "https://www.librairie-autrerive.com/presentation/ssh-6538", lat: 43.5976, lng: 1.4373 },
    { nom: "L'Autre Rive (Cartoucherie)", type: "Généraliste / Quartier", url: "https://www.autrerive-cartoucherie.fr/", lat: 43.6015, lng: 1.4118 },
    { nom: "Terra Nova", type: "Engagée / Indépendante", url: "https://librairie-terranova.fr/", lat: 43.6044, lng: 1.4395 },
    { nom: "Le Chameau Sauvage", type: "Généraliste / Quartier", url: "https://librairielechameausauvage.fr/", lat: 43.5912, lng: 1.4552 },
    { nom: "Ellipses", type: "Généraliste / Universitaire", url: "http://librairie-ellipses.com/", lat: 43.6062, lng: 1.4379 },
    { nom: "Librairie des Lois", type: "Juridique / Droit", url: "https://www.librairiedeslois.com/", lat: 43.6058, lng: 1.4397 },
    { nom: "Comptoir du Livre", type: "Généraliste", url: "https://www.comptoirdulivre.fr/", lat: 43.6018, lng: 1.4449 },

    // SPÉCIALISÉES
    { nom: "La Tirelire", type: "Enfance / Jeunesse", url: "https://librairietirelire.com/", lat: 43.6011, lng: 1.4424 },
    { nom: "Librairie Castéran", type: "Livres Anciens", url: "https://www.librairie-casteran.com/", lat: 43.6060, lng: 1.4427 },
    { nom: "Librairie Série B", type: "Policier / Polar", url: "http://www.librairieserieb.fr/", lat: 43.6022, lng: 1.4422 },
    { nom: "BD Fugue", type: "Bande Dessinée", url: "https://www.bdfugue.com/", lat: 43.6020, lng: 1.4421 },
    { nom: "Comptoir du Rêve", type: "BD / Manga / Comics", url: "https://librairiecomptoirdureve.fr/", lat: 43.6065, lng: 1.4446 },
    { nom: "Imagin'ères", type: "Science-Fiction / Fantastique", url: "https://www.imagineres.fr/", lat: 43.6026, lng: 1.4420 },
    { nom: "The Bookshop", type: "Anglophone (Livres en Anglais)", url: "https://thebookshop.fr/", lat: 43.6044, lng: 1.4406 },
    { nom: "Librairie Occitania", type: "Langue & Culture Occitane", url: "https://librairie-occitania.fr/", lat: 43.6067, lng: 1.4424 },
    { nom: "La Procure", type: "Religions / Spiritualité", url: "https://www.laprocure.com/", lat: 43.5997, lng: 1.4448 },
    { nom: "La Préface", type: "Généraliste (Colomiers)", url: "https://www.lapreface.net/", lat: 43.6097, lng: 1.3311 },

    // ENSEIGNES & ANNUAIRES
    { nom: "Fnac Toulouse Wilson", type: "Grande Enseigne", url: "https://www.fnac.com/toulouse-wilson/fnac-toulouse-wilson/cl55/livre", lat: 43.6050, lng: 1.4475 },
    { nom: "Cultura Toulouse", type: "Grande Enseigne", url: "https://www.tiendeo.fr/Magasins/toulouse/cultura", lat: 43.6332, lng: 1.4312 }, // Balma/Gramont ou Portet selon le magasin, ici celui de Balma (le plus proche)
    { nom: "Place des Libraires (Stock Toulouse)", type: "Annuaire / Réservation", url: "https://www.placedeslibraires.fr/magasins/toulouse/La-Librairie--6653/", lat: 43.6046, lng: 1.4442 },
    { nom: "Pages Jaunes - Librairies", type: "Annuaire Pro", url: "https://www.pagesjaunes.fr/annuaire/toulouse-31/librairies", lat: 43.6046, lng: 1.4442 },
    { nom: "LibraireInfo Toulouse", type: "Annuaire / Guide", url: "https://libraireinfo.com/ville/toulouse_31000/", lat: 43.6046, lng: 1.4442 },
  ];

  // Tri alphabétique par nom
  const sorted = librairies.sort((a, b) => a.nom.localeCompare(b.nom));

  return NextResponse.json(sorted);
}
