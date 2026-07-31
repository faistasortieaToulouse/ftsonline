import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    url: process.env.WHATSAPP_MEETUP_CINEESPANA ?? "",
  });
}
