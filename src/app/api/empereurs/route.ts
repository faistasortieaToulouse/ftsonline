import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    europe: [
      { pays: "France", dates: "1804–1814/1815 ; 1852–1870", precision: "Napoléon Ier & Napoléon III" },
      { pays: "Allemagne", dates: "1871–1918", precision: "Empire allemand – Kaiser" },
      { pays: "Autriche", dates: "1804–1918", precision: "Empire d’Autriche puis austro-hongrois" },
      { pays: "Russie", dates: "1721–1917", precision: "Empire russe – Tsars empereurs" },
      { pays: "Royaume-Uni", dates: "1876–1947", precision: "Empereur/Impératrice des Indes" },
      { pays: "Italie (Rome)", dates: "27 av. J.-C. – 476", precision: "Empire romain d'Occident" },
      { pays: "Byzance", dates: "Jusqu'en 1453", precision: "Empire romain d’Orient" },
      { pays: "Espagne", dates: "1519–1556", precision: "Charles Quint (Saint-Empire)" }
    ],
    asie: [
      { pays: "Chine", dates: "221 av. J.-C. – 1912", precision: "Du premier empereur Qin aux Qing" },
      { pays: "Japon", dates: "Depuis 660 av. J.-C.", precision: "Tradition ininterrompue jusqu'à aujourd'hui" },
      { pays: "Iran", dates: "550 av. J.-C. – 1979", precision: "Empires perses – Shahanshah" },
      { pays: "Turquie", dates: "1299–1922", precision: "Empire ottoman" },
      { pays: "Inde", dates: "1526–1857", precision: "Empire moghol" },
      { pays: "Mongolie", dates: "1206–1368", precision: "Empire mongol" },
      { pays: "Vietnam", dates: "968–1945", precision: "Dynasties impériales" }
    ],
    afrique: [
      { pays: "Éthiopie", dates: "1270–1974", precision: "Empire éthiopien" },
      { pays: "Centrafrique", dates: "1976–1979", precision: "Empire de Jean-Bedel Bokassa" }
    ],
    ameriques: [
      { pays: "Mexique", dates: "1822–1823 ; 1864–1867", precision: "1er et 2e empires mexicains" },
      { pays: "Brésil", dates: "1822–1889", precision: "Empire du Brésil" },
      { pays: "Haïti", dates: "1804–1806 ; 1849–1859", precision: "Jacques Ier et Faustin Ier" }
    ]
  };

  return NextResponse.json(data);
}
