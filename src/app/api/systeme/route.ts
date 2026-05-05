import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    metadata: {
      title: "API Chronologique et Technique des Systèmes d'Exploitation",
      sources: [
        "https://fr.wikipedia.org/wiki/Syst%C3%A8me_d%27exploitation",
        "https://fr.wikipedia.org/wiki/Chronologie_des_syst%C3%A8mes_d%27exploitation",
        "https://fr.wikipedia.org/wiki/Unix",
        "https://fr.wikipedia.org/wiki/Linux#Histoire"
      ]
    },
    chronologie_detaillee: [
      {
        date: "1969",
        evenement: "Naissance d'Unix",
        lieu: "Laboratoires Bell (AT&T)",
        acteurs: ["Ken Thompson", "Dennis Ritchie"],
        description: "Initialement écrit en assembleur pour un PDP-7, Unix pose les bases du multitâche et de la gestion de fichiers moderne.",
        wiki: "https://fr.wikipedia.org/wiki/Unix"
      },
      {
        date: "Années 1970",
        evenement: "Réécriture d'Unix en Langage C",
        impact: "Rend le système portable sur différentes machines, une révolution pour l'époque.",
        branches: ["BSD (Berkeley)", "System V (AT&T)"]
      },
      {
        date: "1983",
        evenement: "Lancement du Projet GNU",
        auteur: "Richard Stallman",
        objectif: "Créer un système compatible Unix mais totalement libre.",
        outils: ["GCC", "Bash", "Emacs"],
        wiki: "https://fr.wikipedia.org/wiki/Projet_GNU"
      },
      {
        date: "1987",
        evenement: "Sortie de Minix",
        auteur: "Andrew Tanenbaum",
        usage: "Système éducatif basé sur un micro-noyau, utilisé par Linus Torvalds pour apprendre le fonctionnement des OS.",
        wiki: "https://fr.wikipedia.org/wiki/Minix"
      },
      {
        date: "1991",
        evenement: "Premier noyau Linux",
        auteur: "Linus Torvalds",
        annonce: "25 août 1991 sur le groupe Usenet comp.os.minix.",
        licence: "GPL (General Public License)",
        wiki: "https://fr.wikipedia.org/wiki/Noyau_Linux"
      }
    ],
    distributions_historiques: {
      "1992": ["MCC Interim Linux (1ère distro)", "TAMU Linux", "SLS", "Yggdrasil (1er Live CD)"],
      "1993": ["Slackware (Patrick Volkerding)", "Debian (Ian Murdock)"],
      "1994": ["Red Hat Linux", "SUSE Linux"]
    },
    familles_actuelles: [
      {
        nom: "Famille Debian",
        caracteristique: "Stabilité et gestion de paquets .deb",
        principales: ["Ubuntu", "Linux Mint", "Kali Linux"]
      },
      {
        nom: "Famille Red Hat",
        caracteristique: "Orienté Entreprise et paquets .rpm",
        principales: ["RHEL", "Fedora", "CentOS"]
      },
      {
        nom: "Famille Arch",
        caracteristique: "Simplicité technique et Rolling Release",
        principales: ["Arch Linux", "Manjaro"]
      }
    ],
    infrastructure_moderne: {
      serveurs_web: "Dominance de la stack LAMP (Linux Apache MySQL PHP)",
      cloud: "Moteur de AWS, Azure et Google Cloud",
      mobilité: "Android (basé sur le noyau Linux)",
      performance: "100% des 500 plus puissants supercalculateurs mondiaux"
    }
  };

  return NextResponse.json(data);
}
