import { NextResponse } from 'next/server';

export async function GET() {
  const dataValidite = [
    // --- ADMINISTRATION & IMPÔTS ---
    { nom: "Déclaration Impôts Revenus 2026", categorie: "Administration", fournisseur: "Impots.gouv", dernierPaiement: "Printemps 2025", prochaineEcheance: "2026-06-04", prix: "Gratuit", mode: "Manuel" },
    { nom: "Taxe Foncière - 26 av. de la Colonne", categorie: "Administration", fournisseur: "Impots.gouv", dernierPaiement: "Automne 2025", prochaineEcheance: "2026-10-20", prix: "Selon avis", mode: "Automatique" },
    { nom: "Taxe Foncière - L'Horte", categorie: "Administration", fournisseur: "Impots.gouv", dernierPaiement: "Automne 2025", prochaineEcheance: "2026-10-15", prix: "Selon avis", mode: "Manuel" },
    
    // --- TÉLÉPHONIE & CARTES PRÉPAYÉES ---
    { nom: "Ligne SFR - 06-...-41", categorie: "Téléphonie", fournisseur: "SFR", dernierPaiement: "05/2026", prochaineEcheance: "2026-11-01", prix: "À recharger (6 mois)", mode: "Manuel" },
    { nom: "Ligne SFR - 06-...-85", categorie: "Téléphonie", fournisseur: "SFR", dernierPaiement: "05/2026", prochaineEcheance: "2026-11-01", prix: "À recharger (6 mois)", mode: "Manuel" },
    { nom: "Ligne SYMA - 07-...-22", categorie: "Téléphonie", fournisseur: "SYMA", dernierPaiement: "06/10/2025", prochaineEcheance: "2026-10-06", prix: "À recharger (1 an)", mode: "Manuel" },
    { nom: "Ligne SYMA 2 - 07-...-16", categorie: "Téléphonie", fournisseur: "SYMA", dernierPaiement: "06/10/2025", prochaineEcheance: "2026-10-06", prix: "À recharger (1 an)", mode: "Manuel" },
    { nom: "Ligne SYMA 3 - 06-...5", categorie: "Téléphonie", fournisseur: "SYMA", dernierPaiement: "11/11/2025 (Réactivée)", prochaineEcheance: "2026-11-11", prix: "À recharger (1 an)", mode: "Manuel" },
    
    // --- NOMS DE DOMAINE ---
    { nom: "cafedeslanguestoulouse.com", categorie: "Domaines", fournisseur: "Infomaniak", dernierPaiement: "12/10/2024", prochaineEcheance: "2025-10-12", prix: "12,00 € / an", mode: "Automatique" },
    { nom: "lei-web.click", categorie: "Domaines", fournisseur: "IONOS", dernierPaiement: "08/08/2024", prochaineEcheance: "2025-08-08", prix: "45,00 € / an", mode: "Automatique" },
    { nom: "faistasortieatoulouse.online", categorie: "Domaines", fournisseur: "Namecheap", dernierPaiement: "05/11/2025", prochaineEcheance: "2026-11-06", prix: "~$34.98 / an", mode: "Automatique" },
    { nom: "ftstoulouse.online", categorie: "Domaines", fournisseur: "Namecheap", dernierPaiement: "05/02/2026", prochaineEcheance: "2027-02-05", prix: "~$34.98 / an", mode: "Automatique" },

    // --- ABONNEMENTS APPLICATIONS ---
    { nom: "Meetup Standard (12 mois)", categorie: "Applications", fournisseur: "Meetup", dernierPaiement: "14/06/2025", prochaineEcheance: "2026-06-14", prix: "$174.99 / an (HT)", mode: "Automatique" }

  ];

  return NextResponse.json(dataValidite);
}
