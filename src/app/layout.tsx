import type { Metadata, Viewport } from 'next'; // Ajout de Viewport ici
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Footer } from '@/components/Footer';

// 1. On sépare le Viewport (C'est ce qui règle vos erreurs)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// 2. On garde les métadonnées sans la ligne "viewport"
export const metadata: Metadata = {
  title: 'FTS Online - Agenda & Événements à Toulouse et Haute-Garonne',
  description: "Découvrez l'agenda complet des événements à Toulouse : Meetup, sorties cinéma, librairies, actualités culturelles, musées et visites en Occitanie. Guide pratique et transports Tisséo.",
  keywords: "Toulouse, Haute-Garonne, Occitanie, Agenda, Actualités, Meetup, Culture, Cinéma, Librairie, Jeux de société, Sport, Parcs et jardins, Galeries d'art, Visites thématiques, Histoire, Exil espagnol, Résistance, Centre-ville historique, Châteaux cathares, Randonnées, Itinéraires littéraires, Transports Tisséo, Circulation",
  authors: [{ name: "FTS Online" }],
  // viewport: "width=device-width, initial-scale=1", <-- CETTE LIGNE EST SUPPRIMÉE D'ICI
  robots: "index, follow",
  
  openGraph: {
    title: "FTS Online - Le guide des sorties à Toulouse",
    description: "Tout l'agenda culturel, social et pratique de Toulouse et sa région.",
    url: "https://ftstoulouse.fr.eu.org",
    siteName: "FTS Online Toulouse",
    locale: "fr_FR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "FTS Online Toulouse",
    description: "Agenda et sorties culturelles à Toulouse et en Occitanie.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <div className="flex-1">
            {children}
        </div>
        <Footer />
        <Toaster />
        <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
      </body>
    </html>
  );
}
