import { NextResponse } from 'next/server';

export async function GET() {
  const dataValidite = [
    {
      nom: "cafedeslanguestoulouse.com",
      dateExpiration: "2025-10-12",
      fournisseur: "Infomaniak",
      type: "Nom de domaine",
      prix: "12,00 € / an" // Ajustez à ~69,00 € si vous payez aussi l'hébergement web complet chez eux
    },
    {
      nom: "lei-web.click",
      dateExpiration: "2025-08-08",
      fournisseur: "IONOS",
      type: "Nom de domaine",
      prix: "45,00 € / an" 
    },
    {
      nom: "Meetup Standard (12 mois)",
      dateExpiration: "2026-06-14",
      fournisseur: "Meetup",
      type: "Abonnement Plateforme",
      prix: "$174.99 / an (hors taxes)"
    },
    {
      nom: "Déclaration Impôts Revenus 2026",
      dateExpiration: "2026-06-04",
      fournisseur: "Impots.gouv",
      type: "Obligation Légale",
      prix: "Gratuit"
    }
  ];

  return NextResponse.json(dataValidite);
}
