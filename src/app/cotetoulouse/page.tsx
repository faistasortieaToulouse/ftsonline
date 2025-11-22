import { headers } from "next/headers";
import React from "react";

// ====================================================================
// NOUVELLE DIRECTIVE: Forcer le rendu dynamique
// Ceci est ESSENTIEL car la fonction getCategories utilise 'headers()',
// ce qui empêche Next.js de générer cette page statiquement au build.
export const dynamic = 'force-dynamic';
// ====================================================================

// Interface de base pour les éléments retournés par l'API
interface CategorieItem {
    label: string;
    url: string;
    [key: string]: any; 
}


async function getCategories(): Promise<CategorieItem[]> {
  try {
    let host = headers().get("host");

    if (!host) {
      const defaultHost = process.env.NODE_ENV === "development" ? "localhost:3000" : null;
      // On utilise 3000 comme port par défaut en dev si l'host est indéterminé
      if (!defaultHost) throw new Error("Cannot determine host header.");
      host = defaultHost;
    }

    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const apiUrl = `${protocol}://${host}/api/cotetoulouse`;

    const res = await fetch(apiUrl, { cache: "no-store" });

    if (!res.ok) {
      console.error("Fetch /api/cotetoulouse failed:", res.status);
      return [];
    }

    const data = await res.json();
    // On s'attend à ce que l'API retourne un objet { records: [] }
    return Array.isArray(data.records) ? data.records : [];
  } catch (err) {
    // @ts-ignore
    console.error("Error in getCategories:", err.message || err);
    return [];
  }
}

export default async function CoteToulousePage() {
  const categories = await getCategories();

  return (
    <main style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "30px", textAlign: "center", color: "#6A057F" }}>
        📚 Liens Côté Toulouse (Rubriques)
      </h1>

      {categories.length === 0 ? (
        <p 
          style={{ 
            color: "#FF5733", 
            border: "1px solid #FF5733", 
            padding: "15px", 
            borderRadius: "6px",
            backgroundColor: "#fff0f0",
            textAlign: "center"
          }}
        >
          Aucun lien trouvé ou erreur de connexion à l'API locale.
        </p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px"
        }}>
          {categories.map((item, i: number) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                padding: "15px",
                border: "2px solid #6A057F",
                borderRadius: "10px",
                textAlign: "center",
                background: "#fdfdff",
                textDecoration: "none",
                color: "#333",
                fontWeight: "bold",
                fontSize: "1.1em",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              // Ajouter un petit style pour l'effet de survol (hover)
              onMouseOver={(e) => {
                // @ts-ignore
                e.currentTarget.style.transform = 'translateY(-3px)';
                // @ts-ignore
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                // @ts-ignore
                e.currentTarget.style.transform = 'translateY(0)';
                // @ts-ignore
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </main>
  );
}