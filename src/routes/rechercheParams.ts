import { TYPES_CARBURANT, type CritereTri, type TypeCarburant } from '../domain/types';

export type { CritereTri };

export interface ParametresRecherche {
  adresse: string;
  carburant: TypeCarburant | null;
  rayonKm: number;
  tri: CritereTri;
  /** Contenance du réservoir, en litres — nécessaire au calcul de rentabilité. */
  capaciteReservoirLitres: number;
  /** Consommation du véhicule, en L/100km — nécessaire au calcul de rentabilité. */
  consommationL100km: number;
}

export const RAYON_KM_DEFAUT = 10;
export const TRI_DEFAUT: CritereTri = 'prix';
export const CAPACITE_RESERVOIR_DEFAUT_L = 50;
export const CONSOMMATION_DEFAUT_L_100KM = 6;

export function lireParametresRecherche(searchParams: URLSearchParams): ParametresRecherche {
  const adresse = searchParams.get('adresse')?.trim() ?? '';

  const carburantBrut = searchParams.get('carburant');
  const carburant = estTypeCarburantValide(carburantBrut) ? carburantBrut : null;

  const rayonBrut = Number(searchParams.get('rayon'));
  const rayonKm = Number.isFinite(rayonBrut) && rayonBrut > 0 ? rayonBrut : RAYON_KM_DEFAUT;

  const triBrut = searchParams.get('tri');
  const tri: CritereTri = triBrut === 'distance' ? 'distance' : TRI_DEFAUT;

  const capaciteBrute = Number(searchParams.get('reservoir'));
  const capaciteReservoirLitres =
    Number.isFinite(capaciteBrute) && capaciteBrute > 0
      ? capaciteBrute
      : CAPACITE_RESERVOIR_DEFAUT_L;

  const consommationBrute = Number(searchParams.get('conso'));
  const consommationL100km =
    Number.isFinite(consommationBrute) && consommationBrute > 0
      ? consommationBrute
      : CONSOMMATION_DEFAUT_L_100KM;

  return { adresse, carburant, rayonKm, tri, capaciteReservoirLitres, consommationL100km };
}

export function ecrireParametresRecherche(
  params: Partial<ParametresRecherche>,
): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (params.adresse) searchParams.set('adresse', params.adresse);
  if (params.carburant) searchParams.set('carburant', params.carburant);
  if (params.rayonKm && params.rayonKm !== RAYON_KM_DEFAUT) {
    searchParams.set('rayon', String(params.rayonKm));
  }
  if (params.tri && params.tri !== TRI_DEFAUT) searchParams.set('tri', params.tri);
  if (params.capaciteReservoirLitres && params.capaciteReservoirLitres !== CAPACITE_RESERVOIR_DEFAUT_L) {
    searchParams.set('reservoir', String(params.capaciteReservoirLitres));
  }
  if (params.consommationL100km && params.consommationL100km !== CONSOMMATION_DEFAUT_L_100KM) {
    searchParams.set('conso', String(params.consommationL100km));
  }
  return searchParams;
}

function estTypeCarburantValide(valeur: string | null): valeur is TypeCarburant {
  return valeur !== null && (TYPES_CARBURANT as readonly string[]).includes(valeur);
}
