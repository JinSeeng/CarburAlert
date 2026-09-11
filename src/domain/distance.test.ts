import { describe, expect, it } from 'vitest';
import { calculerDistanceKm } from './distance';

describe('calculerDistanceKm', () => {
  it('retourne 0 pour deux points identiques', () => {
    const point = { latitude: 45.764, longitude: 4.8357 };
    expect(calculerDistanceKm(point, point)).toBe(0);
  });

  it('calcule une distance connue (Paris - Lyon ≈ 392 km à vol d’oiseau)', () => {
    const paris = { latitude: 48.8566, longitude: 2.3522 };
    const lyon = { latitude: 45.764, longitude: 4.8357 };

    const distance = calculerDistanceKm(paris, lyon);

    expect(distance).toBeGreaterThan(380);
    expect(distance).toBeLessThan(400);
  });

  it('est symétrique (a→b = b→a)', () => {
    const a = { latitude: 48.8566, longitude: 2.3522 };
    const b = { latitude: 43.2965, longitude: 5.3698 };

    expect(calculerDistanceKm(a, b)).toBe(calculerDistanceKm(b, a));
  });
});
