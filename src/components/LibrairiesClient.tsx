"use client";

import { useEffect, useState, useRef } from "react";
import { Play, Pause, Calendar, BookOpen, Mic, RefreshCcw } from "lucide-react";

interface PodcastEpisode {
librairie: string;
titre: string;
date: string;
audioUrl: string;
description: string;
}

interface Metadata {
totalEpisodes: number;
page: number;
limit: number;
totalPages: number;
lastUpdated: string;
}

export default function LibrairiesClient() {
const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
const [loading, setLoading] = useState(true);
const [query, setQuery] = useState("");
const [librairieFilter, setLibrairieFilter] = useState("");
const [page, setPage] = useState(1);
const [metadata, setMetadata] = useState<Metadata | null>(null);
const [playingIndex, setPlayingIndex] = useState<number | null>(null);

const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

const limit = 10;

const fetchEpisodes = async () => {
setLoading(true);
try {
const params = new URLSearchParams({
page: page.toString(),
limit: limit.toString(),
...(query ? { q: query } : {}),
...(librairieFilter ? { librairie: librairieFilter } : {}),
});

  const res = await fetch(`/api/podcasts?${params.toString()}`);
  const data = await res.json();

  if (data.success) {
    setEpisodes(data.data);
    setMetadata(data.metadata);
  } else {
    setEpisodes([]);
    setMetadata(null);
  }
} catch (err) {
  console.error("Erreur fetch podcasts:", err);
  setEpisodes([]);
  setMetadata(null);
} finally {
  setLoading(false);
}

};

useEffect(() => {
fetchEpisodes();
}, [page, query, librairieFilter]);

const handlePlayPause = (index: number) => {
const audio = audioRefs.current[index];
if (!audio) return;


if (playingIndex === index) {
  audio.pause();
  setPlayingIndex(null);
} else {
  // pause les autres
  audioRefs.current.forEach((a, i) => {
    if (i !== index && a) a.pause();
  });
  audio.play().catch(console.error);
  setPlayingIndex(index);
}

};

const librairieColors: Record<string, string> = {
"Ombres Blanches": "bg-blue-100 text-blue-800 border-blue-300",
"Terra Nova": "bg-green-100 text-green-800 border-green-300",
"Marathon des mots": "bg-purple-100 text-purple-800 border-purple-300",
"Librairie Mollat": "bg-yellow-100 text-yellow-800 border-yellow-300",
};

return ( <div className="p-4 space-y-6"> <div className="flex flex-wrap gap-2 items-center mb-4">
<input
type="text"
placeholder="Rechercher..."
value={query}
onChange={(e) => setQuery(e.target.value)}
className="border px-3 py-2 rounded flex-1"
/>
<select
value={librairieFilter}
onChange={(e) => setLibrairieFilter(e.target.value)}
className="border px-3 py-2 rounded"
> <option value="">Toutes les librairies</option>
{Object.keys(librairieColors).map((lib) => ( <option key={lib} value={lib}>{lib}</option>
))} </select> <button
       onClick={fetchEpisodes}
       className="flex items-center gap-2 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
     > <RefreshCcw className="w-4 h-4" /> Rafraîchir </button> </div>

  {loading ? (
    <p>Chargement...</p>
  ) : episodes.length === 0 ? (
    <p>Aucun épisode trouvé.</p>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {episodes.map((ep, i) => {
        const colorClass = librairieColors[ep.librairie] || "bg-gray-100 text-gray-800 border-gray-300";
        const formattedDescription =
          ep.description.length > 100 ? ep.description.substring(0, 100) + "..." : ep.description;
        const dateFormatted = new Date(ep.date).toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        return (
          <div
            key={i}
            className={`bg-white p-6 rounded-xl shadow-lg border ${colorClass} hover:shadow-xl transition duration-300 transform hover:scale-[1.02]`}
          >
            <div className="flex items-start justify-between">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${colorClass}`}>
                <BookOpen className="inline w-4 h-4 mr-1" /> {ep.librairie}
              </span>
              <button
                onClick={() => handlePlayPause(i)}
                className={`p-3 rounded-full shadow-md transition-all duration-300 ${
                  playingIndex === i ? "bg-red-500 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {playingIndex === i ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
            </div>

            <h3 className="mt-4 text-xl font-bold text-gray-900 line-clamp-2">{ep.titre}</h3>
            <p className="mt-2 text-gray-600 text-sm h-10">{formattedDescription}</p>

            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                <span>{dateFormatted}</span>
              </div>
              <div className="flex items-center">
                <Mic className="w-4 h-4 mr-1 text-gray-400" />
                <span>Podcast</span>
              </div>
            </div>

            <audio
              ref={(el) => (audioRefs.current[i] = el)}
              src={ep.audioUrl}
              onEnded={() => playingIndex === i && setPlayingIndex(null)}
              className="hidden"
            />
          </div>
        );
      })}
    </div>
  )}

  <div className="flex justify-between mt-4">
    <button
      onClick={() => page > 1 && setPage(page - 1)}
      disabled={page === 1}
      className="px-4 py-2 border rounded disabled:opacity-50"
    >
      Précédent
    </button>
    <span>
      Page {page} {metadata ? `sur ${metadata.totalPages}` : ""}
    </span>
    <button
      onClick={() => metadata && page < metadata.totalPages && setPage(page + 1)}
      disabled={metadata ? page >= metadata.totalPages : true}
      className="px-4 py-2 border rounded disabled:opacity-50"
    >
      Suivant
    </button>
  </div>
</div>

);
}
