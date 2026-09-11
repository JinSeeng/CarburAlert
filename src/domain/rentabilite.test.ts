import { describe, expect, it } from 'vitest';
import { calculerRentabiliteDetour } from './rentabilite';

describe('calculerRentabiliteDetour', () => {
  it('calcule un seuil de rentabilité atteignable dans le réservoir', () => {
    const resultat = calculerRentabiliteDetour({
      prixStationActuelle: 1.7,
      prixStationDetour: 1.66,
      distanceDetourKm: 8,
      consommationL100km: 6,
      capaciteReservoirLitres: 50,
    });

    // Coût du détour : 8km * 6L/100km = 0.48L * 1.66 = 0.7968 €
    // Économie/L : 0.04 €
    // Seuil : 0.7968 / 0.04 ≈ 19.92 L
    expect(resultat.economieParLitre).toBeCloseTo(0.04, 3);
    expect(resultat.coutDetourEuros).toBeCloseTo(0.797, 2);
    expect(resultat.volumeSeuilLitres).toBeCloseTo(19.92, 1);
    expect(resultat.volumeSeuilAtteignable).toBe(true);
    expect(resultat.rentable).toBe(true);
    expect(resultat.explication).toContain('Rentable');
  });

  it("n'est jamais rentable si le seuil dépasse la contenance du réservoir", () => {
    const resultat = calculerRentabiliteDetour({
      prixStationActuelle: 1.7,
      prixStationDetour: 1.699,
      distanceDetourKm: 20,
      consommationL100km: 8,
      capaciteReservoirLitres: 45,
    });

    expect(resultat.rentable).toBe(false);
    expect(resultat.volumeSeuilAtteignable).toBe(false);
    expect(resultat.volumeSeuilLitres).not.toBeNull();
    expect(resultat.explication).toContain('dépasse la contenance');
  });

  it("n'est jamais rentable si la station du détour n'est pas moins chère", () => {
    const resultat = calculerRentabiliteDetour({
      prixStationActuelle: 1.7,
      prixStationDetour: 1.75,
      distanceDetourKm: 5,
      consommationL100km: 6,
      capaciteReservoirLitres: 50,
    });

    expect(resultat.rentable).toBe(false);
    expect(resultat.volumeSeuilLitres).toBeNull();
    expect(resultat.explication).toContain("n'est pas moins chère");
  });

  it('traite le cas à prix strictement égal comme non rentable', () => {
    const resultat = calculerRentabiliteDetour({
      prixStationActuelle: 1.7,
      prixStationDetour: 1.7,
      distanceDetourKm: 5,
      consommationL100km: 6,
      capaciteReservoirLitres: 50,
    });

    expect(resultat.rentable).toBe(false);
    expect(resultat.volumeSeuilLitres).toBeNull();
  });

  it('est immédiatement rentable sans détour si le prix est meilleur', () => {
    const resultat = calculerRentabiliteDetour({
      prixStationActuelle: 1.7,
      prixStationDetour: 1.68,
      distanceDetourKm: 0,
      consommationL100km: 6,
      capaciteReservoirLitres: 50,
    });

    expect(resultat.rentable).toBe(true);
    expect(resultat.coutDetourEuros).toBe(0);
    expect(resultat.volumeSeuilLitres).toBe(0);
  });

  it("n'est pas rentable sans détour si le prix n'est pas meilleur", () => {
    const resultat = calculerRentabiliteDetour({
      prixStationActuelle: 1.7,
      prixStationDetour: 1.72,
      distanceDetourKm: 0,
      consommationL100km: 6,
      capaciteReservoirLitres: 50,
    });

    expect(resultat.rentable).toBe(false);
  });

  it('ne lève pas d’exception et neutralise des entrées non finies (NaN, négatives)', () => {
    const resultat = calculerRentabiliteDetour({
      prixStationActuelle: Number.NaN,
      prixStationDetour: 1.5,
      distanceDetourKm: -10,
      consommationL100km: -6,
      capaciteReservoirLitres: -50,
    });

    expect(resultat).toBeDefined();
    expect(Number.isFinite(resultat.coutDetourEuros)).toBe(true);
  });

  it('gère une contenance de réservoir nulle comme jamais atteignable', () => {
    const resultat = calculerRentabiliteDetour({
      prixStationActuelle: 1.7,
      prixStationDetour: 1.6,
      distanceDetourKm: 5,
      consommationL100km: 6,
      capaciteReservoirLitres: 0,
    });

    expect(resultat.rentable).toBe(false);
    expect(resultat.volumeSeuilAtteignable).toBe(false);
  });
});
