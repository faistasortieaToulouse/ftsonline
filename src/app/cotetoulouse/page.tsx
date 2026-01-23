import React from "react";
import CategoriesGrid from "@/components/CategoriesGrid";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface CategorieItem {
  label: string;
  url?: string;
  separator?: boolean;
  [key: string]: any;
}

async function getCategories(): Promise<CategorieItem[]> {
  try {
    const baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:9002"
        : "https://ftstoulouse.vercel.app";

    const res = await fetch(`${baseUrl}/api/cotetoulouse`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.records) ? data.records : [];
  } catch {
    return [];
  }
}

export default async function CoteToulousePage() {
  const categories = await getCategories();

  return (
    <main style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", fontFamily: "sans-serif" }}>
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
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
            textAlign: "center",
          }}
        >
          Aucun lien trouvé ou erreur de connexion à l'API locale.
        </p>
      ) : (
        <CategoriesGrid categories={categories} />
      )}
    </main>
  );
}
