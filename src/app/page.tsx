import { Header } from "@/components/Header";
import { GoogleTranslate } from "@/components/GoogleTranslate";
import { fetchAgendaToulouse } from "@/lib/agendaToulouse";

export default async function Home() {
  const events = await fetchAgendaToulouse();

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

        {/* Section des événements */}
        <div className="container mx-auto px-4 py-8 md:py-12">
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground mb-4">
            Événements à venir
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Découvrez les événements passionnants en Haute-Garonne.
          </p>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {events.map(ev => (
                <div key={ev.id} className="border rounded-lg overflow-hidden shadow-sm p-4">
                  <img
                    src={ev.image}
                    alt={ev.name}
                    className="w-full h-40 object-cover mb-4 rounded"
                  />
                  <h2 className="font-semibold text-lg mb-2">{ev.name}</h2>
                  <p className="text-sm text-muted-foreground mb-2">{ev.date}</p>
                  <p className="text-sm mb-2">{ev.location}</p>
                  <p className="text-sm">{ev.description}</p>
                  {ev.url && (
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary mt-2 inline-block font-medium"
                    >
                      En savoir plus
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Aucun événement trouvé pour le moment.</p>
          )}
        </div>
      </main>
    </div>
  );
}
