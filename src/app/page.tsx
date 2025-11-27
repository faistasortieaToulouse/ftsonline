// src/app/page.tsx
import { EventList } from "@/components/EventList";
import { GoogleTranslate } from "@/components/GoogleTranslate";
import { Header } from "@/components/Header";

async function getAgendaEvents() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/agendatoulouse`, {
      cache: "no-store", // toujours à jour
    });
    if (!res.ok) throw new Error("Impossible de récupérer les événements");
    const data = await res.json();
    return data.events || [];
  } catch (err) {
    console.error("Erreur fetch agendatoulouse:", err);
    return [];
  }
}

export default async function Home() {
  const events = await getAgendaEvents();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 pt-8">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">Ta sortie à Toulouse</p>
            <GoogleTranslate />
          </div>
        </div>
        <EventList 
          initialEvents={events} 
          emptyMessage="Agendatoulouse" // ici, le texte si aucun événement
        />
      </main>
    </div>
  );
}
