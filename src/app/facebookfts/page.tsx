'use client';

import Link from "next/link";

const facebookGroups = [
  { name: "Happy People Toulouse", url: "https://www.facebook.com/groups/996796667051330" },
  { name: "Toulouse Le Bon Plan", url: "https://www.facebook.com/groups/550741995050817" },
  { name: "Toulouse libre ou gratuit", url: "https://www.facebook.com/groups/651831044888765" },
  { name: "Sorties Soirées Toulouse", url: "https://www.facebook.com/groups/596757027131271" },
  { name: "Colocation hébergement gratuit Toulouse", url: "https://www.facebook.com/groups/559216034241574" },
  { name: "Les Concerts Gratuits de Toulouse", url: "https://www.facebook.com/groups/221534187648" },
  { name: "Sorties culturelles à Toulouse", url: "https://www.facebook.com/groups/513531158446053" },
  { name: "Sorties Visite Toulouse, Occitanie et Région Toulousaine", url: "https://www.facebook.com/groups/546506525504472" },
  { name: "Soirées sorties entre filles Toulouse et Occitanie", url: "https://www.facebook.com/groups/1397077878141492" },
  { name: "Aller au théâtre, impro, stand up, spectacles, comédie à Toulouse", url: "https://www.facebook.com/groups/1396560737927890" },
  // Nouveaux ajouts
  { name: "Sortie ski dans les Pyrénées à partir de Toulouse", url: "https://www.facebook.com/groups/304919476675833" },
  { name: "Toulouse Sortie Plage", url: "https://www.facebook.com/groups/1634680750109791/" },
  { name: "Club lecture et club d'écriture à Toulouse", url: "https://www.facebook.com/groups/1355306319236116/" },
  { name: "Soirée Jeux, bar et club de jeux sur Toulouse", url: "https://www.facebook.com/groups/1363843758107232/" },
  { name: "Comedie Club Stand Up Blind Test et Quizz à Toulouse", url: "https://www.facebook.com/groups/625050106569426/" },
  { name: "Salons de thé, coffee shop et restaurants à Toulouse", url: "https://www.facebook.com/groups/1313021633356765/" },
  { name: "Café Des Langues Toulouse", url: "https://www.facebook.com/groups/191206554544247/" }
];

export default function FacebookFTS() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 flex flex-col items-center justify-start p-6">
      <section className="bg-blue-600 text-white rounded-3xl shadow-lg p-10 max-w-2xl w-full text-center mb-8">
        <h1 className="text-4xl font-bold mb-6">Fais Ta Sortie À Toulouse - Facebook</h1>
        <p className="mb-8 text-lg">
          Retrouvez tous nos groupes Facebook pour suivre les sorties, événements et activités à Toulouse !
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl w-full">
        {facebookGroups.map((group, index) => (
          <Link
            key={index}
            href={group.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-100 text-blue-800 font-medium p-4 rounded-xl shadow hover:bg-blue-200 transition text-center"
          >
            {group.name}
          </Link>
        ))}
      </div>

      {/* Lien retour à l'accueil */}
      <Link
        href="/"
        className="mt-6 text-purple-700 font-medium hover:underline"
      >
        Retour à l’accueil
      </Link>
    </div>
  );
}
