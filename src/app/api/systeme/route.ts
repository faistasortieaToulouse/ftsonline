import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    definitions: {
      os: "Logiciel assurant l'interface entre l'utilisateur et le matériel.",
      kernel: "Cœur du système gérant les ressources (mémoire, processeur).",
      distro: "Assemblage du noyau Linux avec des outils GNU et des logiciels tiers."
    },
    chronologie: [
      { id: 1, date: "1969", nom: "Unix", auteur: "Ken Thompson & Dennis Ritchie", impact: "Pionnier du multitâche." },
      { id: 2, date: "1983", nom: "GNU", auteur: "Richard Stallman", impact: "Naissance du logiciel libre." },
      { id: 3, date: "1987", nom: "Minix", auteur: "Andrew Tanenbaum", impact: "Modèle pédagogique pour Linux." },
      { id: 4, date: "1991", nom: "Linux", auteur: "Linus Torvalds", impact: "Premier noyau libre largement adopté." }
    ],
    distributions_majeures: [
      { 
        nom: "Debian", 
        date: "1993", 
        base: "Indépendante", 
        usage: "Serveurs, Postes de travail",
        descendance: ["Ubuntu", "Mint", "Kali"]
      },
      { 
        nom: "Red Hat", 
        date: "1994", 
        base: "Indépendante", 
        usage: "Entreprise",
        descendance: ["Fedora", "CentOS", "RHEL"]
      },
      { 
        nom: "Slackware", 
        date: "1993", 
        base: "SLS", 
        usage: "Avancé",
        descendance: ["SUSE (initialement)"]
      }
    ],
    statistiques_actuelles: {
      serveurs: "90%+",
      supercalculateurs: "100%",
      smartphones: "Android (basé sur Linux) est leader mondial."
    }
  };

  return NextResponse.json(data);
}
