import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FTS Online Toulouse",
    short_name: "FTS Online",
    description: "Découvrez l'agenda complet des événements à Toulouse : Meetup, sorties cinéma, librairies, culture et transports Tisséo. Votre guide pratique en Occitanie.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    dir: "ltr",
    orientation: "any",
    scope: "/",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/favicon.ico",
        sizes: "192x192",
        type: "image/x-icon",
      },
    ],
  }
}