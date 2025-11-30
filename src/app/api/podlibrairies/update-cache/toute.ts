import fs from "fs/promises";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), "data", "podlibrairies-cache.json");

export async function runFullUpdate() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:9002";

  const [marathonRes, terraRes, ombresRes] = await Promise.all([
    fetch(`${baseUrl}/api/podmarathon`, { cache: "no-store" }),
    fetch(`${baseUrl}/api/podterra`, { cache: "no-store" }),
    fetch(`${baseUrl}/api/podombres`, { cache: "no-store" }),
  ]);

  const [marathonData, terraData, ombresData] = await Promise.all([
    marathonRes.json(),
    terraRes.json(),
    ombresRes.json(),
  ]);

  const allEpisodes = [
    ...(marathonData.data || []),
    ...(terraData.data || []),
    ...(ombresData.data || []),
  ];

  await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(allEpisodes, null, 2), "utf8");

  console.log(`[PodLibrairies] Update toute terminée (${allEpisodes.length} épisodes)`);

  return allEpisodes;
}
