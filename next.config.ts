import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.lafrenchtechtoulouse.com',
      },
      {
        protocol: 'https',
        hostname: 'www.culture-en-mouvements.org',
      },
    ],
  },

  // 🔹 Configuration i18n pour la traduction multi-langues
  i18n: {
    locales: [
      "fr", "de", "en", "ar", "eu", "zh-CN", "es",
      "fa", "hi", "it", "ja", "oc", "pt", "ru", "tr", "no", "ro"
    ],
    defaultLocale: "fr",
  },
};

export default nextConfig;
