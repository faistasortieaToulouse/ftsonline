import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Autoriser TOUTES les images HTTPS (nécessaire pour RSS + proxys)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
    ],
  },

  // ❗ i18n App Router → doit être retiré, mais on garde les locales
  // via un système différent (middleware ou route groups)
  // i18n: {
  //   locales: ['fr'],
  //   defaultLocale: 'fr',
  // },
};

export default nextConfig;
