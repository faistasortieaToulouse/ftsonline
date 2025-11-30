import { NextResponse } from "next/server";

// IMPORTANT : requêtes HEAD/OPTIONS nécessaires pour les players HTML5
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.json(
        { error: "Missing url parameter" },
        { status: 400 }
      );
    }

    // 1️⃣ Correction : certains flux renvoient une URL sans protocole → on la force
    if (targetUrl.startsWith("//")) {
      targetUrl = "https:" + targetUrl;
    }

    // 2️⃣ On transmet l’User-Agent sinon Vodio renvoie une 403
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "*/*",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream error ${res.status}` },
        { status: res.status }
      );
    }

    // 3️⃣ On stream la réponse (pas en Buffer → nécessaire pour de gros fichiers audio)
    return new Response(res.body, {
      status: 200,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "audio/mpeg",
        "Content-Length": res.headers.get("Content-Length") || "",
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: any) {
    console.error("Proxy-audio error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

// Obligatoire pour Safari + HTML5 audio
export async function HEAD(req: Request) {
  return GET(req);
}
