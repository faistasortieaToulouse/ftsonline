// src/app/api/proxy/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0", // certains serveurs bloquent sans UA
        "Accept": "application/rss+xml,application/xml,text/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Upstream error ${res.status}` }, { status: res.status });
    }

    const text = await res.text();
    return new Response(text, {
      status: 200,
      headers: { "Content-Type": "application/rss+xml" },
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
