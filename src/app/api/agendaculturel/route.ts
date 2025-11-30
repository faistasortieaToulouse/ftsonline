// app/api/agendaculturel/route.ts
import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function detectEncoding(xmlBuffer: Uint8Array): string {
  const ascii = new TextDecoder("ascii").decode(xmlBuffer.slice(0, 200));
  const match = ascii.match(/encoding=["']([^"']+)["']/i);
  return match?.[1]?.toLowerCase() ?? "utf-8";
}

function unescapeHtmlEntities(s: string): string {
  if (!s) return s;
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripCdata(s: string): string {
  if (!s) return s;
  return s.replace(/<!\[CDATA\[(.*?)\]\]>/gis, (_m, g1) => g1);
}

function firstUrlFromSrcset(srcset: string): string | null {
  if (!srcset) return null;
  const parts = srcset.split(",");
  if (!parts.length) return null;
  return parts[0].trim().split(/\s+/)[0] || null;
}

function makeAbsoluteUrl(url: string | null | undefined, base?: string): string | null {
  if (!url) return null;
  try {
    new URL(url);
    return url; // déjà absolu
  } catch {
    if (!base) return url;
    try {
      const baseUrl = new URL(base);
      return new URL(url, baseUrl).toString();
    } catch {
      return url;
    }
  }
}

function extractImageFromItem(item: any, feedUrl: string) {
  const enclosure = item?.enclosure?.url ?? item?.enclosure?.["@_url"] ?? item?.enclosure;
  if (enclosure) return makeAbsoluteUrl(enclosure, item?.link ?? feedUrl);

  const mediaContent = item["media:content"] ?? item.media?.content;
  if (mediaContent) {
    const content = Array.isArray(mediaContent) ? mediaContent[0] : mediaContent;
    const url = content?.url ?? content?.["@_url"];
    if (url) return makeAbsoluteUrl(url, item?.link ?? feedUrl);
  }

  const mediaThumb = item["media:thumbnail"] ?? item.media?.thumbnail;
  if (mediaThumb) {
    const url = mediaThumb?.url ?? mediaThumb?.["@_url"];
    if (url) return makeAbsoluteUrl(url, item?.link ?? feedUrl);
  }

  let desc = item?.description ?? item?.content ?? "";
  if (!desc) return null;

  desc = stripCdata(desc);
  desc = unescapeHtmlEntities(desc);

  const imgMatch = desc.match(
    /<img[^>]+(?:srcset=["']([^"']+)["']|src=["']([^"']+)["']|data-src=["']([^"']+)["']|data-lazy=["']([^"']+)["'])[^>]*>/i
  );
  if (imgMatch) {
    const candidate =
      firstUrlFromSrcset(imgMatch[1]) ??
      imgMatch[2] ??
      imgMatch[3] ??
      imgMatch[4];
    if (candidate) return makeAbsoluteUrl(candidate, item?.link ?? feedUrl);
  }

  const anyUrlImg = desc.match(
    /https?:\/\/[^"'<>]+\.(jpg|jpeg|png|gif|webp|avif)(\?[^"'<>]+)?/i
  );
  if (anyUrlImg) return anyUrlImg[0];

  return null;
}

export async function GET() {
  const feedUrl = "https://31.agendaculturel.fr/rss/concert/toulouse/";

  try {
    const res = await fetch(feedUrl, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://google.com/bot.html)",
        "Accept": "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
        "Referer": "https://ftsonline.netlify.app/",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ items: [], status: res.status }, { status: res.status });
    }

    const arrayBuffer = await res.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const encoding = detectEncoding(uint8);
    const xml = new TextDecoder(encoding).decode(uint8);

    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
    const parsed = parser.parse(xml);

    const items = parsed?.rss?.channel?.item ?? [];
    const arr = Array.isArray(items) ? items : [items];

    const feedItems = arr.map((item: any) => {
      const image = extractImageFromItem(item, feedUrl);
      return {
        title: item.title ?? "",
        link: item.link ?? "",
        pubDate: item.pubDate ?? "",
        description: item.description ?? "",
        image,
      };
    });

    // -------------------------
    // 🎯 Filtre Today ➜ +31 jours + tri chronologique
    // -------------------------
    const now = new Date();
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 31);

    const filteredSorted = feedItems
      .map((item) => {
        const d = new Date(item.pubDate);
        return { ...item, _date: d instanceof Date && !isNaN(d.valueOf()) ? d : null };
      })
      .filter((item) => item._date && item._date >= now && item._date <= maxDate)
      .sort((a, b) => a._date.getTime() - b._date.getTime())
      .map(({ _date, ...rest }) => rest); // on retire _date

    return NextResponse.json({ items: filteredSorted });
  } catch (err: any) {
    console.error("RSS ERROR :", err);
    return NextResponse.json(
      { items: [], error: "Erreur serveur", details: String(err) },
      { status: 500 }
    );
  }
}
