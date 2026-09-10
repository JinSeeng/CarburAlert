/** Erreur technique levée par la couche API */
export class ErreurApi extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ErreurApi';
  }
}

export function estAnnulation(erreur: unknown): boolean {
  return erreur instanceof DOMException && erreur.name === 'AbortError';
}
