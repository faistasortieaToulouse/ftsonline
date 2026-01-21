import { NextResponse } from 'next/server';

// Interface pour la structure des données des galeries
interface Gallery {
    name: string;
    address: string;
    url: string;
}

// Liste complète des galeries d'art et espaces culturels à Toulouse
const galleries: Gallery[] = [
    { name: "Galerie Next", address: "4 rue du Chapeau Rouge, 31000 Toulouse", url: "http://www.nextgalerie.com/", lat: 43.6014, lng: 1.4421 },
    { name: "Galerie Alain Daudet", address: "35 rue de la Colombette, 31000 Toulouse", url: "http://www.galeriealaindaudet.fr/", lat: 43.6053, lng: 1.4533 },
    { name: "Galerie des Carmes", address: "24 rue des Carmes, 31000 Toulouse", url: "http://www.galeriedescarmes.com/", lat: 43.5985, lng: 1.4446 },
    { name: "Galerie Tokade", address: "32 rue de la Bourse, 31000 Toulouse", url: "http://www.tokade.com/", lat: 43.6018, lng: 1.4415 },
    { name: "Bam Gallerie", address: "6 rue Sainte-Ursule, 31000 Toulouse", url: "http://www.bam-gallery.com/", lat: 43.6019, lng: 1.4431 },
    { name: "Galerie Aude Guirauden", address: "38 rue du Puits Vert, 31000 Toulouse", url: "http://www.galerie-aude-guirauden-toulouse.fr/", lat: 43.6011, lng: 1.4452 },
    { name: "Concept Galerie", address: "12 rue des Tourneurs, 31000 Toulouse", url: "http://www.concept-galerie.com/", lat: 43.6006, lng: 1.4448 },
    { name: "Sakah Galerie", address: "22 rue de l'Écharpe, 31000 Toulouse", url: "http://www.sakahgalerie.com/", lat: 43.6011, lng: 1.4419 },
    { name: "Artiempo", address: "14 rue Saint-Jérôme, 31000 Toulouse", url: "http://www.artiempo.fr/", lat: 43.6034, lng: 1.4468 },
    { name: "Galerie Sourillan", address: "10 rue du Puits Vert, 31000 Toulouse", url: "http://www.galerie-sourillan.com/", lat: 43.6015, lng: 1.4444 },
    { name: "Galerie Kandler", address: "16 rue du Puits Vert, 31000 Toulouse", url: "http://www.galeriekandler.com/", lat: 43.6014, lng: 1.4446 },
    { name: "Galerie Morellon", address: "30 rue des Tourneurs, 31000 Toulouse", url: "http://www.galerie-morellon.fr/", lat: 43.6001, lng: 1.4452 },
    { name: "Galerie Cortade", address: "3 rue du Sénéchal, 31000 Toulouse", url: "http://www.cortade-art.com/la-galerie", lat: 43.6045, lng: 1.4438 },
    { name: "l'Atelier", address: "16 rue des Paradoux, 31000 Toulouse", url: "http://www.galerie-latelier.com/", lat: 43.5996, lng: 1.4429 },
    { name: "Galerie Graal", address: "56 grande rue Saint-Michel, 31400 Toulouse", url: "http://www.galeriegraal.com/", lat: 43.5908, lng: 1.4475 },
    { name: "Contemporenéités de l'Art", address: "1 rue Malbec, 31000 Toulouse", url: "http://www.contemporaneitesdelart.fr/", lat: 43.5999, lng: 1.4433 },
    { name: "Lieu Commun", address: "25 rue d'Armagnac, 31500 Toulouse", url: "http://www.lieu-commun.fr/", lat: 43.6186, lng: 1.4582 },
    { name: "Mixart Myrys", address: "14 rue Ferdinand Lassalle, 31200 Toulouse", url: "http://www.mixart-myrys.org/", lat: 43.6158, lng: 1.4191 },
    { name: "Atelier des métiers d'Arts", address: "15 rue de la République, 31300 Toulouse", url: "http://www.atelierdesmetiersdart.com/", lat: 43.5997, lng: 1.4365 },
    { name: "Bazacle EDF", address: "11 quai Saint-Pierre, 31000 Toulouse", url: "http://bazacle.edf.com/", lat: 43.6033, lng: 1.4328 },
    { name: "Galerie d'Art Contemporain (Exprmntl)", address: "18 Rue de la Bourse, 31000 Toulouse", url: "http://www.exprmntl.fr/", lat: 43.6010, lng: 1.4422 },
    { name: "L'Etang d'Art", address: "1, pl du Capitole, 31000 Toulouse", url: "http://www.letangdart.com/", lat: 43.6044, lng: 1.4442 },
    { name: "Lulumirettes", address: "28 Rue Caraman, 31000 Toulouse", url: "http://www.lulumirettes.org/", lat: 43.6015, lng: 1.4514 },
    { name: "Artisteo", address: "1, pl du Capitole, 31000 Toulouse", url: "http://www.artisteo.fr/", lat: 43.6044, lng: 1.4442 },
    { name: "Actu Photo", address: "1, pl du Capitole, 31000 Toulouse", url: "http://fr.actuphoto.com/", lat: 43.6044, lng: 1.4442 },
    { name: "Annexia", address: "6, avenue du Cimetière, 31500 Toulouse", url: "http://www.annexia-net.com/", lat: 43.6106, lng: 1.4595 },
    { name: "La Petite", address: "7 Allée Paul Feuga, 31000 Toulouse", url: "http://www.lapetite.fr/", lat: 43.5937, lng: 1.4445 },
    { name: "Créart 31", address: "27, allées de Brienne, 31000 Toulouse", url: "http://www.creart31.com/", lat: 43.6061, lng: 1.4325 },
    { name: "A la Plage", address: "1, pl du Capitole, 31000 Toulouse", url: "http://alaplage.free.fr/", lat: 43.6044, lng: 1.4442 },
    { name: "Mini Marts", address: "1, pl du Capitole, 31000 Toulouse", url: "http://www.minimarts.org/", lat: 43.6044, lng: 1.4442 },
    { name: "APSAR", address: "70 Chem. Michoun, 31500 Toulouse", url: "http://apsar.blogspot.fr/", lat: 43.6214, lng: 1.4697 },
    { name: "Par Hazart", address: "61 Rue Saint-Jean, 31130 Balma", url: "http://www.parhazart.org/", lat: 43.6074, lng: 1.4886 },
    { name: "Le Gribouillard", address: "33 Imp. Michel Ange, 31200 Toulouse", url: "http://www.legribouillard.com/", lat: 43.6288, lng: 1.4429 },
    { name: "Lilellule", address: "1, pl du Capitole, 31000 Toulouse", url: "http://www.lilellule.fr/", lat: 43.6044, lng: 1.4442 },
    { name: "Minerva art et culture", address: "12, avenue de Savoie, 31000 Toulouse", url: "http://www.minervaartetculture.odexpo.com/", lat: 43.6191, lng: 1.4326 },
    { name: "Association Fun d'Art", address: "4, rue Alexandre Soumet, 31240 L'Union", url: "http://www.asso-fundart.fr/", lat: 43.6601, lng: 1.4815 },
    { name: "Arts Plastiques", address: "1, pl du Capitole, 31000 Toulouse", url: "http://www.arts-plastiques-toulouse.com/", lat: 43.6044, lng: 1.4442 },
    { name: "Art Rollice Toulouse", address: "4 Chem. Carrosse, 31400 Toulouse", url: "http://www.artrollicetoulouse.com/l-association/", lat: 43.5714, lng: 1.4678 },
    { name: "Catart", address: "8 Rue Lucien Mirouse, 31400 Toulouse", url: "http://www.yelp.fr/biz/association-catart-toulouse", lat: 43.5755, lng: 1.4552 },
    { name: "Arts Saint-Cyprien", address: "8 Pl. Intérieure Saint-Cyprien, 31300 Toulouse", url: "http://arts-st-cyprien.com/", lat: 43.5982, lng: 1.4332 },
    { name: "111 des Arts", address: "BP 90816, 31008 Toulouse cedex", url: "http://www.les111desarts.org/TOULOUSE/Main.html", lat: 43.6045, lng: 1.4440 },
    { name: "Pink Pong", address: "7, rue des Régeans, 31000 Toulouse", url: "http://www.pinkpong.fr/", lat: 43.6025, lng: 1.4478 },
    { name: "Art n Cie", address: "9 av Plaine, 31130 Balma", url: "http://www.art-n-cie.org/", lat: 43.6094, lng: 1.4883 },
    { name: "Association Diapason", address: "7bis Rue du Cher, 31100 Toulouse", url: "http://assodiapason.fr/3.html", lat: 43.5804, lng: 1.4116 },
    { name: "AAEL Toulouse", address: "8 Rue de Bagnolet, 31100 Toulouse", url: "http://aael-toulouse.eklablog.com/", lat: 43.5785, lng: 1.4111 },
    { name: "Galerie Alain Daudet 2 / 3", address: "35 rue de la Colombette, 31000 Toulouse", url: "http://www.galeriealaindaudet.com/", lat: 43.6053, lng: 1.4533 },
    { name: "Stefaline", address: "12 rue Baronie, 31000 Toulouse", url: "http://www.stefaline.com/", lat: 43.6014, lng: 1.4455 },
    { name: "Cirque des Arts", address: "22 rue de la Fonderie, 31000 Toulouse", url: "http://www.cirquedesarts.com/", lat: 43.5962, lng: 1.4439 },
    { name: "Caisse d'Epargne Art (Centre d'Art)", address: "33-35 allées Jules Guesde, 31000 Toulouse", url: "http://www.caisseepargne-art-contemporain.fr/", lat: 43.5939, lng: 1.4497 },
    { name: "Galerie Toguna", address: "11 rue de la Trinité, 31000 Toulouse", url: "http://www.galerie-toguna.com/", lat: 43.5992, lng: 1.4455 },
    { name: "Passage à l'Art", address: "24 rue Jean Séguy, 31300 Toulouse", url: "http://www.passagealart.com/", lat: 43.5956, lng: 1.4241 },
    { name: "Le Jardin des Arts", address: "16 rue Genty-Magre, 31000 Toulouse", url: "http://www.lejardindesarts-toulouse.com/galerie.html", lat: 43.6010, lng: 1.4458 },
    { name: "Galerie Sourillan", address: "10 rue du Puits Vert, 31000 Toulouse", url: "http://www.galeriesourillan.com/", lat: 43.6015, lng: 1.4444 },
    { name: "Cri d'Art", address: "18 rue du Huit Mai 1945, 31130 Balma", url: "http://www.cridart.com/", lat: 43.6105, lng: 1.4902 },
    { name: "Cortade Galerie", address: "3 rue du Sénéchal, 31000 Toulouse", url: "http://cortade-artcom.com.over-blog.com/", lat: 43.6045, lng: 1.4438 },
    { name: "Galerie Serventi", address: "32 rue des Tourneurs, 31000 Toulouse", url: "http://www.galerieserventi.com/", lat: 43.6001, lng: 1.4452 },
    { name: "Le Confort des Étranges", address: "3 rue des Amidonniers, 31000 Toulouse", url: "http://www.le-confort-des-etranges.com/", lat: 43.6049, lng: 1.4338 },
    { name: "Galerie Chappert Gaujal", address: "11 rue du Puits Vert, 31000 Toulouse", url: "http://www.chappert-gaujal.com/", lat: 43.6015, lng: 1.4448 },
    { name: "Galerie Christineville", address: "17 allée Jules Guesde, 31000 Toulouse", url: "http://www.christineville-galerie.com/", lat: 43.5935, lng: 1.4501 },
    { name: "Lebb", address: "13 rue de la Viguerie, 31300 Toulouse", url: "http://www.lebbb.org/", lat: 43.6005, lng: 1.4372 },
    { name: "Association Regarts", address: "15 rue des Arcs Saint Cyprien, 31300 Toulouse", url: "http://www.asso-regarts.com/", lat: 43.5978, lng: 1.4325 },
    { name: "Tetaneutral", address: "22 rue Saint-Louis, 31500 Toulouse", url: "http://www.tetaneutral.net/", lat: 43.6145, lng: 1.4528 },
    { name: "Archipel", address: "13 place des Trois Cocus, 31200 Toulouse", url: "http://www.archipel-toulouse.fr/", lat: 43.6369, lng: 1.4462 },
    { name: "Atelier Bizart", address: "56 avenue de l'Urss, 31400 Toulouse", url: "http://www.atelier-bizart.fr/", lat: 43.5852, lng: 1.4518 },
    { name: "Arts Renaissants", address: "27 rue de la Colombette, 31000 Toulouse", url: "http://www.arts-renaissants.fr/", lat: 43.6054, lng: 1.4526 },
    { name: "Carrefour Culturel Arnaud-Bernard", address: "18 rue des Chalets, 31000 Toulouse", url: "http://www.arnaud-bernard.net/", lat: 43.6125, lng: 1.4428 },
    { name: "Centre Culturel des Minimes", address: "6 place du Marché aux Cochons, 31200 Toulouse", url: "http://www.centrecultureldesminimes.fr/", lat: 43.6215, lng: 1.4358 },
    { name: "MJC Demoiselles", address: "27 rue des Demoiselles, 31400 Toulouse", url: "http://mjc.demoiselles.free.fr/", lat: 43.5888, lng: 1.4582 },
    { name: "MJC Croix-Daurade", address: "147 chemin Nicol, 31200 Toulouse", url: "http://www.mjccroixdaurade.fr/", lat: 43.6341, lng: 1.4725 },
    { name: "MJC Ponts-Jumeaux", address: "100 avenue des Minimes, 31200 Toulouse", url: "http://www.mjcpontsjumeaux.fr/", lat: 43.6214, lng: 1.4348 },
    { name: "MJC Ancely", address: "Place du Dr. Baylac, 31300 Toulouse", url: "http://www.mjcancely.fr/", lat: 43.6105, lng: 1.3995 },
    { name: "MJC Jacques Prévert", address: "35 allée des Demoiselles, 31400 Toulouse", url: "http://www.mjcprevert31.net/", lat: 43.5875, lng: 1.4595 },
    { name: "MJC Empalot", address: "4 rue Jean Vilar, 31400 Toulouse", url: "http://www.mjcempalot.fr/", lat: 43.5801, lng: 1.4435 }
];

/**
 * Gère les requêtes GET pour retourner la liste des galeries.
 */
export async function GET() {
    return NextResponse.json(galleries);
}
