import { NextResponse } from 'next/server';

export async function GET() {
  const themes = [
    {
      id: "langues",
      nom: "Langues & Cultures Internationales",
      groupes: [
        { nom: "Espagnol & Latino-américain", tags: "Espagne, Latino, Toulouse", url: "https://www.facebook.com/groups/1482021405184791/" },
        { nom: "Portugais & Brésilien", tags: "Portugal, Brésil, Lusophone", url: "https://www.facebook.com/groups/1760687577335941/" },
        { nom: "Allemand & Autrichien", tags: "Deutsch, Autriche, Toulouse", url: "https://www.facebook.com/groups/1944047188945401/" },
        { nom: "Italie à Toulouse", tags: "Italia, Italiens, Tolosa", url: "https://www.facebook.com/groups/1641039322887779/" },
        { nom: "Russes à Toulouse", tags: "Russie, Russophone", url: "https://www.facebook.com/groups/1755258194752886/" },
        { nom: "Anglais à Toulouse", tags: "UK, USA, Australie, Canada", url: "https://www.facebook.com/groups/149380452132293/" },
        { nom: "English Conversation", tags: "Échanges, Pratique, English", url: "https://www.facebook.com/groups/1715780202079244/" },
        { nom: "Roumain & Moldave", tags: "România, Moldova", url: "https://www.facebook.com/groups/1935035430079517/" },
        { nom: "Arméniens à Toulouse", tags: "Arménie, Armenians", url: "https://www.facebook.com/groups/1586092411413799/" },
        { nom: "Turc à Toulouse", tags: "Turquie, Türk, Türkçe", url: "https://www.facebook.com/groups/893598364138135/" },
        { nom: "Iranien à Toulouse", tags: "Iran, Perse, Farsi", url: "https://www.facebook.com/groups/451314721937140/" },
        { nom: "Chinois à Toulouse", tags: "Chine, China, Chinese", url: "https://www.facebook.com/groups/1158600600939611/" },
        { nom: "Japonais à Toulouse", tags: "Japon, Japan, Japanese", url: "https://www.facebook.com/groups/1257914657676921/" },
        { nom: "Bulgare à Toulouse", tags: "Bulgarie, Balkan", url: "https://www.facebook.com/groups/1772767893023651/" },
        { nom: "Coréen à Toulouse", tags: "Corée, Korea", url: "https://www.facebook.com/groups/604166226373691/" },
        { nom: "Grec à Toulouse", tags: "Grèce, Ellada", url: "https://www.facebook.com/groups/371698993300755/" },
        { nom: "Vietnamien à Toulouse", tags: "Vietnam", url: "https://www.facebook.com/groups/332770863868616/" },
        { nom: "Hongrois à Toulouse", tags: "Hongrie, Magyar", url: "https://www.facebook.com/groups/137786226878719/" },
        { nom: "Finlandais à Toulouse", tags: "Finlande, Suomi", url: "https://www.facebook.com/groups/2015665725376662/" },
        { nom: "Nordiques (SE, NO, DK, IS)", tags: "Suède, Norvège, Danemark, Islande", url: "https://www.facebook.com/groups/110538246395948/" },
        { nom: "Géorgien à Toulouse", tags: "Géorgie, Sakartvelo", url: "https://www.facebook.com/groups/167650650505966/" },
        { nom: "Néerlandais & Flamand", tags: "Pays-Bas, Belgique, Hollande", url: "https://www.facebook.com/groups/443095642753859/" },
        { nom: "Ex-Yougoslavie à Toulouse", tags: "Slovène, Croate, Serbe, Bosniaque", url: "https://www.facebook.com/groups/155225811755490/" },
        { nom: "Polonais à Toulouse", tags: "Pologne, Polska", url: "https://www.facebook.com/groups/910244515790835/" },
        { nom: "Tchèque & Slovaque", tags: "Tchéquie, Slovaquie", url: "https://www.facebook.com/groups/1937638046498682/" },
        { nom: "Ukrainien à Toulouse", tags: "Ukraine, Slava", url: "https://www.facebook.com/groups/1844140295877416/" },
        { nom: "Biélorusse à Toulouse", tags: "Biélorussie", url: "https://www.facebook.com/groups/195874034292722/" },
        { nom: "Pays Baltes", tags: "Estonie, Lituanie, Lettonie", url: "https://www.facebook.com/groups/196917857549956/" },
        { nom: "Langues Régionales", tags: "Occitan, Breton, etc.", url: "https://www.facebook.com/groups/1612677245463500/" },
        { nom: "Langues Internationales", tags: "Esperanto, Universelles", url: "https://www.facebook.com/groups/1413571428771775/" },
        { nom: "Speak French in Toulouse", tags: "FLE, Apprendre le Français", url: "https://www.facebook.com/groups/1991034294518474/" },
        { nom: "Francophonie", tags: "Monde Francophone", url: "https://www.facebook.com/groups/258210721377779/" },
        { nom: "BlaBla Language", tags: "Échanges, Meetup", url: "https://www.facebook.com/groups/356614417120886/" },
        { nom: "Expats in Toulouse", tags: "International, Expats", url: "https://www.facebook.com/groups/2376203776102276/" }
      ]
    },
    {
      id: "emploi",
      nom: "Emploi & Stages",
      groupes: [
        { nom: "Job Emploi Toulouse", tags: "Offres, Travail, Recrutement", url: "https://www.facebook.com/groups/610512799102569/" },
        { nom: "Job Emploi Toulouse 2", tags: "Second réseau, Offres", url: "https://www.facebook.com/groups/393974514354438/" },
        { nom: "Stage stagiaire Toulouse", tags: "Étudiants, Entreprises", url: "https://www.facebook.com/groups/213105309209864/" },
        { nom: "Stage Toulouse", tags: "Opportunités, Stages", url: "https://www.facebook.com/groups/1737087406536094/" }
      ]
    },
    {
      id: "ateliers",
      nom: "Ateliers, Savoirs & Bénévolat",
      groupes: [
        { nom: "Atelier CV & Recherche d'emploi", tags: "Conseils, Coaching", url: "https://www.facebook.com/groups/1433439290101937/" },
        { nom: "Ateliers des Savoirs", tags: "Partage, Connaissances", url: "https://www.facebook.com/groups/1836787253308960/" },
        { nom: "Cours de langues gratuits", tags: "Gratuité, Entraide", url: "https://www.facebook.com/groups/1024547880932602/" },
        { nom: "Animation & Skype Langues", tags: "Conversation, Distance", url: "https://www.facebook.com/groups/761871843918057/" },
        { nom: "Cours de Français (FLE) gratuit", tags: "Apprendre le Français", url: "https://www.facebook.com/groups/1231828433495102/" },
        { nom: "Ateliers Savoirs et Langues", tags: "Mixité, Culture", url: "https://www.facebook.com/groups/357544334643954/" },
        { nom: "Echange de cours Toulouse", tags: "Troc, Savoir", url: "https://www.facebook.com/groups/151901325170393/" },
        { nom: "Animation Langues Discussions langues skype Toulouse", tags: "Troc, Savoir", url: "https://www.facebook.com/groups/761871843918057/" },
        { nom: "Cuisines du Monde", tags: "Gastronomie, Partage", url: "https://www.facebook.com/groups/480910125448878/" },
        { nom: "Donner des cours (Volontariat)", tags: "Recherche profs, Aide", url: "https://www.facebook.com/groups/959318320770775/" },
        { nom: "Danse Toulouse & Occitanie", tags: "Salsa, Rock, Traditionnel", url: "https://www.facebook.com/groups/180976875592860/" },
        { nom: "Quiz & Conférences", tags: "Culture, Sorties", url: "https://www.facebook.com/groups/210655635946096/" },
        { nom: "Bénévoles Toulouse", tags: "Social, Aide", url: "https://www.facebook.com/groups/1680682215481816/" },
        { nom: "Bénévole Association", tags: "Engagement, Solidarité", url: "https://www.facebook.com/groups/1676848765887973/" }
      ]
    },
    {
      id: "international",
      nom: "Rencontres & International",
      groupes: [
        { nom: "Café Des Langues", tags: "Échanges, Mixité, Soirées", url: "https://www.facebook.com/groups/191206554544247/" },
        { nom: "Happy People Toulouse", tags: "Sorties, Amitiés, Fun", url: "https://www.facebook.com/groups/996796667051330/" },
        { nom: "InterNations Toulouse", tags: "Expats, Networking", url: "https://www.facebook.com/groups/249521198758885/" },
        { nom: "Accueil Nouveaux & Étrangers", tags: "Intégration, Bienvenue", url: "https://www.facebook.com/groups/974349162642416/" },
        { nom: "Filles au pair Toulouse", tags: "Au Pair, Communauté", url: "https://www.facebook.com/groups/1677176065871274/" },
        { nom: "Au Pairs in Toulouse", tags: "Au Pair, Communauté", url: "https://www.facebook.com/groups/260757111118788/" },
        { nom: "Welcome to Toulouse", tags: "Tourisme, Expatriés", url: "https://www.facebook.com/groups/911682058930690/" },
        { nom: "MeetUp Expat", tags: "Social, International", url: "https://www.facebook.com/groups/717400535445494/" },
        { nom: "New Friends and Food", tags: "Gastronomie, Rencontres", url: "https://www.facebook.com/groups/446939310488155/" }
      ]
    },
    {
      id: "logement",
      nom: "Logement & Colocation",
      groupes: [
        { nom: "La Carte des Colocs", tags: "Colocation, Appartements", url: "https://www.facebook.com/groups/1272971156117937/" },
        { nom: "Colocation hébergement gratuit Toulouse", tags: "Colocation, Appartements", url: "https://www.facebook.com/groups/559216034241574/" },
        { nom: "Hébergement Gratuit", tags: "Solidarité, Entraide", url: "https://www.facebook.com/groups/559216034241574/" },
        { nom: "Couchsurfing Toulouse", tags: "Voyageurs, Hospitalité", url: "https://www.facebook.com/groups/1554591708185236/" },
        { nom: "Logement Toulouse", tags: "Annonces, Location", url: "https://www.facebook.com/groups/430950623781041/" },
        { nom: "Auberge de Jeunesse", tags: "Backpackers, Court séjour", url: "https://www.facebook.com/groups/882551768524729/" },
        { nom: "Hébergement Dernière Minute", tags: "Urgence, Dépannage", url: "https://www.facebook.com/groups/1661941354080716/" },
        { nom: "Appartager Toulouse", tags: "Colocs, Recherche", url: "https://www.facebook.com/groups/1149632251763387/" },
        { nom: "Wwoofing & Workaway", tags: "Volontariat, Nature, Échange", url: "https://www.facebook.com/groups/164804887311025/" }
      ]
    },
    {
      id: "covoiturage",
      nom: "Transports & Covoiturage",
      groupes: [
        { nom: "BlaBlaCar Toulouse", tags: "Voyages, Partage frais", url: "https://www.facebook.com/groups/233144037066485/" },
        { nom: "Covoiturage Toulouse", tags: "Trajets quotidiens", url: "https://www.facebook.com/groups/1031387650260593/" },
        { nom: "Sorties & Covoiturage Night", tags: "Discothèque, Sécurité", url: "https://www.facebook.com/groups/1541661882827138/" }
      ]
    },
    id: "sorties",
      nom: "Soirées, Sorties & Loisirs",
      groupes: [
        { nom: "Sorties Soirées Toulouse", tags: "Fête, Rencontres, Nightlife", url: "https://www.facebook.com/groups/596757027131271/" },
        { nom: "Sorties Visite Région Toulousaine", tags: "Tourisme, Culture, Patrimoine", url: "https://www.facebook.com/groups/546506525504472/" },
        { nom: "Soirées ERASMUS", tags: "Étudiants, International, Party", url: "https://www.facebook.com/groups/985981198114855/" },
        { nom: "Randonnées Pyrénées", tags: "Nature, Montagne, Sport", url: "https://www.facebook.com/groups/903021969753097/" },
        { nom: "Repas pique nique Toulouse", tags: "Convivialité, Plein air, Repas", url: "https://www.facebook.com/groups/566958656805309/" },
        { nom: "Pique-nique Toulouse", tags: "Convivialité, Plein air, Repas", url: "https://www.facebook.com/groups/1262927567162691/" },
        { nom: "Sortie ski dans les Pyrénées à partir de Toulouse", tags: "Hiver, Glisse, Covoiturage", url: "https://www.facebook.com/groups/304919476675833/" },
        { nom: "Sortie à la plage, mer, baignade à partir de Toulouse", tags: "Été, Baignade, Méditerranée", url: "https://www.facebook.com/groups/169962730264331/" },
        { nom: "Les Toulousains de Toulouse", tags: "Identité, Local, Entraide", url: "https://www.facebook.com/groups/1979331888986201/" },
        { nom: "Réveillon de Noël 24 décembre - Christmas Eve Free Toulouse", tags: "Fêtes, Solidarité, Fin d'année", url: "https://www.facebook.com/groups/130539997728049/" },
        { nom: "Réveillon du Nouvel An le 31 décembre à Toulouse - New Year's Eve Free", tags: "Fêtes, Solidarité, Fin d'année", url: "https://www.facebook.com/groups/142246859768492/" },
        { nom: "Sorties entre Filles", tags: "Occitanie, Sororité, Sécurité", url: "https://www.facebook.com/groups/1397077878141492/" },
        { nom: "Salons de thé & Restaurants", tags: "Gastronomie, Coffee Shop, Foodies", url: "https://www.facebook.com/groups/1313021633356765/" },
        { nom: "Jeux, Bars & Clubs de jeux", tags: "Loisirs, Gaming, Société", url: "https://www.facebook.com/groups/1363843758107232/" },
        { nom: "Randonnées Pyrénées, balade, visite à partir de Toulouse", tags: "Escapades, Grand Air", url: "https://www.facebook.com/groups/25509149805453238/" }
      ]
    },
    { id: "culture", nom: "Culture", groupes: [
        { nom: "Photos Insolites Toulouse", tags: "Concours, Photo, Occitanie", url: "https://www.facebook.com/groups/toulouseoccitaniephotosinsolites" },
        { nom: "Théâtre & Stand-up", tags: "Impro, Spectacles, Comédie", url: "https://www.facebook.com/groups/1396560737927890" },
        { nom: "Comédie Club & Blind Test", tags: "Quizz, Humour, Jeux", url: "https://www.facebook.com/groups/625050106569426" },
        { nom: "Lecture & Écriture", tags: "Livres, Plume, Littérature", url: "https://www.facebook.com/groups/1355306319236116" },
        { nom: "Sorties Culturelles", tags: "Musées, Patrimoine, Art", url: "https://www.facebook.com/groups/513531158446053/" },
        { nom: "Toulouse pittoresque, mystérieuse, insolite", tags: "Musées, Patrimoine, Art", url: "https://www.facebook.com/groups/tholosa.pittoresque.mysterieuse.insolite/" },
        { nom: "Ville de Toulouse, Histoire et Photographie", tags: "Musées, Patrimoine, Art", url: "https://www.facebook.com/groups/tusaisquetuvientdetoulouse/" },
        { nom: "Spectacles et concerts (31) Haute Garonne", tags: "Musées, Patrimoine, Art", url: "https://www.facebook.com/groups/166764296989718/" },
        { nom: "Les Concerts Gratuits de Toulouse", tags: "Musées, Patrimoine, Art", url: "https://www.facebook.com/groups/221534187648/" },
        { nom: "Les concerts et Jam Sessions Toulousaines !", tags: "Musées, Patrimoine, Art", url: "https://www.facebook.com/groups/201993529841614/" }
    ]},
    { id: "loisirs", nom: "Loisirs", groupes: [
      { nom: "Sport à Toulouse", tags: "Fitness, Course, Équipes, Santé", url: "https://www.facebook.com/groups/1492320668700625" },
      { nom: "New Friends and Food", tags: "Social, Gastronomie, Rencontres", url: "https://www.facebook.com/groups/446939310488155/" }
    ]},
      { id: "bonsplans", nom: "Bons Plans", groupes: [
      { nom: "Toulouse Le Bon Plan", tags: "Astuces, Économies, Local", url: "https://www.facebook.com/groups/550741995050817/" },
      { nom: "Tout Toulouse Gratuit & Libre", tags: "Gratuité, Partage, Bons plans", url: "https://www.facebook.com/groups/1443232687438416" },
      { nom: "Toulouse Libre ou Gratuit", tags: "Sorties, Prix libre, Accessibilité", url: "https://www.facebook.com/groups/651831044888765/" }
    ]},
  ];

  return NextResponse.json(themes);
}
