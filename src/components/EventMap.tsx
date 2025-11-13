'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Event } from '@/lib/types';

// Dynamically import EventMap with no SSR
const LeafletMap = dynamic(() => import('./EventMapDynamic'), { ssr: false });

type Props = {
  events: Event[];
};

export default function EventMapWrapper({ events }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-[70vh] flex items-center justify-center text-muted-foreground">Chargement de la carte...</div>;

  return <LeafletMap events={events} />;
}
