import { NextResponse } from 'next/server';

export async function GET() {
  const liensMonde = [
    {
      titre: "Liste des pays du monde",
      url: "https://fr.wikipedia.org/wiki/Liste_des_pays_du_monde",
      description: "Répertoire complet des États souverains reconnus.",
      categorie: "Général"
    },
    {
      titre: "Enclaves et exclaves",
      url: "https://fr.wikipedia.org/wiki/Liste_d%27enclaves_et_d%27exclaves",
      description: "Curiosités géographiques et territoires enclavés.",
      categorie: "Géopolitique"
    },
    {
      titre: "Superficie par pays",
      url: "https://fr.wikipedia.org/wiki/Liste_des_pays_et_territoires_par_superficie",
      description: "Classement mondial des territoires par étendue terrestre.",
      categorie: "Statistiques"
    },
    {
      titre: "Population mondiale",
      url: "https://fr.wikipedia.org/wiki/Liste_des_pays_par_population",
      description: "Classement démographique mis à jour par pays.",
      categorie: "Statistiques"
    },
    {
      titre: "Micronations",
      url: "https://fr.wikipedia.org/wiki/Liste_de_micronations",
      description: "Entités revendiquant leur souveraineté sans reconnaissance.",
      categorie: "Géopolitique"
    },
    {
      titre: "Mégalopoles & Villes",
      url: "https://fr.wikipedia.org/wiki/Liste_des_villes_et_agglom%C3%A9rations_les_plus_peupl%C3%A9es",
      description: "Les agglomérations urbaines les plus massives du monde.",
      categorie: "Urbanisme"
    }
  ];

  return NextResponse.json(liensMonde);
}
