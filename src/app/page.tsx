// src/app/page.tsx
import DiscordEvents from './DiscordEvents';
import { getAgendaEvents } from '@/lib/events';

export default async function Page() {
  // --- Fetch côté serveur ---
  const serverEvents = await getAgendaEvents();

  return (
    <div>
      <h1>Événements côté serveur</h1>
      {serverEvents.length === 0 ? (
        <p>Aucun événement enregistré pour l’instant.</p>
      ) : (
        <ul>
          {serverEvents.map(event => (
            <li key={event.id}>
              <strong>{event.name}</strong> — {event.date}
            </li>
          ))}
        </ul>
      )}

      <h2>Événements Discord</h2>
      <DiscordEvents />
    </div>
  );
}
