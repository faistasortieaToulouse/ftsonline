import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Construction du chemin absolu vers le fichier JSON
    const filePath = path.join(process.cwd(), 'data', 'histoire', 'entree Etats Unis USA.json');
    
    // Lecture synchrone du fichier
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Parsing du JSON
    const data = JSON.parse(fileContents);

    // Sécurité : on vérifie que la clé "etats_unis" existe bien
    if (!data.etats_unis) {
        return NextResponse.json({ error: "Format de données invalide" }, { status: 400 });
    }

    // On renvoie le tableau des états
    // C'est ce tableau qui contient maintenant les champs 'lat' et 'lng'
    return NextResponse.json(data.etats_unis);

  } catch (error) {
    console.error("Erreur API EtatsUSA:", error);
    return NextResponse.json({ error: "Impossible de charger le fichier JSON" }, { status: 500 });
  }
}
