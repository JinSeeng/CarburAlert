export interface PrixCarburant {
  nom: string
  prix: number | null
  maj?: string
}

export interface HoraireJour {
  nom: string
  ferme: boolean
}

export interface Station {
  id: string
  adresse: string
  ville: string
  codePostal: string
  ouvert24h: boolean
  prix: PrixCarburant[]
  carburantsIndisponibles: string[]
  horaires: HoraireJour[]
}
