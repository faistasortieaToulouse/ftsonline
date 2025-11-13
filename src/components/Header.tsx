import { Rocket } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <Rocket className="h-7 w-7 text-primary" />
          <span className="font-headline text-xl font-bold text-foreground">
            FTS ONLINE
          </span>
        </a>
        <Button asChild>
          <a href="https://www.faistasortieatoulouse.online/" target="_blank" rel="noopener noreferrer">
            Fais ta sortie à Toulouse
          </a>
        </Button>
      </div>
    </header>
  );
}
