// src/app/api/events/route.ts
import { NextResponse } from 'next/server';
import { getEvents } from '@/lib/events';

export async function GET() {
  try {
    const events = await getEvents();

    return NextResponse.json(events, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // facultatif pour dev local
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // facultatif pour dev local
        },
      }
    );
  }
}
