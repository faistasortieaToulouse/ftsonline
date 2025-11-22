import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { format, parse, isBefore, setYear } from "date-fns";
import { fr } from "date-fns/locale";

// Interface pour les événements extraits
interface ExtractedEvent {
    id: string;
    title: string;
    dateText: string;
    location: string;
    link: string;
    source: string;
    start: string | null;
    image: string;
}

function parseDateWithYearCorrection(dateStr: string): string | null {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    let cleanedStr = dateStr.toUpperCase().trim();

    cleanedStr = cleanedStr.replace(/AOUT/g, 'AOÛT');
    cleanedStr = cleanedStr.replace(/FEVRIER/g, 'FÉVRIER');
    cleanedStr = cleanedStr.replace(/DECEMBRE/g, 'DÉCEMBRE');

    cleanedStr = cleanedStr.replace(/\s*>\s*\d+\s*/, ' ');
    cleanedStr = cleanedStr.replace(/DU\s+\d+\s+AU\s+\d+\s*/, (match) => {
        const dayMatch = match.match(/DU\s+(\d+)/);
        return dayMatch ? dayMatch[1] + ' ' : '';
    });
    cleanedStr = cleanedStr.replace(/\s*AU\s+\d+\s*/, ' ');

    cleanedStr = cleanedStr.replace(/LES\s+/, '');
    cleanedStr = cleanedStr.replace(/\s*ET\s*\d+\s*/g, ' ');
    cleanedStr = cleanedStr.replace(/\d+\s*,/g, '');

    const finalMatch = cleanedStr.match(/(\d{1,2}(?:ER)?)\s+([A-ZÉÈÊÀÛÔÏÜ]{3,})/);

    let finalDateStr;

    if (!finalMatch) {
        let tempStr = cleanedStr.replace(/^\s*\D+\s*/, '').trim(); 
        const secondMatch = tempStr.match(/(\d{1,2}(?:ER)?)\s+([A-ZÉÈÊÀÛÔÏÜ]{3,})/);
        if (!secondMatch) return null;
        finalDateStr = secondMatch[1] + ' ' + secondMatch[2];
    } else {
        finalDateStr = finalMatch[1] + ' ' + finalMatch[2];
    }
    
    finalDateStr = finalDateStr.replace(/1ER/, '1');

    try {
        let date = parse(finalDateStr, 'd MMMM', today, { locale: fr });
        date = setYear(date, currentYear);

        if (isBefore(date, today)) {
            date = setYear(date, currentYear + 1);
        }

        return format(date, "yyyy-MM-dd'T'00:00:00");

    } catch (e) {
        return null;
    }
}

export async function GET() {
  try {
    const url = "https://www.cultureenmouvements.org/agenda";
    
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) }); 
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const htmlText = await res.text();

    const $ = cheerio.load(htmlText);
    
    const rawEvents: ExtractedEvent[] = [];
    let eventIdCounter = 1;

    const defaultImageUrl = "/logo/logoculturemouvement.jpg";

    $('.wpb_wrapper h5').each((index, element) => {
      const fullText = $(element).text().trim().replace(/\s+/g, ' ');
      const linkElement = $(element).find('a').last();
      const link = linkElement.attr('href') || url;

      let eventImage = defaultImageUrl;
      const parentColumn = $(element).closest('.vc_column_container'); 
      if (parentColumn.length > 0) {
          const imgElement = parentColumn.find('img').first();
          if (imgElement.length > 0) {
              const src = imgElement.attr('src');
              if (src) {
                  eventImage = src;
              }
          }
      }

      const parts = fullText.split('•').map(p => p.trim());
      
      if (parts.length >= 2) {
        const dateText = parts[0].trim();
        const remainingText = parts.slice(1).join('•').trim();
        
        let title = remainingText.split('—')[0].trim();
        let location = remainingText.split('—').pop()?.trim() || "Inconnu";
        title = title.replace(/Cie.*$/, '').trim();
        
        const startDate = parseDateWithYearCorrection(dateText);

        rawEvents.push({
            id: `cem-${eventIdCounter++}`,
            title,
            dateText,
            location,
            link,
            source: "Culture en Mouvements",
            start: startDate,
            image: eventImage,
        });
      }
    });

    // ===========================
    // 🔥 FILTRE Today → Today + 31 jours
    // ===========================
    const now = new Date();
    const limitDate = new Date();
    limitDate.setDate(now.getDate() + 31);

    let events = rawEvents.filter(ev => {
      if (!ev.start) return false;
      const d = new Date(ev.start);
      return d >= now && d <= limitDate;
    });

    // ===========================
    // TRI chronologique
    // ===========================
    events.sort((a, b) => {
      const da = new Date(a.start!);
      const db = new Date(b.start!);
      return da.getTime() - db.getTime();
    });

    return NextResponse.json(events, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: "Scraping failed: " + err.message }, { status: 500 });
  }
}
