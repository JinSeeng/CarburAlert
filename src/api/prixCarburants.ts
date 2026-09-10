import { normaliserListeStations } from '../domain/normalisation';
import { PREFIXE_COLONNE_CARBURANT } from '../domain/types';
import type { Station, TypeCarburant } from '../domain/types';
import { ErreurApi, estAnnulation } from './erreurs';

const BASE_URL =
  'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records';

export interface RechercheStationsParams {
  latitude: number;
  longitude: number;
  /** Rayon de recherche en mètres. */
  rayonMetres: number;
  carburant?: TypeCarburant;
  limite?: number;
}

export interface ResultatRechercheStations {
  stations: Station[];
  horodatageRequete: string;
}

/**
 * Recherche les stations autour d'un point, avec filtrage optionnel par carburant
 * @param signal AbortSignal optionnel pour l'annulation (US C1).
 */
export async function rechercherStationsAutourDe(
  params: RechercheStationsParams,
  signal?: AbortSignal,
): Promise<ResultatRechercheStations> {
  const url = new URL(BASE_URL);
  url.searchParams.set(
    'geofilter.distance',
    `${params.latitude},${params.longitude},${params.rayonMetres}`,
  );
  url.searchParams.set('limit', String(params.limite ?? 50));
  if (params.carburant) {
    const colonnePrix = `${PREFIXE_COLONNE_CARBURANT[params.carburant]}_prix`;
    url.searchParams.set('where', `${colonnePrix} is not null`);
  }

  let reponse: Response;
  try {
    reponse = await fetch(url.toString(), { signal });
  } catch (erreur) {
    if (estAnnulation(erreur)) throw erreur;
    throw new ErreurApi(
      'Impossible de contacter le service des prix des carburants.',
      { cause: erreur },
    );
  }

  if (!reponse.ok) {
    throw new ErreurApi(
      `Le service des prix des carburants a répondu avec une erreur (HTTP ${reponse.status}).`,
    );
  }

  const donnees: unknown = await reponse.json();
  const enregistrements =
    typeof donnees === 'object' && donnees !== null && Array.isArray((donnees as Record<string, unknown>)['results'])
      ? (donnees as Record<string, unknown>)['results']
      : [];

  return {
    stations: normaliserListeStations(enregistrements),
    horodatageRequete: new Date().toISOString(),
  };
}

/** Récupère une station par son identifiant, pour la fiche de détail */
export async function recupererStationParId(
  id: string,
  signal?: AbortSignal,
): Promise<Station | null> {
  const url = new URL(BASE_URL);
  // Colonne "id" confirmée contre le schéma réel du dataset.
  url.searchParams.set('where', `id="${id}"`);
  url.searchParams.set('limit', '1');

  let reponse: Response;
  try {
    reponse = await fetch(url.toString(), { signal });
  } catch (erreur) {
    if (estAnnulation(erreur)) throw erreur;
    throw new ErreurApi('Impossible de contacter le service des prix des carburants.', {
      cause: erreur,
    });
  }

  if (!reponse.ok) {
    throw new ErreurApi(
      `Le service des prix des carburants a répondu avec une erreur (HTTP ${reponse.status}).`,
    );
  }

  const donnees: unknown = await reponse.json();
  const enregistrements =
    typeof donnees === 'object' && donnees !== null && Array.isArray((donnees as Record<string, unknown>)['results'])
      ? (donnees as Record<string, unknown>)['results']
      : [];

  const stations = normaliserListeStations(enregistrements);
  return stations[0] ?? null;
}
