import { NextResponse } from "next/server";

export async function GET() {
  const formationData = [
    {
      category: "ORIENTATION",
      sections: [
        {
          subTitle: "Pour les particuliers",
          links: [
            { name: "ONISEP Occitanie", url: "https://www.onisep.fr/pres-de-chez-vous/occitanie" },
          ]
        },
        {
          subTitle: "Pour les étudiants",
          links: [
            { name: "SOIP - UT Capitole", url: "https://www.ut-capitole.fr/accueil/universite/structures/services-administratifs-et-techniques/service-universitaire-dinformation-dorientation-et-daide-a-linsertion-professionnelle-relation-entreprises-suio-ip" },
            { name: "Scuio-IP - UT2J", url: "https://www.univ-tlse2.fr/accueil/universite/organisation/service-commun-universitaire-information-orientation-insertion-professionnelle-scuio-ip" },
            { name: "La Boussole (Portail UT2J)", url: "https://www.boussole.univ-tlse2.fr/" },
            { name: "SCUIO-IP - UT3 Paul Sabatier", url: "https://www.univ-tlse3.fr/lieux-de-ressources/etre-accueilli-au-scuio" },
            { name: "Orientation Toulouse (Portail)", url: "https://www.orientation.com/etablissements/type-ecole-cfa/ville-toulouse" },
            { name: "CMA de la Haute-Garonne", url: "https://www.cm-toulouse.fr/" },
          ]
        }
      ]
    },
    {
      category: "FORMATION",
      sections: [
        {
          subTitle: "Organismes & Ressources",
          links: [
            { name: "AFPA Occitanie", url: "https://www.afpa.fr/centres-formation/centres?region=occitanie" },
            { name: "GRETA Académie de Toulouse", url: "https://maforpro-occitanie.fr/greta-cfa/votre-greta-cfa/greta-toulouse-pyrenees" },
            { name: "Liste des CFA (Haute-Garonne)", url: "https://www.cm-toulouse.fr/files/cma31/jeunes/LISTE-DES-CFA-HG.pdf" },
            { name: "La Bonne Alternance", url: "https://labonnealternance.apprentissage.beta.gouv.fr/" },
            { name: "CARIF-OREF Occitanie", url: "https://www.cariforefoccitanie.fr/" },
            { name: "Académie de Toulouse (Formation Continue)", url: "https://www.ac-toulouse.fr/formation-continue-des-adultes-126005" },
            { name: "Ma Formation Toulouse", url: "https://www.maformation.fr/centres/ville_toulouse-31000.html" },
            { name: "Formations France Travail", url: "https://candidat.francetravail.fr/formations/recherche;JSESSIONID_RECH_FORMATION=b1VBm3-YK1skvEJnaCJ-nXDt3lOdERzSDJ88KxHgFa7QluLyqnek!-21388374?filtreEstFormationEnCoursOuAVenir=formEnCours&filtreEstFormationTerminee=formEnCours&ou=COMMUNE-31555&range=0-9&tri=0" },
            { name: "CCI Toulouse Formations", url: "https://www.toulouse.cci.fr/formations" },
          ]
        }
      ]
    }
  ];

  return NextResponse.json(formationData);
}
