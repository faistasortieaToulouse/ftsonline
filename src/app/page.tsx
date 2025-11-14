import { EventList } from "@/components/EventList";
import { GoogleTranslate } from "@/components/GoogleTranslate";
import { Header } from "@/components/Header";
import { getEvents } from "@/lib/events";

export default async function Home() {
  const events = await getEvents();

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
        <EventList initialEvents={events} />
      </main>
    </div>
  );
}
