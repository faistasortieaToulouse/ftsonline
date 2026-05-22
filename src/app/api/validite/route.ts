import { NextResponse } from 'next/server';

export async function GET() {
  const dataValidite = [
    { nom: "cafedeslanguestoulouse.com", dateExpiration: "2025-10-12", fournisseur: "Infomaniak", type: "Nom de domaine", prix: "12,00 € / an" },
    { nom: "lei-web.click", dateExpiration: "2025-08-08", fournisseur: "IONOS", type: "Nom de domaine", prix: "45,00 € / an" },
    { nom: "faistasortieatoulouse.online", dateExpiration: "2026-11-06", fournisseur: "Namecheap", type: "Nom de domaine", prix: "~$34.98 / an" },
    { nom: "ftstoulouse.online", dateExpiration: "2027-02-05", fournisseur: "Namecheap", type: "Nom de domaine", prix: "~$34.98 / an" },
    { nom: "Meetup Standard (12 mois)", dateExpiration: "2026-06-14", fournisseur: "Meetup", type: "Abonnement Plateforme", prix: "$174.99 / an (HT)" },
    { nom: "Déclaration Impôts Revenus 2026", dateExpiration: "2026-06-04", fournisseur: "Impots.gouv", type: "Obligation Légale", prix: "Gratuit" }
  ];

  return NextResponse.json(dataValidite);
}
