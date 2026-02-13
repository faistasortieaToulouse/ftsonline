import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    // Chemin absolu compatible Vercel
    const filePath = path.join(
      process.cwd(),
      'data',
      'statistiques',
      'tri_pays_indice_inegalites.json'
    )

    // Lecture async (meilleure pratique en serverless)
    const fileContents = await fs.readFile(filePath, 'utf8')
    const data = JSON.parse(fileContents)

    return NextResponse.json(data)

  } catch (error: any) {
    console.error('Erreur API Inégalités :', error)

    // Si le fichier n'existe pas
    if (error.code === 'ENOENT') {
      return NextResponse.json(
        { error: 'Fichier JSON introuvable', data: [] },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur serveur', data: [] },
      { status: 500 }
    )
  }
}
