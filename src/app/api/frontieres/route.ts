import { NextResponse } from 'next/server';

export async function GET() {
  const frontieres = [
    // --- EUROPE & MÉTROPOLE ---
    { pays: "Allemagne", zone: "France métropolitaine", type: "Terrestre", lat: 48.5, lng: 7.8, notes: "" },
    { pays: "Andorre", zone: "France métropolitaine", type: "Terrestre", lat: 42.5, lng: 1.5, notes: "" },
    { pays: "Belgique", zone: "France métropolitaine", type: "Terrestre et maritime", lat: 50.3, lng: 3.5, notes: "" },
    { pays: "Espagne", zone: "France métropolitaine", type: "Terrestre et maritime", lat: 42.6, lng: 0.5, notes: "En deux morceaux, de part et d'autre d'Andorre, plus l'enclave de Llívia." },
    { pays: "Guernesey (UK)", zone: "France métropolitaine", type: "Maritime", lat: 49.4, lng: -2.5, notes: "" },
    { pays: "Italie", zone: "France métropolitaine", type: "Terrestre et maritime", lat: 45.1, lng: 7.0, notes: "Divergence d'interprétation au sommet du Mont-Blanc." },
    { pays: "Jersey (UK)", zone: "France métropolitaine", type: "Maritime", lat: 49.2, lng: -2.1, notes: "" },
    { pays: "Luxembourg", zone: "France métropolitaine", type: "Terrestre", lat: 49.4, lng: 5.9, notes: "" },
    { pays: "Monaco", zone: "France métropolitaine", type: "Terrestre et maritime", lat: 43.7, lng: 7.4, notes: "" },
    { pays: "Royaume-Uni", zone: "France métropolitaine", type: "Maritime", lat: 50.5, lng: 1.5, notes: "Frontière terrestre dans le Tunnel sous la Manche (Traité de Cantorbéry)." },
    { pays: "Suisse", zone: "France métropolitaine", type: "Terrestre et lacustre", lat: 46.5, lng: 6.5, notes: "" },

    // --- AMÉRIQUES & ANTILLES ---
    { pays: "Anguilla (UK)", zone: "Saint-Martin", type: "Maritime", lat: 18.2, lng: -63.1, notes: "" },
    { pays: "Barbade", zone: "Guadeloupe / Martinique", type: "Maritime", lat: 13.1, lng: -59.5, notes: "" },
    { pays: "Brésil", zone: "Guyane", type: "Terrestre et maritime", lat: 3.8, lng: -51.8, notes: "" },
    { pays: "Canada", zone: "Saint-Pierre-et-Miquelon", type: "Maritime", lat: 46.7, lng: -56.2, notes: "Frontière terrestre possible sur les îlots de l'île Verte." },
    { pays: "Dominique", zone: "Guadeloupe / Martinique", type: "Maritime", lat: 15.4, lng: -61.3, notes: "" },
    { pays: "Montserrat (UK)", zone: "Guadeloupe", type: "Maritime", lat: 16.7, lng: -62.2, notes: "" },
    { pays: "Sainte-Lucie", zone: "Martinique", type: "Maritime", lat: 13.9, lng: -61.0, notes: "" },
    { pays: "Saint-Martin (NL)", zone: "Saint-Martin / St-Barthélemy", type: "Terrestre et maritime", lat: 18.0, lng: -63.0, notes: "" },
    { pays: "Suriname", zone: "Guyane", type: "Terrestre et maritime", lat: 4.0, lng: -54.0, notes: "Une partie de la frontière terrestre est contestée." },
    { pays: "Venezuela", zone: "Guadeloupe / Martinique", type: "Maritime", lat: 12.0, lng: -65.0, notes: "" },

    // --- OCÉAN INDIEN ---
    { pays: "Comores", zone: "Mayotte / Îles Glorieuses", type: "Maritime", lat: -11.6, lng: 43.3, notes: "Les Comores contestent la souveraineté française sur Mayotte." },
    { pays: "Madagascar", zone: "Terres Australes / Mayotte / Réunion", type: "Maritime", lat: -20.0, lng: 45.0, notes: "Contestation sur les îles Éparses (Glorieuses, Juan de Nova, etc.)." },
    { pays: "Maurice", zone: "Réunion / Tromelin", type: "Maritime", lat: -20.3, lng: 57.5, notes: "Maurice conteste la souveraineté sur l'île Tromelin." },
    { pays: "Seychelles", zone: "Îles Glorieuses", type: "Maritime", lat: -4.6, lng: 55.4, notes: "" },

    // --- OCÉAN PACIFIQUE ---
    { pays: "Australie", zone: "Nouvelle-Calédonie", type: "Maritime", lat: -22.0, lng: 158.0, notes: "" },
    { pays: "Îles Cook (NZ)", zone: "Polynésie française", type: "Maritime", lat: -21.2, lng: -159.7, notes: "" },
    { pays: "Fidji", zone: "N-Calédonie / Wallis-et-Futuna", type: "Maritime", lat: -18.0, lng: 178.0, notes: "" },
    { pays: "Heard et McDonald (AU)", zone: "Îles Kerguelen", type: "Maritime", lat: -53.1, lng: 72.5, notes: "" },
    { pays: "Kiribati", zone: "Polynésie française", type: "Maritime", lat: 1.8, lng: -157.3, notes: "" },
    { pays: "Norfolk (AU)", zone: "Nouvelle-Calédonie", type: "Maritime", lat: -29.0, lng: 167.9, notes: "" },
    { pays: "Pitcairn (UK)", zone: "Polynésie française", type: "Maritime", lat: -25.0, lng: -130.1, notes: "" },
    { pays: "Salomon", zone: "Nouvelle-Calédonie", type: "Maritime", lat: -9.0, lng: 160.0, notes: "" },
    { pays: "Samoa", zone: "Wallis-et-Futuna", type: "Maritime", lat: -13.7, lng: -172.1, notes: "" },
    { pays: "Tokelau (NZ)", zone: "Wallis-et-Futuna", type: "Maritime", lat: -9.2, lng: -171.8, notes: "" },
    { pays: "Tonga", zone: "Wallis-et-Futuna", type: "Maritime", lat: -21.1, lng: -175.2, notes: "" },
    { pays: "Tuvalu", zone: "Wallis-et-Futuna", type: "Maritime", lat: -8.5, lng: 179.1, notes: "" },
    { pays: "Vanuatu", zone: "Nouvelle-Calédonie", type: "Maritime", lat: -18.0, lng: 168.0, notes: "Une partie du territoire revendiquée par le Vanuatu." }
  ];

  return NextResponse.json(frontieres);
}
