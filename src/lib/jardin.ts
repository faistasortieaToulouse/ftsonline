/**
 * Synthèse complète des conseils de jardinage mois par mois
 * Basée sur les recommandations de Prêt à Jardiner
 */
const conseilsMensuels: { [key: number]: string } = {
  // JANVIER (Repos & Planification)
  0: "Janvier : Planifiez votre futur potager et nettoyez vos outils. Taillez les arbres fruitiers et les rosiers hors gel. Protégez les plantes fragiles avec un voile d'hivernage et évitez de piétiner la pelouse si elle est gelée.",
  
  // FÉVRIER (Réveil & Préparation)
  1: "Février : Amendez la terre avec du compost. Taillez les arbustes à fleurs d'été et les haies. Commencez les semis au chaud (tomates, aubergines) et plantez les arbustes à racines nues ainsi que les framboisiers.",
  
  // MARS (Lancement du Printemps)
  2: "Mars : Nettoyez les massifs et scarifiez la pelouse. Semez en pleine terre les carottes, radis et pois. C'est le moment de planter les oignons et les pommes de terre primeurs. Taillez les derniers fruitiers avant la montée de sève.",

  // AVRIL (Plantations actives)
  3: "Avril : Semez les fleurs annuelles et les herbes aromatiques. Surveillez les limaces qui attaquent les jeunes pousses. Plantez les bulbes d'été (dahlias, glaïeuls) et terminez le repiquage des salades.",

  // MAI (Après les Saints de Glace)
  4: "Mai : Installez en terre les légumes du soleil (tomates, courgettes, poivrons). Tondez régulièrement et tuteurez les plantes grimpantes. Désherbez avant que les sauvages ne montent en graine.",

  // JUIN (Entretien & Arrosage)
  5: "Juin : Arrosez le soir pour limiter l'évaporation. Paillez vos cultures pour garder l'humidité. Taillez les fleurs fanées des rosiers pour stimuler une nouvelle floraison. Récoltez les premières fraises et cerises.",

  // JUILLET (Récoltes & Protection)
  6: "Juillet : Priorité à l'arrosage et au binage. Récoltez les courgettes et haricots régulièrement pour favoriser la production. Protégez la serre du soleil direct avec un blanc de blanchiment ou un filet d'ombrage.",

  // AOÛT (Entretien estival)
  7: "Août : Continuez les récoltes abondantes. Semez les légumes d'hiver (mâche, épinards, navets). Taillez les arbustes ayant fini de fleurir et bouturez vos plantes préférées (géraniums, lauriers).",

  // SEPTEMBRE (Récoltes d'Automne)
  8: "Septembre : Récoltez les pommes, poires et courges. Semez ou réparez votre pelouse. C'est le moment idéal pour diviser les plantes vivaces et planter les stolons de fraisiers pour l'an prochain.",

  // OCTOBRE (Nettoyage & Bulbes)
  9: "Octobre : Plantez les bulbes de printemps (tulipes, narcisses). Ramassez les feuilles mortes pour votre compost. Rentrez les plantes frileuses et commencez à nettoyer les parcelles vides du potager.",

  // NOVEMBRE (Plantations ligneuses)
  10: "Novembre : 'À la Sainte-Catherine, tout bois prend racine'. Plantez vos arbres, arbustes et haies. Protégez les souches des artichauts et buttez les poireaux. Purgez les tuyaux et robinets extérieurs.",

  // DÉCEMBRE (Hivernage & Projets)
  11: "Décembre : Le jardin se repose. Vérifiez vos protections hivernales. Profitez du calme pour commander vos graines et dessiner vos plans de l'année prochaine. Nettoyez et graissez vos outils avant le remisage."
};

export function getConseilsJardin(date: Date): string {
  const mois = date.getMonth(); 
  return conseilsMensuels[mois] || "Observez la nature et préparez vos sols pour les saisons à venir.";
}