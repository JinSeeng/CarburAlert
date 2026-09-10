import { calculerDistanceKm } from './distance';
import type { Coordonnees, CritereTri, Station, TypeCarburant } from './types';

export function annoterEtTrierStations(
  stations: Station[],
  positionRecherche: Coordonnees,
  tri: CritereTri,
  carburant: TypeCarburant | null,
): Station[] {
  const annotees = stations.map((station) => ({
    ...station,
    distanceKm: station.coordonnees
      ? calculerDistanceKm(positionRecherche, station.coordonnees)
      : undefined,
  }));

  const comparateur = tri === 'distance' ? comparerParDistance : comparerParPrix(carburant);
  return annotees.sort(comparateur);
}

function comparerParDistance(a: Station, b: Station): number {
  if (a.distanceKm === undefined && b.distanceKm === undefined) return 0;
  if (a.distanceKm === undefined) return 1; // distance inconnue : en fin de liste
  if (b.distanceKm === undefined) return -1;
  return a.distanceKm - b.distanceKm;
}

function comparerParPrix(carburant: TypeCarburant | null) {
  return (a: Station, b: Station): number => {
    const prixA = prixPertinent(a, carburant);
    const prixB = prixPertinent(b, carburant);
    if (prixA === null && prixB === null) return 0;
    if (prixA === null) return 1; // prix inconnu : en fin de liste
    if (prixB === null) return -1;
    return prixA - prixB;
  };
}

/** Le prix du carburant filtré s'il y en a un, sinon le prix le moins cher proposé. */
function prixPertinent(station: Station, carburant: TypeCarburant | null): number | null {
  if (carburant) {
    const entree = station.prix.find((p) => p.type === carburant);
    return entree ? entree.valeur : null;
  }
  if (station.prix.length === 0) return null;
  return Math.min(...station.prix.map((p) => p.valeur));
}

/** Station de référence pour le calcul de rentabilité : la plus proche du point de recherche */
export function trouverStationReference(stations: Station[]): Station | null {
  let reference: Station | null = null;
  for (const station of stations) {
    if (station.distanceKm === undefined) continue;
    if (reference === null || station.distanceKm < (reference.distanceKm ?? Infinity)) {
      reference = station;
    }
  }
  return reference;
}
