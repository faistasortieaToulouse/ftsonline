// src/app/cotetoulouse/page.tsx

import { headers } from 'next/headers';

async function getCategories() {
    try {
        let host = headers().get("host");

        if (!host) {
            const defaultHost = process.env.NODE_ENV === "development"
                ? "localhost:9002"
                : null;
            if (!defaultHost) throw new Error("Cannot determine host header.");
            host = defaultHost;
        }

        const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
        const apiUrl = `${protocol}://${host}/api/cotetoulouse`;

        const res = await fetch(apiUrl, { cache: "no-store" });

        if (!res.ok) return [];

        const data = await res.json();
        return data.records || [];
    } catch (e) {
        console.error(e);
        return [];
    }
}

export default async function CoteToulousePage() {
    const categories = await getCategories();

    return (
        <main style={{ padding: "20px" }}>
            <h1>📚 Thématiques Toulouse</h1>

            {categories.length === 0 ? (
                <p style={{ color: "orange", border: "1px solid orange", padding: "10px" }}>
                    Aucun lien trouvé ou erreur API.
                </p>
            ) : (
                <section>
                    <h2>Liens disponibles : {categories.length}</h2>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "15px",
                        marginTop: "20px"
                    }}>
                        {categories.map((cat, index) => (
                            <a
                                key={index}
                                href={cat.url}
                                target="_blank"
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
                                {cat.label}
                            </a>
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}
