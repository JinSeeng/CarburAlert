import { describe, expect, it } from 'vitest';
import { formaterHorodatage } from './dates';

describe('formaterHorodatage', () => {
  it('formate une date ISO valide en texte lisible', () => {
    const resultat = formaterHorodatage('2026-09-08T10:00:00Z');
    expect(resultat).toBe('8 sept. 2026 à 10:00');
  });

  it("n'applique aucune conversion de fuseau horaire (l'heure affichée est celle du dataset, au chiffre près)", () => {
    // Cas précis signalé : une mise à jour à 10:29 dans la donnée source
    // ne doit jamais s'afficher 11:29, quel que soit le fuseau du
    // navigateur exécutant le code.
    expect(formaterHorodatage('2026-09-10T10:29:00Z')).toBe('10 sept. 2026 à 10:29');
    expect(formaterHorodatage('2026-09-10T10:29:00')).toBe('10 sept. 2026 à 10:29');
    expect(formaterHorodatage('2026-09-10T10:29:00+02:00')).toBe('10 sept. 2026 à 10:29');
    expect(formaterHorodatage('2026-09-10 10:29:00')).toBe('10 sept. 2026 à 10:29');
  });

  it('retourne null pour une valeur absente ou vide', () => {
    expect(formaterHorodatage(undefined)).toBeNull();
    expect(formaterHorodatage(null)).toBeNull();
    expect(formaterHorodatage('')).toBeNull();
  });

  it('retourne null pour une date invalide plutôt que de planter', () => {
    expect(formaterHorodatage('pas une date')).toBeNull();
    expect(formaterHorodatage('2026-13-40T99:99:00Z')).toBeNull();
  });
});
