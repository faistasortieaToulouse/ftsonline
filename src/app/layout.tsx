import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Footer } from '@/components/Footer';
import GoogleTranslate from '@/components/GoogleTranslate';

// 1. Configuration du Viewport (Optimisé pour mobile et thèmes)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

// 2. Métadonnées SEO (Optimisées)
export const metadata: Metadata = {
  title: 'FTS Online - Agenda & Événements à Toulouse et Haute-Garonne',
  description: "Découvrez l'agenda complet des événements à Toulouse : Meetup, sorties cinéma, librairies, culture et transports Tisséo. Votre guide pratique en Occitanie.",
  keywords: "Toulouse, Haute-Garonne, Occitanie, Agenda, Actualités, Meetup, Culture, Cinéma, Librairie, Jeux de société, Sport, Musées, Transports Tisséo, Circulation",
  authors: [{ name: "FTS Online" }],
  robots: "index, follow",
  metadataBase: new URL("https://ftstoulouse.fr.eu.org"),
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
        {/* Préconnexion aux polices pour la performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      {/* CORRECTION MAJEURE : 
          L'ajout de suppressHydrationWarning ici sur <body> est indispensable 
          car Google Translate modifie les classes du body au chargement.
      */}
      <body 
        className="font-body antialiased flex flex-col min-h-screen bg-background text-foreground"
        suppressHydrationWarning
      >
        
        {/* Header collant avec flou de fond (Backdrop blur) */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container max-w-7xl mx-auto flex h-20 items-center justify-between px-4">
            
            {/* Logo / Marque */}
<div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
  <span className="text-primary">FTS</span>
  <span className="hidden sm:inline">Online</span> 
</div>

            {/* Zone du traducteur Google (Optimisée pour éviter le saut de mise en page) */}
            <div className="flex items-center">
              {/* min-h-[75px] réserve l'espace pour "Besoin d'aide" + le sélecteur */}
              <div className="w-48 sm:w-64 min-h-[75px] flex flex-col justify-center">
                <GoogleTranslate />
              </div>
            </div>
          </div>
        </header>

        {/* Contenu principal flexible */}
        <main className="flex-1 w-full">
            {children}
        </main>

        {/* Pied de page et Notifications */}
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
