'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate compelling event descriptions from keywords.
 *
 * It exports:
 * - `generateEventDescription`: A function to generate the event description.
 * - `EventDescriptionInput`: The input type for the `generateEventDescription` function.
 * - `EventDescriptionOutput`: The output type for the `generateEventDescription` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EventDescriptionInputSchema = z.object({
  keywords: z
    .string()
    .describe(
      'Keywords describing the event.  Separate keywords with commas or other delimiters.'
    ),
  eventName: z.string().describe('The name of the event.'),
  targetAudience: z
    .string()
    .optional()
    .describe('Optional. The target audience for the event.'),
});
export type EventDescriptionInput = z.infer<typeof EventDescriptionInputSchema>;

const EventDescriptionOutputSchema = z.object({
  description: z
    .string()
    .describe('A compelling event description generated from the keywords.'),
});
export type EventDescriptionOutput = z.infer<typeof EventDescriptionOutputSchema>;

export async function generateEventDescription(
  input: EventDescriptionInput
): Promise<EventDescriptionOutput> {
  return eventDescriptionGeneratorFlow(input);
}

const eventDescriptionPrompt = ai.definePrompt({
  name: 'eventDescriptionPrompt',
  input: {schema: EventDescriptionInputSchema},
  output: {schema: EventDescriptionOutputSchema},
  prompt: `You are an expert copywriter specializing in writing engaging event descriptions.

  Based on the following keywords, generate a compelling event description for the event "{{eventName}}".

  Keywords: {{{keywords}}}

  {{#if targetAudience}}
  The target audience for this event is: {{{targetAudience}}}
  {{/if}}
  `,
});

const eventDescriptionGeneratorFlow = ai.defineFlow(
  {
    name: 'eventDescriptionGeneratorFlow',
    inputSchema: EventDescriptionInputSchema,
    outputSchema: EventDescriptionOutputSchema,
  },
  async input => {
    const {output} = await eventDescriptionPrompt(input);
    return output!;
  }
);
