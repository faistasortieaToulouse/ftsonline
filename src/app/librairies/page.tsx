// src/app/librairies/page.tsx
import LibrairiesClient from "./LibrairiesClient";

export default function LibrairiesPage() {
  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Podcasts des librairies</h1>
      <LibrairiesClient />
    </main>
  );
}
