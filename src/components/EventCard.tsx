'use client';

import { Calendar, MapPin } from 'lucide-react';
import type { Event } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState, useEffect } from 'react';

type EventCardProps = {
  event: Event;
};

export function EventCard({ event }: EventCardProps) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    const eventDate = new Date(event.date);
    setFormattedDate(format(eventDate, 'PPP p', { locale: fr }));
  }, [event.date]);

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-lg">
      <CardHeader className="p-0">
        {/* 🟢 Image remplaçant Next/Image */}
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <img
            src={event.image || '/fallback.jpg'}
            alt={event.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            data-ai-hint={event.imageHint}
          />
        </div>

        <div className="p-6 pb-2">
          <CardTitle className="font-headline text-xl leading-tight mb-2">
            {event.name}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-grow p-6 pt-0">
        <p className="text-muted-foreground text-sm line-clamp-3">
          {event.description}
        </p>
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-4 p-6 pt-0">
        <div className="flex items-center text-sm text-muted-foreground gap-2 min-h-[20px]">
          <Calendar className="h-4 w-4 text-primary" />
          {formattedDate ? (
            <span>{formattedDate}</span>
          ) : (
            <div className="h-4 w-40 bg-muted rounded animate-pulse" />
          )}
        </div>

        <div className="flex items-center text-sm text-muted-foreground gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="line-clamp-1">{event.location}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
