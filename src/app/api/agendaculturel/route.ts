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
  // remove <![CDATA[ ... ]]>
  return s.replace(/<!\[CDATA\[(.*?)\]\]>/gis, (_m, g1) => g1);
}

function firstUrlFromSrcset(srcset: string): string | null {
  if (!srcset) return null;
  // srcset: "https://... 1x, https://... 2x" or "url1 300w, url2 600w"
  const parts = srcset.split(",");
  if (!parts.length) return null;
  const first = parts[0].trim().split(/\s+/)[0];
  return first || null;
}

function makeAbsoluteUrl(url: string | null | undefined, base?: string): string | null {
  if (!url) return null;
  try {
    // if already absolute
    new URL(url);
    return url;
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
  // 1) enclosure (standard RSS)
  const enclosure = item?.enclosure?.url ?? item?.enclosure?.['@_url'] ?? item?.enclosure;
  if (enclosure) return makeAbsoluteUrl(enclosure, item?.link ?? feedUrl);

  // 2) media:content / media:thumbnail (different shapes)
  const mediaContent = item?.['media:content'] ?? item?.media?.content;
  if (mediaContent) {
    // media:content can be array or object
    if (Array.isArray(mediaContent)) {
      const url = mediaContent[0]?.url ?? mediaContent[0]?.['@_url'];
      if (url) return makeAbsoluteUrl(url, item?.link ?? feedUrl);
    } else {
      const url = mediaContent?.url ?? mediaContent?.['@_url'];
      if (url) return makeAbsoluteUrl(url, item?.link ?? feedUrl);
    }
  }

  const mediaThumb = item?.['media:thumbnail'] ?? item?.media?.thumbnail;
  if (mediaThumb) {
    const url = mediaThumb?.url ?? mediaThumb?.['@_url'];
    if (url) return makeAbsoluteUrl(url, item?.link ?? feedUrl);
  }

  // 3) try to extract from description
  let desc = item?.description ?? item?.content ?? "";
  if (!desc) return null;

  // Remove CDATA wrappers and unescape HTML entities
  desc = stripCdata(desc);
  desc = unescapeHtmlEntities(desc);

  // Optional debug (uncomment to log a preview during troubleshooting)
  // console.log('DESC PREVIEW:', desc.slice(0, 500));

  // Look for img tags: src, data-src, data-lazy, srcset
  //  - srcset -> choose first URL
  //  - also support image URLs inside inline styles: background-image:url(...)
  const imgSrcMatch = desc.match(/<img[^>]+(?:srcset=["']([^"']+)["']|src=["']([^"']+)["']|data-src=["']([^"']+)["']|data-lazy=["']([^"']+)["'])[^>]*>/i);
  if (imgSrcMatch) {
    // groups: [full, srcset, src, data-src, data-lazy]
    const srcset = imgSrcMatch[1];
    const src = imgSrcMatch[2];
    const dataSrc = imgSrcMatch[3];
    const dataLazy = imgSrcMatch[4];

    const candidate = firstUrlFromSrcset(srcset) ?? src ?? dataSrc ?? dataLazy;
    if (candidate) return makeAbsoluteUrl(candidate, item?.link ?? feedUrl);
  }

  // 4) look for any URL that looks like an image inside the description (fallback)
  const anyUrlImg = desc.match(/https?:\/\/[^"'<>]+\.(?:jpg|jpeg|png|gif|webp|avif)(?:\?[^"'<>]+)?/i);
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

    return NextResponse.json({ items: feedItems });
  } catch (err: any) {
    console.error("RSS ERROR :", err);
    return NextResponse.json(
      { items: [], error: "Erreur serveur", details: String(err) },
      { status: 500 }
    );
  }
}
