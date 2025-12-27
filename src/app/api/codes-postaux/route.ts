import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface RawCodePostal {
  id_code_postal: number;
  code_postal: number;
  geo_point_2d?: { lat: number; lon: number };
  geo_shape?: any;
}

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "data",
      "mairie",
      "codes-postaux-de-toulouse.json"
    );

    if (!fs.existsSync(filePath)) return NextResponse.json([]);

    const fileContents = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(fileContents);
    const rawData: RawCodePostal[] = Array.isArray(parsed) ? parsed : parsed.results;

    const communesByCode: Record<string, string[]> = {
      "31000": ["Toulouse"],
      "31100": ["Toulouse"],
      "31130": ["Balma", "Flourens", "Pin-Balma", "Quint-Fonsegrives"],
      "31140": ["Aucamville", "Fonbeauzard", "Launaguet", "Saint-Alban"],
      "31150": ["Bruguières", "Fenouillet", "Gagnac-sur-Garonne", "Gratentour", "Lespinasse"],
      "31170": ["Tournefeuille", "Villeneuve-Tolosane"],
      "31200": ["Toulouse"],
      "31240": ["L’Union", "Saint-Jean"],
      "31270": ["Cugnaux"],
      "31280": ["Aigrefeuille", "Drémil-Lafage", "Mons", "Saint-Orens-de-Gameville"],
      "31300": ["Toulouse"],
      "31400": ["Toulouse"],
      "31490": ["Brax"],
      "31500": ["Toulouse"],
      "31650": ["Saint-Orens-de-Gameville"],
      "31700": ["Blagnac", "Beauzelle", "Cornebarrieu", "Mondonville"],
      "31770": ["Colomiers"],
      "31780": ["Castelginest"],
      "31790": ["Saint-Jory"],
      "31820": ["Pibrac"],
      "31840": ["Aussonne", "Seilh"],
      "31850": ["Beaupuy", "Mondouzil", "Montrabé"]
    };

    const data = rawData.map((item, index) => {
      const code = String(item.code_postal ?? "00000");
      return {
        id: String(item.id_code_postal ?? index + 1),
        code_postal: code,
        geo_point_2d: item.geo_point_2d
          ? { lat: Number(item.geo_point_2d.lat), lon: Number(item.geo_point_2d.lon) }
          : null,
        geo_shape: item.geo_shape ?? null,
        communes: communesByCode[code] ?? []
      };
    });

    // Ajout dynamique de Plaisance-du-Touch avec son vrai GeoJSON
    const plaisanceDuTouch = {
      id: "31820-PT",
      code_postal: "31820",
      communes: ["Plaisance-du-Touch"],
      geo_point_2d: { lat: 43.566, lon: 1.296 }, // centre approximatif
      geo_shape: {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [1.3104729777505,43.536668191723],
            [1.299290995075,43.535392912206],
            [1.2896157438668,43.525987758073],
            [1.2601798552868,43.535792549921],
            [1.2550540493933,43.545511565693],
            [1.2379040886319,43.552350442615],
            [1.2464289596589,43.559138282872],
            [1.24859517653,43.566990322517],
            [1.2531115639794,43.569306691334],
            [1.2715206897709,43.566337149566],
            [1.2922817977817,43.572060902268],
            [1.28840775057,43.577740748936],
            [1.2734417028742,43.587319788355],
            [1.2821568320575,43.598155947613],
            [1.2841290027456,43.599208588125],
            [1.3049145097859,43.594740762403],
            [1.2926211572073,43.584621590669],
            [1.293548848081,43.577197083679],
            [1.3236877266691,43.566939997447],
            [1.3285840219722,43.559157183116],
            [1.3148681827284,43.550705296115],
            [1.3110658142251,43.538340491075],
            [1.3104729777505,43.536668191723]
          ]]
        },
        properties: {}
      }
    };

    data.push(plaisanceDuTouch);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur lecture codes-postaux :", error);
    return NextResponse.json({ error: "Impossible de charger les codes postaux" }, { status: 500 });
  }
}
