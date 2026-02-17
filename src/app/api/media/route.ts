import { NextResponse } from 'next/server';

export async function GET() {
  const mediaData = {
    radios: [
      { name: "ICI Occitanie", url: "https://www.francebleu.fr/occitanie", category: "Généraliste" },
      { name: "Toulouse FM", url: "https://www.toulousefm.fr/", category: "Généraliste" },
      { name: "Radio FMR", url: "https://radiofmr.net/", category: "Associative" },
      { name: "Campus FM", url: "https://www.campusfm.fr/", category: "Associative" },
      { name: "Canal Sud", url: "http://www.canalsud.net/", category: "Associative" },
      { name: "Radio Occitania", url: "https://www.radio-occitania.com/", category: "Associative" },
      { name: "Radio Nova Toulouse", url: "https://www.nova.fr/", category: "Musicale" },
      { name: "Booster FM", url: "http://www.radiobooster.fr/", category: "Musicale" },
      { name: "Pyrénées FM", url: "https://www.pyreneesfm.com/", category: "Musicale" },
      { name: "Radioplayer France", url: "https://www.radioplayer.fr/", category: "Plateforme" }
    ],
    televisions: [
      { name: "France 3 Occitanie", url: "https://france3-regions.francetvinfo.fr/occitanie/" },
      { name: "ViàOccitanie", url: "https://viaoccitanie.tv/" },
      { name: "TV Bruit", url: "http://tvbruit.com/" },
      { name: "WebTélé 31", url: "https://webtele31.fr/", comment: "Média citoyen Nord Loisirs" },
      { name: "La Mouette (Agglo-Rieuse)", url: "https://youtube.com/@LagglorieuseOccitanie" }
    ],
    presse: [
      { name: "La Dépêche du Midi", url: "https://www.ladepeche.fr", status: "Actif" },
      { name: "Le Journal Toulousain", url: "https://www.lejournaltoulousain.fr", status: "Actif" },
      { name: "Actu Toulouse / Côté Toulouse", url: "https://actu.fr/toulouse", status: "Actif" },
      { name: "Mediacités Toulouse", url: "https://www.mediacites.fr/toulouse", status: "Enquête" },
      { name: "L'Opinion Indépendante", url: "https://lopinion.com", status: "Actif" },
      { name: "Boudu", url: "https://www.boudulemag.com", status: "Magazine" },
      { name: "Clutch", url: "https://www.clutchmag.fr", status: "Culture" },
      { name: "Flash !", url: "http://www.flashhebdo.fr", status: "Culture" },
      { name: "Le Petit Tou", url: "https://www.lepetittou.com", status: "Guide" },
      { name: "Ancrage", url: "https://www.ancrage.org", status: "Société" },
      { name: "Le 24 Heures", url: "https://www.le24heures.fr", status: "Quartiers" }
    ],
    institutionnel: [
      { name: "À Toulouse (Mairie)", url: "https://www.toulouse.fr" },
      { name: "TIM (Métropole)", url: "https://www.toulouse-metropole.fr" },
      { name: "Lettre Arnaud-Bernard", url: "https://metropole.toulouse.fr/quartiers/capitole-arnaud-bernard-carmes" },
      { name: "Occitanie Info", url: "https://www.laregion.fr" }
    ]
  };

  return NextResponse.json(mediaData);
}
