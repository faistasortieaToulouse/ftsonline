import { NextResponse } from "next/server";

export async function GET() {
  const languesData = [
    {
      category: "Classification & Origines",
      links: [
        { name: "Langues par famille", url: "https://fr.wikipedia.org/wiki/Langues_par_famille" },
        { name: "Famille de langues", url: "https://fr.wikipedia.org/wiki/Famille_de_langues" },
        { name: "Langues indo-européennes", url: "https://fr.wikipedia.org/wiki/Langues_indo-europ%C3%A9ennes" },
      ]
    },
    {
      category: "Langues Construites (Conlangs)",
      links: [
        { name: "Liste des langues construites", url: "https://fr.wikipedia.org/wiki/Liste_de_langues_construites" },
        { name: "L'univers de l'Ido", url: "https://fr.wikipedia.org/wiki/Ido" },
        { name: "Langues de la Terre du Milieu", url: "https://fr.wikipedia.org/wiki/Langues_de_la_Terre_du_Milieu" },
      ]
    },
    {
      category: "Ressources & Apprentissage",
      links: [
        { name: "Babelang", url: "http://babelang.free.fr/" },
        { name: "Langoland", url: "http://langoland.free.fr/" },
        { name: "Toulangues (Toulouse)", url: "https://www.toulangues.org/" },
      ]
    }
  ];

  return NextResponse.json(languesData);
}
