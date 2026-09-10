import type { Coordonnees } from './types';

const RAYON_TERRE_KM = 6371;

/* Formule pour calculer la distance en kilomètres entre deux points (formule de Haversine) */
export function calculerDistanceKm(a: Coordonnees, b: Coordonnees): number {
  const deltaLatitude = versRadians(b.latitude - a.latitude);
  const deltaLongitude = versRadians(b.longitude - a.longitude);

  const sinusLatitude = Math.sin(deltaLatitude / 2);
  const sinusLongitude = Math.sin(deltaLongitude / 2);

  const h =
    sinusLatitude * sinusLatitude +
    Math.cos(versRadians(a.latitude)) *
      Math.cos(versRadians(b.latitude)) *
      sinusLongitude *
      sinusLongitude;

  const distance = 2 * RAYON_TERRE_KM * Math.asin(Math.min(1, Math.sqrt(h)));
  return Math.round(distance * 100) / 100;
}

function versRadians(degres: number): number {
  return (degres * Math.PI) / 180;
}
