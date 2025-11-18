import { headers } from "next/headers";

async function getCategories() {
  try {
    let host = headers().get("host");

    if (!host) {
      const defaultHost = process.env.NODE_ENV === "development" ? "localhost:3000" : null;
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
    return data.records || [];
  } catch (err) {
    console.error("Error in getCategories:", err);
    return [];
  }
}

export default async function CoteToulousePage() {
  const categories = await getCategories();

  return (
    <main style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>📚 Liens Côté Toulouse</h1>

      {categories.length === 0 ? (
        <p style={{ color: "orange", border: "1px solid orange", padding: "10px" }}>
          Aucun lien trouvé ou erreur API.
        </p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "15px"
        }}>
          {categories.map((item: { label: string; url: string }, i: number) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                textAlign: "center",
                background: "#f8f8f8",
                textDecoration: "none",
                color: "#333",
                fontWeight: "bold"
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
