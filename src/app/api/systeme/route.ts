import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    metadata: {
      title: "API Chronologique et Technique des Systèmes d'Exploitation (Édition Complète)",
      version: "2.0",
      sources: [
        "https://fr.wikipedia.org/wiki/Syst%C3%A8me_d%27exploitation",
        "https://fr.wikipedia.org/wiki/Chronologie_des_syst%C3%A8mes_d%27exploitation",
        "https://fr.wikipedia.org/wiki/Unix",
        "https://fr.wikipedia.org/wiki/Linux#Histoire",
        "https://fr.wikipedia.org/wiki/GNU#Le_projet_GNU"
      ]
    },
    chronologie_detaillee: [
      {
        date: "1969",
        evenement: "Genèse d'Unix aux Laboratoires Bell",
        acteurs: ["Ken Thompson", "Dennis Ritchie"],
        description: "Développement initial sur PDP-7. Invention des concepts de 'pipes' (tubes) et de hiérarchie de fichiers.",
        detail: "Le système est alors écrit en assembleur.",
        wiki: "https://fr.wikipedia.org/wiki/Unix"
      },
      {
        date: "1973",
        evenement: "La révolution de la portabilité (Langage C)",
        impact: "Réécriture d'Unix en C par Dennis Ritchie.",
        innovation: "C'est la première fois qu'un OS devient indépendant du matériel (portable).",
        branches: ["System V (Commercial/AT&T)", "BSD (Académique/Berkeley)"]
      },
      {
        date: "1983",
        evenement: "Manifeste GNU & Logiciel Libre",
        auteur: "Richard Stallman",
        philosophie: "Liberté d'utiliser, étudier, modifier et redistribuer.",
        outils_clefs: ["GCC (Compilateur)", "Bash (Shell)", "Emacs (Éditeur)"],
        probleme: "Le noyau GNU Hurd prend du retard à cause de sa complexité (micro-noyau).",
        wiki: "https://fr.wikipedia.org/wiki/Projet_GNU"
      },
      {
        date: "1987",
        evenement: "Minix et l'éducation",
        auteur: "Andrew Tanenbaum",
        description: "Créé pour enseigner la conception d'OS sans les restrictions de licence AT&T.",
        lien_linux: "C'est sur ce système que Linus Torvalds fera ses premières armes."
      },
      {
        date: "1991",
        evenement: "L'étincelle Linux",
        auteur: "Linus Torvalds",
        annonce: "25 août 1991 : 'Just a hobby, won't be big and professional like gnu'.",
        tournant_1992: "Passage sous licence GPL, permettant la fusion avec les outils GNU.",
        wiki: "https://fr.wikipedia.org/wiki/Linux#Histoire"
      }
    ],
    distributions_historiques: [
      {
        annee: "1992",
        noms: ["MCC Interim Linux", "TAMU Linux", "SLS"],
        info: "Les premières tentatives de rendre Linux installable par le grand public."
      },
      {
        annee: "1993",
        noms: ["Slackware", "Debian"],
        innovation: "Debian introduit la gestion de paquets (APT), révolutionnant les mises à jour."
      },
      {
        annee: "1994",
        noms: ["Red Hat", "SUSE"],
        impact: "Début de la professionnalisation et du support commercial."
      }
    ],
    familles_et_philosophie: [
      {
        nom: "Famille Debian",
        descendance: ["Ubuntu", "Mint", "Kali"],
        philosophie: "Stabilité et engagement communautaire."
      },
      {
        nom: "Famille Red Hat",
        descendance: ["Fedora", "RHEL", "CentOS"],
        philosophie: "Standard industriel et robustesse entreprise."
      },
      {
        nom: "Famille Arch",
        descendance: ["Manjaro", "EndeavourOS"],
        philosophie: "Simplicité technique (KISS) et Rolling Release."
      },
      {
        nom: "Famille Slackware",
        descendance: ["openSUSE (racines)"],
        philosophie: "Tradition, proche de la configuration Unix pure."
      }
    ],
    impact_moderne: {
      serveurs: {
        titre: "Domination du Web",
        stack: "LAMP (Linux, Apache, MySQL, PHP/Python/Perl)",
        stat: "Fait tourner la majorité des serveurs mondiaux."
      },
      business: {
        evenement_clef: "Annonce d'IBM (2000) d'investir 1 milliard de dollars dans Linux.",
        entreprises_majeures: ["Oracle", "Google", "Red Hat", "IBM"]
      },
      infrastructure: {
        supercalculateurs: "100% du TOP500 sous Linux.",
        cloud: "Base de Docker, Kubernetes et des instances AWS/Azure.",
        mobile: "Android (Noyau Linux)."
      }
    }
  };

  return NextResponse.json(data);
}
