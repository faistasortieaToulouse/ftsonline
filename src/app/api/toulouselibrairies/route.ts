import { NextResponse } from 'next/server';

export async function GET() {
  const librairies = [
    // GÉNÉRALISTES & INSTITUTIONS
    { nom: "Ombres Blanches", type: "Généraliste / Institution", url: "https://www.ombres-blanches.fr/" },
    { nom: "Librairie Privat", type: "Généraliste / Institution", url: "https://www.librairieprivat.com/" },
    { nom: "Gibert Joseph Toulouse", type: "Généraliste / Occasion", url: "https://www.gibert.com/stores/toulouse-gibert-joseph-librairie" },
    { nom: "La Renaissance", type: "Généraliste", url: "https://www.librairie-renaissance.fr/" },
    { nom: "La Librairie", type: "Généraliste", url: "https://lalibrairietoulouse.com/" },
    { nom: "L'Autre Rive (Centre)", type: "Généraliste / Indépendante", url: "https://www.librairie-autrerive.com/presentation/ssh-6538" },
    { nom: "L'Autre Rive (Cartoucherie)", type: "Généraliste / Quartier", url: "https://www.autrerive-cartoucherie.fr/" },
    { nom: "Terra Nova", type: "Engagée / Indépendante", url: "https://librairie-terranova.fr/" },
    { nom: "Le Chameau Sauvage", type: "Généraliste / Quartier", url: "https://librairielechameausauvage.fr/" },
    { nom: "Ellipses", type: "Généraliste / Universitaire", url: "http://librairie-ellipses.com/" },
    { nom: "Librairie des Lois", type: "Juridique / Droit", url: "https://www.librairiedeslois.com/" },
    { nom: "Comptoir du Livre", type: "Généraliste", url: "https://www.comptoirdulivre.fr/" },

    // SPÉCIALISÉES
    { nom: "La Tirelire", type: "Enfance / Jeunesse", url: "https://librairietirelire.com/" },
    { nom: "Librairie Castéran", type: "Livres Anciens", url: "https://www.librairie-casteran.com/" },
    { nom: "Librairie Série B", type: "Policier / Polar", url: "http://www.librairieserieb.fr/" },
    { nom: "BD Fugue", type: "Bande Dessinée", url: "https://www.bdfugue.com/" },
    { nom: "Comptoir du Rêve", type: "BD / Manga / Comics", url: "https://librairiecomptoirdureve.fr/" },
    { nom: "Imagin'ères", type: "Science-Fiction / Fantastique", url: "https://www.imagineres.fr/" },
    { nom: "The Bookshop", type: "Anglophone (Livres en Anglais)", url: "https://thebookshop.fr/" },
    { nom: "Librairie Occitania", type: "Langue & Culture Occitane", url: "https://librairie-occitania.fr/" },
    { nom: "La Procure", type: "Religions / Spiritualité", url: "https://www.laprocure.com/" },
    { nom: "La Préface", type: "Généraliste (Colomiers)", url: "https://www.lapreface.net/" },

    // ENSEIGNES & ANNUAIRES
    { nom: "Fnac Toulouse Wilson", type: "Grande Enseigne", url: "https://www.fnac.com/toulouse-wilson/fnac-toulouse-wilson/cl55/livre" },
    { nom: "Cultura Toulouse", type: "Grande Enseigne", url: "https://www.tiendeo.fr/Magasins/toulouse/cultura" },
    { nom: "Place des Libraires (Stock Toulouse)", type: "Annuaire / Réservation", url: "https://www.placedeslibraires.fr/magasins/toulouse/La-Librairie--6653/" },
    { nom: "Pages Jaunes - Librairies", type: "Annuaire Pro", url: "https://www.pagesjaunes.fr/annuaire/toulouse-31/librairies" },
    { nom: "LibraireInfo Toulouse", type: "Annuaire / Guide", url: "https://libraireinfo.com/ville/toulouse_31000/" },
  ];

  // Tri alphabétique par nom
  const sorted = librairies.sort((a, b) => a.nom.localeCompare(b.nom));

  return NextResponse.json(sorted);
}