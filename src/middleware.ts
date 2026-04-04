import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host');

  // Si l'utilisateur arrive sur le sous-domaine dev
  if (hostname === 'dev.ftstoulouse.online') {
    // Si la personne est à la racine, on lui montre le contenu de /dev
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/dev', request.url));
    }
  }
}
