import { headers } from "next/headers";

export const dynamic = "force-dynamic";

async function getEvents() {
  try {
    // 🔥 Récupère l'URL complète du site (ftsonline.vercel.app)
    const host = headers().get("host");
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

    const res = await fetch(`${protocol}://${host}/api/actutoulouse`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    return await res.json();
  } catch (e) {
    console.error("PAGE FETCH ERROR:", e);
    return null;
  }
}

export default async function ActuToulousePage() {
  const data = await getEvents();
  const events = data?.records ?? [];

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Évènements à Toulouse</h1>

      {events.length === 0 && (
        <p className="text-red-500">Aucun événement trouvé.</p>
      )}

      <ul className="space-y-4">
        {events.map((event: any) => {
          const f = event.fields || {};

          return (
            <li key={event.recordid} className="border p-4 rounded">
              <h2 className="text-xl font-semibold">{f.titre || "Sans titre"}</h2>
              <p>{f.description || "Pas de description"}</p>
              {f.date && <p>📅 {f.date}</p>}
              {f.lieu && <p>📍 {f.lieu}</p>}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
