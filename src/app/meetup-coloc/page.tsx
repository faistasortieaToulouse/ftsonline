export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";

const PLACEHOLDER_IMAGE =
  "https://via.placeholder.com/400x200?text=Événement+Meetup";

type MeetupEvent = {
  guid: string;
  titre: string;
  date: string;
  description: string;
  image?: string;
  lieu: string;
  address: string;
  link: string;
  dateFormatted: string;
};

async function fetchMeetupEvents(): Promise<MeetupEvent[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/meetup-coloc`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Impossible de récupérer les événements Meetup");

  const data = await res.json(); // JSON GitHub = tableau d'événements

  return data.map((ev: any) => {
    const dateRaw = ev.date ? new Date(ev.date) : null;

    const dateFormatted = dateRaw
      ? dateRaw.toLocaleString("fr-FR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Date non précisée";

    return {
      guid: ev.guid || ev.link || crypto.randomUUID(),
      titre: ev.titre || "Événement sans titre",
      date: ev.date || "",
      description: ev.description || "",
      image: ev.image || PLACEHOLDER_IMAGE,
      lieu: ev.lieu || "",
      address: ev.address || ev.lieu || "Lieu non spécifié",
      link: ev.link || "#",
      dateFormatted,
    } as MeetupEvent;
  });
}

export default async function Page() {
  let events: MeetupEvent[] = [];
  let error: string | null = null;

  try {
    events = await fetchMeetupEvents();
  } catch (err: any) {
    console.error(err);
    error = err.message || "Erreur inconnue lors du chargement des événements Meetup";
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">
        Évènements Meetup Toulouse colocation, logement, emploi, café des langues
      </h1>
      <p className="text-muted-foreground mb-6">
        Prochains événements du groupe Meetup sur 31 jours.
      </p>

      {error && (
        <div className="mt-6 p-4 border border-red-500 bg-red-50 text-red-700 rounded">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {events.length === 0 && !error && (
        <p className="mt-6 text-xl text-gray-500 p-8 border border-dashed rounded-lg text-center">
          Aucun événement à venir trouvé.
        </p>
      )}

      {events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {events.map((event, index) => (
            <div
              key={event.guid || index}
              className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col border border-gray-100"
            >
              <img
                src={event.image || PLACEHOLDER_IMAGE}
                alt={event.titre}
                className="w-full aspect-[16/9] object-cover"
              />
              <div className="p-4 flex flex-col flex-1">
                <h2 className="text-xl font-semibold mb-2 text-red-700">
                  {event.titre}
                </h2>
                <p className="text-sm font-medium mb-1">📍 {event.address}</p>
                <p className="text-sm text-gray-600 mb-3 font-semibold">
                  {event.dateFormatted}
                </p>
                <p className="text-sm text-gray-700 mb-2 flex-1 line-clamp-4 whitespace-pre-wrap">
                  {event.description}
                </p>
                <p className="text-xs text-muted-foreground italic mb-3 mt-auto">
                  Source : Meetup
                </p>
                {event.link && (
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-block bg-red-600 text-white text-center py-2 px-3 rounded hover:bg-red-700 transition"
                  >
                    🔗 Voir l’événement Meetup
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
