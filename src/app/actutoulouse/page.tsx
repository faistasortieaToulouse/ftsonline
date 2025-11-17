// /app/actutoulouse/page.tsx

export const dynamic = "force-dynamic"; // pour éviter le cache Next.js

async function getEvents() {
const res = await fetch("/api/actutoulouse", {
  cache: "no-store",
});

  if (!res.ok) {
    throw new Error("Impossible de récupérer les événements");
  }

  return res.json();
}

export default async function ActuToulousePage() {
  const data = await getEvents();
  const events = data.records || [];

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Évènements à Toulouse</h1>

      {events.length === 0 && <p>Aucun événement trouvé.</p>}

      <ul className="space-y-4">
        {events.map((event: any) => (
          <li key={event.recordid} className="border p-4 rounded">
            <h2 className="text-xl font-semibold">
              {event.fields.titre || "Sans titre"}
            </h2>
            <p>{event.fields.description || "Pas de description"}</p>
            {event.fields.date && (
              <p className="text-sm text-gray-600">
                📅 {event.fields.date}
              </p>
            )}
            {event.fields.lieu && (
              <p className="text-sm text-gray-600">
                📍 {event.fields.lieu}
              </p>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
