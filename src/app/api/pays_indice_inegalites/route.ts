import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
    const response = await fetch(`${baseUrl}/data/tri_pays_indice_inegalites.json`)

    if (!response.ok) {
      throw new Error('Fichier introuvable')
    }

    const data = await response.json()

    return NextResponse.json(data)

  } catch (error) {
    console.error('Erreur API Inégalités :', error)

    return NextResponse.json(
      { error: 'Impossible de charger les données', data: [] },
      { status: 500 }
    )
  }
}
