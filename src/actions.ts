'use server';

import { z } from 'zod';
import { validateEventLocation } from '@/ai/flows/validate-event-location';
import { generateEventDescription } from '@/ai/flows/event-description-generator';
import type { Event } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const formSchema = z.object({
  eventName: z.string(),
  date: z.date(),
  location: z.string(),
  keywords: z.string(),
});

type FormState = {
  success: boolean;
  message?: string;
  event?: Event;
};

export async function createEvent(values: z.infer<typeof formSchema>): Promise<FormState> {
  const validatedFields = formSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid form data.',
    };
  }
  
  const { eventName, date, location, keywords } = validatedFields.data;

  try {
    // 1. Validate location using AI
    const locationValidation = await validateEventLocation({ location });
    if (!locationValidation.isValid) {
      return {
        success: false,
        message: `Location not valid: ${locationValidation.reason || 'Not in Haute-Garonne.'}`,
      };
    }

    // 2. Generate description using AI
    const descriptionResult = await generateEventDescription({
        eventName,
        keywords
    });

    if(!descriptionResult.description) {
        return {
            success: false,
            message: 'Could not generate an event description from the keywords.'
        }
    }
    
    // In a real app, you would save this to a database.
    // Here we construct a new event object to return to the client.
    const newId = Math.random().toString(36).substring(2, 11);
    const randomImage = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];
    
    const newEvent: Event = {
      id: newId,
      name: eventName,
      date: date.toISOString(),
      location: location,
      description: descriptionResult.description,
      image: randomImage.imageUrl,
      imageHint: randomImage.imageHint,
    };

    return {
      success: true,
      event: newEvent,
      message: 'Event created successfully!',
    };
  } catch (error) {
    console.error('Error creating event:', error);
    return {
      success: false,
      message: 'An unexpected error occurred on the server.',
    };
  }
}
