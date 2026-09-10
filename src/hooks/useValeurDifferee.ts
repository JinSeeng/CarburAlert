import { useEffect, useState } from 'react';

/**
 * Retourne `valeur`, mais retardée de `delaiMs` après sa dernière
 * modification. Utilisé pour ne pas déclencher une recherche à chaque
 * frappe (US C1).
 */
export function useValeurDifferee<T>(valeur: T, delaiMs: number): T {
  const [valeurDifferee, setValeurDifferee] = useState(valeur);

  useEffect(() => {
    const identifiant = setTimeout(() => setValeurDifferee(valeur), delaiMs);
    return () => clearTimeout(identifiant);
  }, [valeur, delaiMs]);

  return valeurDifferee;
}
