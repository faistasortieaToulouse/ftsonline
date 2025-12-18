'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import parse from "html-react-parser";

export const dynamic = "force-dynamic"; // ⚡ Evite le SSG et l'erreur Dynamic server usage

const MAX_EVENTS = 50;

// 🔹 Images par défaut selon catégorie
const DEFAULT_IMAGES: Record<string, string> = {
  "Stages": "/images/comdt/catecomdtstage.jpg",
  "Stages de danse": "/images/comdt/catecomdtdanse.jpg",
  "Stages de musique": "/images/comdt/catecomdtmusique.jpg",
  "Saison du COMDT": "/images/comdt/catecomdtcomdt.jpg",
  "Evénements partenaires": "/images/comdt/catecomdtpartenaire.jpg",
};

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x200?text=Événement";

// 🔹 Formater les descriptions avec sauts de ligne
function formatDescription(desc: string) {
  if (!desc) return "";
  const html = desc.replace(/\n/g, "<br />");
  return parse(html);
}

export default function ComdtPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [searchTerm, setSearchTerm] = useState("");

  // 🔹 Récupération des événements ICS depuis l'API
  async function fetchEv
