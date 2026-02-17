import { NextResponse } from 'next/server';

export async function GET() {
  const mediaData = {
radios: [
      { name: "ICI Occitanie", url: "https://www.francebleu.fr/occitanie", category: "Généraliste" },
      { name: "Sud Radio", url: "https://www.sudradio.fr/", category: "Généraliste / Talk" },
      { name: "Toulouse FM", url: "https://www.toulousefm.fr/", category: "Généraliste" },
      { name: "Radio FMR", url: "https://radiofmr.net/", category: "Associative" },
      { name: "Campus FM", url: "https://www.campusfm.fr/", category: "Associative" },
      { name: "Canal Sud", url: "http://www.canalsud.net/", category: "Associative" },
      { name: "Radio Occitania", url: "https://www.radio-occitania.com/", category: "Associative" },
      { name: "Radio Nova Toulouse", url: "https://www.nova.fr/", category: "Musicale" },
      { name: "Booster FM", url: "http://www.radiobooster.fr/", category: "Musicale" },
      { name: "Pyrénées FM", url: "https://www.pyreneesfm.com/", category: "Musicale" },
      { name: "Radio Andorre (Archives/Mémoire)", url: "https://www.aquiradioandorra.com/", category: "Historique" },
      { name: "Andorra Difusió (RTVA)", url: "https://www.andorradifusio.ad/radio", category: "Andorre Actuelle" },
      { name: "Radioplayer France", url: "https://www.radioplayer.fr/", category: "Plateforme" }
    ],
televisions: [
      { name: "France 3 Occitanie", url: "https://france3-regions.francetvinfo.fr/occitanie/" },
      { name: "ViàOccitanie", url: "https://viaoccitanie.tv/" },
      { name: "TV Bruit", url: "http://tvbruit.com/" },
      { name: "WebTélé 31", url: "https://webtele31.fr/", comment: "Média citoyen Nord Loisirs" },
      { name: "La Mouette (Agglo-Rieuse)", url: "https://youtube.com/@LagglorieuseOccitanie" },
      { 
        name: "Bonjour Toulouse (Instagram)", 
        url: "https://www.instagram.com/bonjour.toulouse/", 
        category: "Média Vidéo Web",
        comment: "Format court : reels, interviews et bonnes adresses." 
      },
      { name: "Bonjour Toulouse (Facebook)", url: "https://www.facebook.com/bonjourtoulouse/", category: "Média Vidéo Web" },
      { name: "Bonjour Toulouse (TikTok)", url: "https://www.tiktok.com/@bonjourtoulouse", category: "Média Vidéo Web" },
      { name: "Bonjour Toulouse (YouTube)", url: "https://www.youtube.com/@BonjourToulouse", category: "Média Vidéo Web" }
    ],
presse_hebdo_web: [
      { name: "Actu Toulouse", url: "https://actu.fr/occitanie/toulouse", status: "✅ Actif", comment: "La version numérique quotidienne la plus réactive." },
      { name: "Mediacités Toulouse", url: "https://www.mediacites.fr/toulouse", status: "✅ Actif", comment: "Journal d'enquête indépendant (en ligne)." },
      { name: "Toulouse Infos", url: "http://www.toulouseinfos.fr", status: "✅ Actif", comment: "Site d'actualité pure-player." },
      { name: "La Dépêche du Midi", url: "https://www.ladepeche.fr", status: "✅ Actif" },
      { name: "Le Journal Toulousain", url: "https://www.lejournaltoulousain.fr", status: "✅ Actif", comment: "Journal de solutions." },
      { name: "Côté Toulouse", url: "https://actu.fr/cote-toulouse", status: "✅ Actif", comment: "Gratuit du groupe Actu." },
      { name: "20 Minutes Toulouse", url: "https://www.20minutes.fr/toulouse", status: "✅ Actif" },
      { name: "L'Opinion Indépendante", url: "https://lopinion.com", status: "✅ Actif", comment: "Hebdo juridique et politique." },
      { name: "La Gazette du Midi", url: "https://www.gazette-du-midi.fr", status: "✅ Actif", comment: "Économie & Droit." },
      { name: "Le Petit Journal", url: "https://lepetitjournal.net", status: "✅ Actif", comment: "Éditions locales." },
      { name: "Voix du Midi", url: "https://actu.fr/voix-du-midi", status: "🟠 Partiel", comment: "Principalement Lauragais." },
      { name: "L'Agglo-Rieuse", url: "https://www.lagglorieuse.info", status: "✅ Actif", comment: "Hebdo satirique." }
    ],
economie_emploi: [
      { name: "Touléco", url: "https://www.touleco.fr", status: "✅ Actif" },
      { name: "Le Journal des Entreprises", url: "https://www.lejournaldesentreprises.com/toulouse", status: "✅ Actif" },
      { name: "La Tribune Toulouse (ex-Objectif News)", url: "https://toulouse.latribune.fr", status: "🔄 Renommé" },
      { name: "Top Économique Occitanie", url: "https://www.top-economique-occitanie.fr", status: "✅ Actif", comment: "Annuaire annuel" },
      { name: "Entreprises Occitanie", url: "https://www.entreprises-occitanie.com", status: "✅ Actif" },
      { name: "Toulemploi", url: "https://www.toulemploi.fr", status: "✅ Actif" },
      { name: "L'Apprentissage en Occitanie", url: "https://www.apprentissage-en-occitanie.fr", status: "✅ Actif" },
      { name: "Le Tafeur", url: "http://www.letafeur.com", status: "✅ Actif", comment: "Journal de l'emploi intérimaire" }
    ]
culture_lifestyle: [
{ name: "Le Petit Tou", url: "https://www.lepetittou.com", status: "✅ Actif", comment: "Le city-guide annuel (TBS). La bible des bonnes adresses." },
      { name: "Clutch", url: "https://www.clutchmag.fr", status: "✅ Actif", comment: "Référence culturelle gratuite." },
      { name: "U'Zoom", url: "https://uzoom.fr", status: "✅ Actif", comment: "Magazine étudiant, co-édité par Flash." },
      { name: "Boudu", url: "https://www.boudulemag.com", status: "✅ Actif", comment: "Mensuel qualitatif." },
      { name: "Flash !", url: "http://www.flashhebdo.fr", status: "✅ Actif", comment: "Culturel historique." },
      { name: "Ancrage", url: "https://www.ancrage.org", status: "✅ Actif", comment: "Mémoire des métissages et quartiers populaires." },
      { name: "Pyrénées Magazine", url: "https://www.pyrenees-magazine.com", status: "✅ Actif" },
      { name: "Le Patrimoine", url: "https://www.editions-du-patrimoine-occitanie.com", status: "✅ Actif" },
      { name: "Radici", url: "https://www.radici-press.net", status: "✅ Actif", comment: "Culture italo-occitane." },
      { name: "Ramdam", url: "http://www.ramdam-mag.info", status: "✅ Actif", comment: "Agenda culturel." },
      { name: "L'Exploreur", url: "https://exploreur.univ-toulouse.fr", status: "✅ Actif", comment: "Science et recherche." },
      { name: "L'Indic", url: "http://l-indic.fr", status: "🟠 Rare", comment: "Fanzine Polar" }
    ],
institutionnel_quartiers: [
      { name: "La Lettre d'Arnaud-Bernard", url: "https://metropole.toulouse.fr/quartiers/capitole-arnaud-bernard-carmes", status: "✅ Actif", comment: "Suivi des travaux et projets du quartier" },
      { name: "Le 24 Heures", url: "https://www.le24heures.fr", status: "✅ Actif", comment: "Sociologie des quartiers (Arnaud Bernard, Bonnefoy...)" },
      { name: "À Toulouse (Mairie)", url: "https://www.toulouse.fr", comment: "Magazine municipal" },
      { name: "TIM (Métropole)", url: "https://www.toulouse-metropole.fr", comment: "Toute l'info métropolitaine" },
      { name: "Ma Haute-Garonne", url: "https://www.haute-garonne.fr", comment: "Magazine du Département" },
      { name: "Occitanie Info", url: "https://www.laregion.fr", comment: "Magazine de la Région" },
      { name: "Grands Sites Occitanie", url: "https://www.grands-sites-occitanie.fr" }
    ]
  };

  return NextResponse.json(mediaData);
}
