import { NextResponse } from 'next/server';

// Interface pour la structure des données des galeries
interface Gallery {
    name: string;
    address: string;
    url: string;
}

// Liste complète des galeries d'art et espaces culturels à Toulouse
const galleries: Gallery[] = [
    { name: "Galerie Next", address: "4 rue du Chapeau Rouge, 31000 Toulouse", url: "http://www.nextgalerie.com/" },
    { name: "Galerie Alain Daudet", address: "35 rue de la Colombette, 31000 Toulouse", url: "http://www.galeriealaindaudet.fr/" },
    { name: "Galerie des Carmes", address: "24 rue des Carmes, 31000 Toulouse", url: "http://www.galeriedescarmes.com/" },
    { name: "Galerie Tokade", address: "32 rue de la Bourse, 31000 Toulouse", url: "http://www.tokade.com/" },
    { name: "Bam Gallerie", address: "6 rue Sainte-Ursule, 31000 Toulouse", url: "http://www.bam-gallery.com/" },
    { name: "Galerie Aude Guirauden", address: "38 rue du Puits Vert, 31000 Toulouse", url: "http://www.galerie-aude-guirauden-toulouse.fr/" },
    { name: "Concept Galerie", address: "12 rue des Tourneurs, 31000 Toulouse", url: "http://www.concept-galerie.com/" },
    { name: "Sakah Galerie", address: "22 rue de l'Écharpe, 31000 Toulouse", url: "http://www.sakahgalerie.com/" },
    { name: "Artiempo", address: "14 rue Saint-Jérôme, 31000 Toulouse", url: "http://www.artiempo.fr/" },
    { name: "Galerie Sourillan", address: "10 rue du Puits Vert, 31000 Toulouse", url: "http://www.galerie-sourillan.com/" },
    { name: "Galerie Kandler", address: "16 rue du Puits Vert, 31000 Toulouse", url: "http://www.galeriekandler.com/" },
    { name: "Galerie Morellon", address: "30 rue des Tourneurs, 31000 Toulouse", url: "http://www.galerie-morellon.fr/" },
    { name: "Galerie Cortade", address: "3 rue du Sénéchal, 31000 Toulouse", url: "http://www.cortade-art.com/la-galerie" },
    { name: "l'Atelier", address: "16 rue des Paradoux, 31000 Toulouse", url: "http://www.galerie-latelier.com/" },
    { name: "Galerie Graal", address: "56 grande rue Saint-Michel, 31400 Toulouse", url: "http://www.galeriegraal.com/" },
    { name: "Contemporenéités de l'Art", address: "1 rue Malbec, 31000 Toulouse", url: "http://www.contemporaneitesdelart.fr/" },
    { name: "Lieu Commun", address: "25 rue d'Armagnac, 31500 Toulouse", url: "http://www.lieu-commun.fr/" },
    { name: "Mixart Myrys", address: "14 rue Ferdinand Lassalle, 31200 Toulouse", url: "http://www.mixart-myrys.org/" },
    { name: "Atelier des métiers d'Arts", address: "15 rue de la République, 31300 Toulouse", url: "http://www.atelierdesmetiersdart.com/" },
    { name: "Bazacle EDF", address: "11 quai Saint-Pierre, 31000 Toulouse", url: "http://bazacle.edf.com/" },
    { name: "Galerie d'Art Contemporain (Exprmntl)", address: "18 Rue de la Bourse Au 1er étage du, 31000 Toulouse", url: "http://www.exprmntl.fr/" },
    { name: "L'Etang d'Art", address: "1, pl du Capitole, 31000 Toulouse", url: "http://www.letangdart.com/" },
    { name: "Lulumirettes", address: "28 Rue Caraman, 31000 Toulouse", url: "http://www.lulumirettes.org/" },
    { name: "Artisteo", address: "1, pl du Capitole, 31000 Toulouse", url: "http://www.artisteo.fr/" },
    { name: "Actu Photo", address: "1, pl du Capitole, 31000 Toulouse", url: "http://fr.actuphoto.com/" },
    { name: "Annexia", address: "6, avenue du Cimetière, 31500 Toulouse", url: "http://www.annexia-net.com/" },
    { name: "La Petite", address: "7 Allée Paul Feuga, 31000 Toulouse", url: "http://www.lapetite.fr/" },
    { name: "Créart 31", address: "27, allées de Brienne, 31000 Toulouse", url: "http://www.creart31.com/" },
    { name: "A la Plage", address: "1, pl du Capitole, 31000 Toulouse", url: "http://alaplage.free.fr/" },
    { name: "Mini Marts", address: "1, pl du Capitole, 31000 Toulouse", url: "http://www.minimarts.org/" },
    { name: "APSAR", address: "70 Chem. Michoun, 31500 Toulouse", url: "http://apsar.blogspot.fr/" },
    { name: "Par Hazart", address: "61 Rue Saint-Jean, 31130 Balma", url: "http://www.parhazart.org/" },
    { name: "Le Gribouillard", address: "33 Imp. Michel Ange, 31200 Toulouse", url: "http://www.legribouillard.com/" },
    { name: "Lilellule", address: "1, pl du Capitole, 31000 Toulouse", url: "http://www.lilellule.fr/" },
    { name: "Minerva art et culture", address: "12, avenue de Savoie, 31000 Toulouse", url: "http://www.minervaartetculture.odexpo.com/" },
    { name: "Association Fun d'Art", address: "4, rue Alexandre Soumet, 31240 L'Union", url: "http://www.asso-fundart.fr/" },
    { name: "Arts Plastiques", address: "1, pl du Capitole, 31000 Toulouse", url: "http://www.arts-plastiques-toulouse.com/" },
    { name: "Art Rollice Toulouse", address: "4 Chem. Carrosse, 31400 Toulouse", url: "http://www.artrollicetoulouse.com/l-association/" },
    { name: "Catart", address: "8 Rue Lucien Mirouse, 31400 Toulouse", url: "http://www.yelp.fr/biz/association-catart-toulouse" },
    { name: "Arts Saint-Cyprien", address: "8 Pl. Intérieure Saint-Cyprien, 31300 Toulouse", url: "http://arts-st-cyprien.com/" },
    { name: "111 des Arts", address: "BP 90816, 31008 Toulouse cedex", url: "http://www.les111desarts.org/TOULOUSE/Main.html" },
    { name: "Pink Pong", address: "7, rue des Régeans, 31000 Toulouse", url: "http://www.pinkpong.fr/" },
    { name: "Art n Cie", address: "9 av Plaine, 31130 Balma", url: "http://www.art-n-cie.org/" },
    { name: "Association Diapason", address: "7bis Rue du Cher, 31100 Toulouse", url: "http://assodiapason.fr/3.html" },
    { name: "AAEL Toulouse", address: "8 Rue de Bagnolet, 31100 Toulouse", url: "http://aael-toulouse.eklablog.com/" },
    { name: "Galerie Alain Daudet 2 / 3", address: "35 rue de la Colombette, 31000 Toulouse", url: "http://www.galeriealaindaudet.com/" },
    { name: "Stefaline", address: "12 rue Baronie, 31000 Toulouse", url: "http://www.stefaline.com/" },
    { name: "Cirque des Arts", address: "22 rue de la Fonderie, 31000 Toulouse (Siège social association)", url: "http://www.cirquedesarts.com/" },
    { name: "Caisse d'Epargne Art (Centre d'Art)", address: "33-35 allées Jules Guesde, 31000 Toulouse", url: "http://www.caisseepargne-art-contemporain.fr/" },
    { name: "Galerie Toguna", address: "11 rue de la Trinité, 31000 Toulouse", url: "http://www.galerie-toguna.com/" },
    { name: "Passage à l'Art", address: "24 rue Jean Séguy, 31300 Toulouse", url: "http://www.passagealart.com/" },
    { name: "Le Jardin des Arts", address: "16 rue Genty-Magre, 31000 Toulouse", url: "http://www.lejardindesarts-toulouse.com/galerie.html" },
    { name: "Galerie Sourillan", address: "10 rue du Puits Vert, 31000 Toulouse", url: "http://www.galeriesourillan.com/" },
    { name: "Cri d'Art", address: "18 rue du Huit Mai 1945, 31130 Balma (Adresse en périphérie)", url: "http://www.cridart.com/" },
    { name: "Cortade Galerie", address: "3 rue du Sénéchal, 31000 Toulouse", url: "http://cortade-artcom.com.over-blog.com/" },
    { name: "Galerie Serventi", address: "32 rue des Tourneurs, 31000 Toulouse", url: "http://www.galerieserventi.com/" },
    { name: "Le Confort des Étranges", address: "3 rue des Amidonniers, 31000 Toulouse", url: "http://www.le-confort-des-etranges.com/" },
    { name: "Galerie Chappert Gaujal", address: "11 rue du Puits Vert, 31000 Toulouse", url: "http://www.chappert-gaujal.com/" },
    { name: "Galerie Christineville", address: "17 allée Jules Guesde, 31000 Toulouse", url: "http://www.christineville-galerie.com/" },
    { name: "Lebb", address: "13 rue de la Viguerie, 31300 Toulouse (Collectif d'artistes)", url: "http://www.lebbb.org/" },
    { name: "Association Regarts", address: "15 rue des Arcs Saint Cyprien, 31300 Toulouse", url: "http://www.asso-regarts.com/" },
    { name: "Tetaneutral", address: "22 rue Saint-Louis, 31500 Toulouse (Association de FAI/Colocation)", url: "http://www.tetaneutral.net/" },
    { name: "Archipel", address: "13 place des Trois Cocus, 31200 Toulouse", url: "http://www.archipel-toulouse.fr/" },
    { name: "Atelier Bizart", address: "56 avenue de l'Urss, 31400 Toulouse", url: "http://www.atelier-bizart.fr/" },
    { name: "Arts Renaissants", address: "27 rue de la Colombette, 31000 Toulouse", url: "http://www.arts-renaissants.fr/" },
    { name: "Carrefour Culturel Arnaud-Bernard", address: "18 rue des Chalets, 31000 Toulouse", url: "http://www.arnaud-bernard.net/" },
    { name: "Centre Culturel des Minimes", address: "6 place du Marché aux Cochons, 31200 Toulouse", url: "http://www.centrecultureldesminimes.fr/" },
    { name: "MJC Demoiselles", address: "27 rue des Demoiselles, 31400 Toulouse", url: "http://mjc.demoiselles.free.fr/" },
    { name: "MJC Croix-Daurade", address: "147 chemin Nicol, 31200 Toulouse", url: "http://www.mjccroixdaurade.fr/" },
    { name: "MJC Ponts-Jumeaux", address: "100 avenue des Minimes, 31200 Toulouse", url: "http://www.mjcpontsjumeaux.fr/" },
    { name: "MJC Ancely", address: "Place du Dr. Baylac, 31300 Toulouse", url: "http://www.mjcancely.fr/" },
    { name: "MJC Jacques Prévert", address: "35 allée des Demoiselles, 31400 Toulouse", url: "http://www.mjcprevert31.net/" },
    { name: "MJC Empalot", address: "4 rue Jean Vilar, 31400 Toulouse", url: "http://www.mjcempalot.fr/" }
];

/**
 * Gère les requêtes GET pour retourner la liste des galeries.
 */
export async function GET() {
    return NextResponse.json(galleries);
}
