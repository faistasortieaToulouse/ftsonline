import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiUrl =
      "https://datainfolocale.opendatasoft.com/api/records/1.0/search/" +
      "?dataset=agenda_culturel&rows=200&refine.departement=31";

    const res = await fetch(apiUrl);

    if (!res.ok) {
      console.error("API ERROR:", res.statusText);
      return NextResponse.json({ error: "API error" }, { status: 500 });
    }

    const data = await res.json();

    return NextResponse.json(data);
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
