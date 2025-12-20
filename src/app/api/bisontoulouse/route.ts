import { NextResponse } from "next/server";
import xml2js from "xml2js";

const BISON_XML_URL = "https://url-du-xml-bisonfute.xml";

export async function GET() {
  const res = await fetch(BISON_XML_URL);
  const xmlText = await res.text();

  const parser = new xml2js.Parser();
  const data = await parser.parseStringPromise(xmlText);

  // Ici tu dois adapter selon la structure XML exacte
  const axes = data?.TrafficData?.Axes?.[0]?.Axe || [];

  // Filtrer pour Toulouse si possible
  const toulouseAxes = axes.filter((a: any) =>
    a.Name?.[0]?.includes("Toulouse")
  );

  return NextResponse.json(toulouseAxes);
}
