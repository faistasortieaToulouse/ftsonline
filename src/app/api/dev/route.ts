import { NextResponse } from 'next/server';

export async function GET() {
  const links = {
    discord: process.env.API_DEV_TOLOSA,
    whatsapp: process.env.API_WA_DEV,
  };

  return NextResponse.json(links);
}
