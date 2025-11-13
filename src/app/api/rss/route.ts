import { getEvents } from '@/lib/events';
import { NextRequest, NextResponse } from 'next/server';
import RSS from 'rss';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (token !== process.env.RSS_SECRET_TOKEN) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const feed = new RSS({
    title: 'FTS Online - Événements',
    description: 'Les derniers événements de FTS Online.',
    site_url: req.nextUrl.origin,
    feed_url: req.url,
    language: 'fr',
    pubDate: new Date(),
  });

  const events = await getEvents();
  const upcomingEvents = events.filter(event => new Date(event.date) >= new Date());

  upcomingEvents.forEach(event => {
    feed.item({
      title: event.name,
      description: event.description,
      url: `${req.nextUrl.origin}/`, // In a real app, this would link to an event detail page
      guid: event.id,
      date: new Date(event.date),
      author: 'FTS Online',
      enclosure: {
        url: event.image,
        type: 'image/jpeg', // Assuming jpeg, adjust if needed
      }
    });
  });

  const xml = feed.xml({ indent: true });

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
