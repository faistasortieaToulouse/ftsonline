'use server';

/**
 * @fileOverview Flow to validate that an event location is within the Haute-Garonne region.
 *
 * - validateEventLocation - A function that validates the event location.
 * - ValidateEventLocationInput - The input type for the validateEventLocation function.
 * - ValidateEventLocationOutput - The return type for the validateEventLocation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateEventLocationInputSchema = z.object({
  location: z
    .string()
    .describe('The location of the event, including address and city.'),
});
export type ValidateEventLocationInput = z.infer<typeof ValidateEventLocationInputSchema>;

const ValidateEventLocationOutputSchema = z.object({
  isValid: z
    .boolean()
    .describe(
      'Whether the location is within the Haute-Garonne region (586 communes).' // Corrected description
    ),
  reason: z
    .string()
    .optional()
    .describe('The reason why the location is not valid, if applicable.'),
});
export type ValidateEventLocationOutput = z.infer<typeof ValidateEventLocationOutputSchema>;

export async function validateEventLocation(input: ValidateEventLocationInput): Promise<ValidateEventLocationOutput> {
  return validateEventLocationFlow(input);
}

const validateLocationPrompt = ai.definePrompt({
  name: 'validateLocationPrompt',
  input: {schema: ValidateEventLocationInputSchema},
  output: {schema: ValidateEventLocationOutputSchema},
  prompt: `You are an expert in Haute-Garonne geography.
  Your task is to determine if the provided event location is within the Haute-Garonne region, which includes 586 communes.
  Respond with a JSON object indicating whether the location is valid and, if not, provide a reason.

  Location: {{{location}}}
  `,
});

const validateEventLocationFlow = ai.defineFlow(
  {
    name: 'validateEventLocationFlow',
    inputSchema: ValidateEventLocationInputSchema,
    outputSchema: ValidateEventLocationOutputSchema,
  },
  async input => {
    const {output} = await validateLocationPrompt(input);
    return output!;
  }
);
