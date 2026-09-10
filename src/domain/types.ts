/** Modèle métier une fois les données API normalisées (normalisation.ts) */
export type TypeCarburant = 'Gazole' | 'SP95' | 'SP98' | 'E10' | 'E85' | 'GPLc';

export const TYPES_CARBURANT: readonly TypeCarburant[] = [
  'Gazole',
  'SP95',
  'SP98',
  'E10',
  'E85',
  'GPLc',
];

export const PREFIXE_COLONNE_CARBURANT: Record<TypeCarburant, string> = {
  Gazole: 'gazole',
  SP95: 'sp95',
  SP98: 'sp98',
  E10: 'e10',
  E85: 'e85',
  GPLc: 'gplc',
};

export interface Coordonnees {
  latitude: number;
  longitude: number;
}

export interface PrixCarburant {
  type: TypeCarburant;
  valeur: number;
  /** Horodatage ISO 8601 de la dernière mise à jour de ce prix. */
  maj: string;
}

export interface CreneauHoraire {
  jour: string;
  ouverture?: string;
  fermeture?: string;
  ferme?: boolean;
}

export interface Station {
  id: string;
  adresse: string;
  ville?: string;
  codePostal?: string;
  /** null si l'API n'a pas fourni de coordonnées exploitables. */
  coordonnees: Coordonnees | null;
  prix: PrixCarburant[];
  /** true si la station est accessible 24h/24 via un automate (paiement carte). */
  automate2424: boolean;
  horaires: CreneauHoraire[];
  /** Carburants en rupture signalée pour cette station. */
  rupture: TypeCarburant[];
  /** Horodatage ISO 8601 du prix le plus récent connu pour cette station, "" si aucun. */
  derniereMiseAJour: string;
  /** Distance en km depuis le point de recherche de l'usager, si disponible. */
  distanceKm?: number;
}

export type CritereTri = 'prix' | 'distance';

/** Pour le calcul de rentabilité. */
export interface ProfilUsager {
  carburant: TypeCarburant;
  capaciteReservoirLitres: number;
  consommationL100km: number;
}