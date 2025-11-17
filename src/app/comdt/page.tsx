import React from "react";
import { headers } from "next/headers";

// Typage des événements ICS (aligné avec route.ts)
interface IcsEvent {
  uid?: string;
  summary?: string;
  dtstart?: string;
  dtend?: string;
  description?: string;
  location?: string;
  url?: string;
  [key: string]: string | undefined;
}

// ====================================================================
// 1. Fonction de récupération des données (getEvents)
// ====================================================================
async function getEvents(): Promise<IcsEvent[]> {
  try {
    // Récupérer l'host courant via Next.js
    const host = headers().get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    const res = await fetch(`${baseUrl}/api/comdt`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Local API fetch failed with status: ${res.status}`);
      return [];
    }

    const data = await res.json();
    return data.records || [];
  } catch (err) {
    console.error("Error in getEvents:", err);
    return [];
  }
}

// ====================================================================
// 2. Composant principal
// ====================================================================
export default async function ComdtPage() {
  const events = await getEvents();

  // Fonction utilitaire pour formater les dates ICS
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Date non spécifiée";

    try {
      const normalized = dateString.endsWith("Z") ? dateString : dateString + "Z";
      const iso = normalized.replace(
        /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/,
        "$1-$2-$3T$4:$5:$6Z"
      );

      const date = new Date(iso);
      if (isNaN(date.getTime())) return "Date invalide";

      return date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Erreur de formatage de la date";
    }
  };

  return (
    <main style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        🎶 Agenda du COMT (Centre des Musiques et Danses Traditionnelles)
      </h1>

      {events.length === 0 ? (
        <p
          style={{
            color: "orange",
            border: "1px solid orange",
            padding: "15px",
            borderRadius: "5px",
          }}
        >
          Aucun événement trouvé ou erreur de chargement.
          (Vérifiez le log du serveur pour l’analyseur ICS ou l’URL source.)
        </p>
      ) : (
        <section>
          <h2 style={{ fontSize: "1.5em", marginBottom: "20px" }}>
            Événements trouvés : {events.length}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {events.map((event, index) => {
              const title = event.summary || "Titre indisponible";
              const startDate = event.dtstart || event.dtend;
              const description = event.description || "Description non disponible.";
              const locationName = event.location || "Lieu non spécifié";
              const url = event.url;

              return (
                <div
                  key={event.uid || index}
                  style={{
                    border: "1px solid #0056b3",
                    padding: "15px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    backgroundColor: "#f9f9ff",
                  }}
                >
                  <h3 style={{ color: "#0056b3", marginBottom: "10px" }}>{title}</h3>

                  <p style={{ marginBottom: "5px" }}>
                    <strong>Quand :</strong> {formatDate(startDate)}
                  </p>

                  <p style={{ marginBottom: "5px" }}>
                    <strong>Où :</strong> {locationName}
                  </p>

                  {url && (
                    <p style={{ marginBottom: "10px" }}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#00aaff" }}
                      >
                        Voir les détails
                      </a>
                    </p>
                  )}

                  <details
                    style={{
                      marginTop: "10px",
                      borderTop: "1px solid #eee",
                      paddingTop: "10px",
                    }}
                  >
                    <summary
                      style={{
                        cursor: "pointer",
                        fontWeight: "bold",
                        color: "#333",
                      }}
                    >
                      Description
                    </summary>
                    <p
                      style={{
                        fontSize: "0.9em",
                        marginTop: "5px",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {description}
                    </p>
                  </details>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
