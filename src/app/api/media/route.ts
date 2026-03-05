import { NextResponse } from 'next/server';

export async function GET() {
  const mediaData = {
    radios: [
      { name: "ICI Occitanie", url: "https://www.francebleu.fr/occitanie", category: "Généraliste", comment: "L'actualité de proximité et le service public local." },
      { name: "Sud Radio", url: "https://www.sudradio.fr/", category: "Généraliste / Talk", comment: "Radio de débats et d'actualité nationale née à Toulouse." },
      { name: "Toulouse FM", url: "https://www.toulousefm.fr/", category: "Généraliste", comment: "La radio 100% toulousaine : hits, trafic et infos locales." },
      { name: "Radio FMR", url: "https://radiofmr.net/", category: "Associative", comment: "L'esprit alternatif et underground depuis les années 80." },
      { name: "Campus FM", url: "https://www.campusfm.fr/", category: "Associative", comment: "La voix des universités, de la recherche et des cultures émergentes." },
      { name: "Canal Sud", url: "http://www.canalsud.net/", category: "Associative", comment: "Média libre, engagé et sans publicité sur les luttes sociales." },
      { name: "Radio Occitania", url: "https://www.radio-occitania.com/", category: "Associative", comment: "La radio pour la langue et la culture d'Oc." },
      { name: "Radio Nova Toulouse", url: "https://www.nova.fr/", category: "Musicale", comment: "Le grand mix musical avec des décrochages locaux." },
      { name: "Booster FM", url: "http://www.radiobooster.fr/", category: "Musicale", comment: "Radio de proximité axée sur les musiques urbaines." },
      { name: "Pyrénées FM", url: "https://www.pyreneesfm.com/", category: "Musicale", comment: "L'info et la musique du sud de la Haute-Garonne." },
      { name: "Radio Andorre (Mémoire)", url: "https://www.aquiradioandorra.com/", category: "Historique", comment: "Archives et histoire des radios périphériques." },
      { name: "Andorra Difusió (RTVA)", url: "https://www.andorradifusio.ad/radio", category: "Andorre Actuelle", comment: "La radio nationale de la principauté d'Andorre." },
      { name: "Radioplayer France", url: "https://www.radioplayer.fr/", category: "Plateforme", comment: "Le portail officiel pour écouter toutes les radios en direct." }
    ],
    televisions: [
      { name: "France 3 Occitanie", url: "https://france3-regions.francetvinfo.fr/occitanie/", comment: "Service public : journaux régionaux et magazines de société." },
      { name: "ViàOccitanie", url: "https://viaoccitanie.tv/", comment: "Télévision locale d'information régionale 24h/24." },
      { name: "TV Bruit", url: "http://tvbruit.com/", comment: "Télé associative et citoyenne, média de contre-pouvoir." },
      { name: "WebTélé 31", url: "https://webtele31.fr/", comment: "Média citoyen de l'association Nord Loisirs." },
      { name: "La Mouette (Agglo-Rieuse)", url: "https://youtube.com/@LagglorieuseOccitanie", comment: "Web-TV satirique et décalée sur la région." },
      { 
        name: "Bonjour Toulouse (Instagram)", 
        url: "https://www.instagram.com/bonjour.toulouse/", 
        category: "Média Vidéo Web",
        comment: "Format court : reels, interviews et tests de bonnes adresses." 
      },
      { name: "Bonjour Toulouse (Facebook)", url: "https://www.facebook.com/bonjourtoulouse/", category: "Média Vidéo Web", comment: "Communauté locale et actus en vidéo." },
      { name: "Bonjour Toulouse (TikTok)", url: "https://www.tiktok.com/@bonjourtoulouse", category: "Média Vidéo Web", comment: "Découverte de la ville en formats viraux." },
      { name: "Bonjour Toulouse (YouTube)", url: "https://www.youtube.com/@BonjourToulouse", category: "Média Vidéo Web", comment: "Reportages et formats longs sur la Ville Rose." }
    ],
    presse_hebdo_web: [
      { name: "Actu Toulouse", url: "https://actu.fr/occitanie/toulouse", status: "✅ Actif", comment: "La version numérique quotidienne la plus réactive actuellement." },
      { name: "Mediacités Toulouse", url: "https://www.mediacites.fr/toulouse", status: "✅ Actif", comment: "Journal d'enquête indépendant et local (sans pub)." },
      { name: "Toulouse Infos", url: "http://www.toulouseinfos.fr", status: "✅ Actif", comment: "Site d'actualité pure-player toulousain." },
      { name: "La Dépêche du Midi", url: "https://www.ladepeche.fr", status: "✅ Actif", comment: "Le grand quotidien régional historique." },
      { name: "Le Journal Toulousain", url: "https://www.lejournaltoulousain.fr", status: "✅ Actif", comment: "Média d'actualité positive et journal de solutions." },
      { name: "Côté Toulouse", url: "https://actu.fr/cote-toulouse", status: "✅ Actif", comment: "Hebdomadaire gratuit distribué dans le métro." },
      { name: "20 Minutes Toulouse", url: "https://www.20minutes.fr/toulouse", status: "✅ Actif", comment: "Édition locale du quotidien gratuit d'information." },
      { name: "L'Opinion Indépendante", url: "https://lopinion.com", status: "✅ Actif", comment: "Hebdomadaire d'analyses politiques et juridiques." },
      { name: "La Gazette du Midi", url: "https://www.gazette-du-midi.fr", status: "✅ Actif", comment: "Actualité économique, juridique et sociale." },
      { name: "Le Petit Journal", url: "https://lepetitjournal.net", status: "✅ Actif", comment: "L'hebdo de proximité de vos quartiers et villages." },
      { name: "Voix du Midi", url: "https://actu.fr/voix-du-midi", status: "🟠 Partiel", comment: "Focus sur le Lauragais et le sud-est toulousain." },
      { name: "L'Agglo-Rieuse", url: "https://www.lagglorieuse.info", status: "✅ Actif", comment: "Hebdomadaire satirique local." }
    ],
    economie_emploi: [
      { name: "Touléco", url: "https://www.touleco.fr", status: "✅ Actif", comment: "Le site de référence pour l'économie toulousaine." },
      { name: "Le Journal des Entreprises", url: "https://www.lejournaldesentreprises.com/toulouse", status: "✅ Actif", comment: "L'info B2B pour les dirigeants de Haute-Garonne." },
      { name: "La Tribune Toulouse", url: "https://toulouse.latribune.fr", status: "🔄 Actif", comment: "Ex-Objectif News. Analyses sur l'aéro et le spatial." },
      { name: "Top Économique Occitanie", url: "https://www.top-economique-occitanie.fr", status: "✅ Actif", comment: "L'annuaire annuel des décideurs régionaux." },
      { name: "Entreprises Occitanie", url: "https://www.entreprises-occitanie.com", status: "✅ Actif", comment: "Portail de l'actualité des entreprises locales." },
      { name: "Toulemploi", url: "https://www.toulemploi.fr", status: "✅ Actif", comment: "Spécialiste de l'actualité de l'emploi et de la formation." },
      { name: "L'Apprentissage en Occitanie", url: "https://www.apprentissage-en-occitanie.fr", status: "✅ Actif", comment: "Tout sur l'alternance et l'apprentissage." },
      { name: "Le Tafeur", url: "http://www.letafeur.com", status: "✅ Actif", comment: "Journal dédié à l'emploi intérimaire." }
    ],
    culture_lifestyle: [
      { name: "Le Petit Tou", url: "https://www.lepetittou.com", status: "✅ Actif", comment: "City-guide annuel (TBS). La bible des bonnes adresses." },
      { name: "Clutch", url: "https://www.clutchmag.fr", status: "✅ Actif", comment: "Magazine culturel gratuit et référence sorties." },
      { name: "U'Zoom", url: "https://uzoom.fr", status: "✅ Actif", comment: "Le magazine des étudiants toulousains (co-édité par Flash)." },
      { name: "Boudu", url: "https://www.boudulemag.com", status: "✅ Actif", comment: "Mensuel qualitatif de récits et de portraits." },
      { name: "Flash !", url: "http://www.flashhebdo.fr", status: "✅ Actif", comment: "L'hebdomadaire culturel historique de Toulouse." },
      { name: "Ancrage", url: "https://www.ancrage.org", status: "✅ Actif", comment: "Mémoire des métissages et des quartiers populaires." },
      { name: "Pyrénées Magazine", url: "https://www.pyrenees-magazine.com", status: "✅ Actif", comment: "Bimensuel dédié à la montagne et au patrimoine." },
      { name: "Le Patrimoine", url: "https://www.editions-du-patrimoine-occitanie.com", status: "✅ Actif", comment: "Revue sur l'histoire et les richesses régionales." },
      { name: "L'art vues", url: "https://www.lartvues.com", status: "✅ Actif", comment: "L'Art-vues est le magazine culturel en région..." },
      { name: "Radici", url: "https://www.radici-press.net", status: "✅ Actif", comment: "Actualité et culture italo-occitane." },
      { name: "Ramdam", url: "http://www.ramdam-mag.info", status: "✅ Actif", comment: "L'agenda culturel des sorties toulousaines." },
      { name: "L'Exploreur", url: "https://exploreur.univ-toulouse.fr", status: "✅ Actif", comment: "Média de culture scientifique (Université de Toulouse)." },
      { name: "Sortir Occitanie", url: "https://sortir.eu/region/occitanie", status: "✅ Actif", comment: "Sortir à Toulouse et en Ocitanie." },
      { name: "L'Indic", url: "http://l-indic.fr", status: "🟠 Rare", comment: "Le fanzine dédié au roman noir et au polar." }
    ],
    institutionnel_quartiers: [
      { name: "La Lettre d'Arnaud-Bernard", url: "https://metropole.toulouse.fr/quartiers/capitole-arnaud-bernard-carmes", status: "✅ Actif", comment: "Suivi des travaux et projets du quartier Capitole/Arnaud-Bernard." },
      { name: "Le 24 Heures", url: "https://www.le24heures.fr", status: "✅ Actif", comment: "Journalisme étudiant sur la sociologie des quartiers." },
      { name: "À Toulouse (Mairie)", url: "https://www.toulouse.fr", comment: "Le magazine officiel d'information municipale." },
      { name: "TIM (Métropole)", url: "https://www.toulouse-metropole.fr", comment: "Toulouse Métropole Infos : grands projets métropolitains." },
      { name: "Ma Haute-Garonne", url: "https://www.haute-garonne.fr", comment: "L'actu du département (conseil départemental)." },
      { name: "Occitanie Info", url: "https://www.laregion.fr", comment: "Le magazine d'information de la Région Occitanie." },
      { name: "Grands Sites Occitanie", url: "https://www.grands-sites-occitanie.fr", comment: "Portail du patrimoine touristique majeur régional." }
    ]
  };

  return NextResponse.json(mediaData);
}
