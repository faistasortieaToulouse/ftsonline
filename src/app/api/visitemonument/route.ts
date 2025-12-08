// src/app/api/visitemonument/route.ts
import { NextResponse } from "next/server";

const data = [
  { nom: 'Bordeblanche', numero: 0, voie: 'quartier', rue: 'Bordeblanche', type: 'borde', note: 'verif' },
  { nom: 'Bordelongue', numero: 0, voie: 'quartier', rue: 'Bordelongue', type: 'borde', note: 'verif' },
  { nom: 'Borderouge', numero: 0, voie: 'quartier', rue: 'Borderouge', type: 'borde', note: '' },
  { nom: 'caserne Compans et Cafarelli', numero: '', voie: 'esp', rue: 'Compans', type: 'caserne', note: '' },
  { nom: 'caserne Dupuy', numero: 32, voie: 'rue', rue: 'Dalbade', type: 'caserne', note: '' },
  { nom: 'caserne de la Mission', numero: 17, voie: 'place', rue: 'Daurade', type: 'caserne', note: '' },
  { nom: 'caserne Saint-Charles', numero: 8, voie: 'rue', rue: 'Merly', type: 'caserne', note: '' },
  { nom: 'palais Niel', numero: '', voie: 'rue', rue: 'Montoulieu St-Jqes', type: 'caserne', note: '' },
  { nom: 'caserne Pérignon', numero: 2, voie: 'rue', rue: 'Pérignon', type: 'caserne', note: '' },
  { nom: 'monument aux morts', numero: 2, voie: 'rue', rue: 'Pérignon', type: 'caserne', note: 'Pérignon' },
  { nom: 'caserne Lignières', numero: 24, voie: 'rue', rue: 'Riquet', type: 'caserne', note: '' },
  { nom: 'caserne Niel', numero: 81, voie: 'rue', rue: 'Saint-Roch', type: 'caserne', note: '' },
  { nom: 'caserne Robert', numero: 1, voie: 'rue', rue: 'Salenques', type: 'caserne', note: '' },
  { nom: 'ancienne caserne Carmélites', numero: 56, voie: 'rue', rue: 'Taur', type: 'caserne', note: '' },
  { nom: 'Croix-Daurade', numero: 147, voie: 'rte', rue: 'Albi', type: 'château', note: 'mairie' },
  { nom: 'Ozenne', numero: 147, voie: 'rte', rue: 'Albi', type: 'château', note: 'mairie' }
];

export function GET() {
  return NextResponse.json(data);
}
