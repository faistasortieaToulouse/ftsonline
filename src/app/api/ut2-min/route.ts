import { NextRequest, NextResponse } from "next/server";

interface Event {
id: string;
title: string;
description: string;
start: string;
end: string | null;
location: string | null;
image: string | null;
url: string;
source: string;
category?: "Culture" | "Formation" | "Recherche" | "Vie Étudiante";
}

const MOCK_EVENTS: Event[] = [
{
id: "1",
title: "Conférence sur l'IA",
description: "Une conférence sur l'impact de l'intelligence artificielle.",
start: "2025-11-20T10:00:00",
end: null,
location: "Salle 101",
image: null,
url: "[https://www.canal-u.tv/chaines/ut2j](https://www.canal-u.tv/chaines/ut2j)",
source: "Canal-U",
category: "Recherche",
},
{
id: "2",
title: "Atelier de culture numérique",
description: "Découverte des outils numériques pour la culture.",
start: "2025-11-25T14:00:00",
end: "2025-11-25T15:30:00",
location: "Salle 202",
image: null,
url: "[https://www.canal-u.tv/chaines/ut2j](https://www.canal-u.tv/chaines/ut2j)",
source: "Canal-U",
category: "Culture",
},
];

export async function GET(req: NextRequest) {
// Ici tu pourrais faire un fetch réel vers le flux RSS et parser XML en JSON
return NextResponse.json(MOCK_EVENTS);
}
