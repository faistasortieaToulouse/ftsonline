'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EventForm } from './EventForm';
import type { Event } from '@/lib/types';

type CreateEventProps = {
  onEventCreated: (event: Event) => void;
};

export function CreateEvent({ onEventCreated }: CreateEventProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm hover:shadow-md transition-shadow">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Create a New Event</DialogTitle>
          <DialogDescription>
            Fill in the details below. Locations must be within Haute-Garonne.
          </DialogDescription>
        </DialogHeader>
        <EventForm
          onFormSubmit={event => {
            onEventCreated(event);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
