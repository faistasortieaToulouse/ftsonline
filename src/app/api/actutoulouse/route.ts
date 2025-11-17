import { NextResponse } from "next/server";

export async function GET() {
  try {
    const url =
      "https://datainfolocale.opendatasoft.com/api/records/1.0/search/" +
      "?dataset=agenda_culturel&rows=100&refine.departement=31";

    const res = await fetch(url);
    const data = await res.json();

    return NextResponse.json({ records: data.records || [] });
  } catch (err) {
    console.error("API ERROR:", err);
    return NextResponse.json({ error: "Not Found" }, { status: 500 });
  }
}
