/**
 * Les 5 états possibles de l'écran de recherche.
 */
export const EtatRecherche = {
  Initial: 'initial',
  Chargement: 'chargement',
  Resultats: 'resultats',
  Vide: 'vide',
  Erreur: 'erreur',
} as const;

export type EtatRecherche = (typeof EtatRecherche)[keyof typeof EtatRecherche];

export interface Station {
  adresse: string;
  prixLitre: number;
}

export type CodeErreur = 'GEOCODAGE' | 'FLUX_PRIX' | 'RESEAU';

export class ErreurRecherche extends Error {
  readonly code: CodeErreur;

  constructor(message: string, code: CodeErreur) {
    super(message);
    this.code = code;
    this.name = 'ErreurRecherche';
  }
}