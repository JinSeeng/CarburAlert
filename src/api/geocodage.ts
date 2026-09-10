import type { Coordonnees } from '../domain/types';
import { ErreurApi, estAnnulation } from './erreurs';

const BASE_URL = 'https://data.geopf.fr/geocodage/search';

/** L'API répond 400 (Bad Request) pour des requêtes trop courtes */
const LONGUEUR_MINIMALE_REQUETE = 3;

export interface PositionGeocodee {
  coordonnees: Coordonnees;
  libelle: string;
}

/**
 * Géocode une adresse saisie en coordonnées utilisables 
 * @param signal AbortSignal optionnel pour l'annulation (US C1 : frappe rapide).
 */
export async function geocoderAdresse(
  adresse: string,
  signal?: AbortSignal,
): Promise<PositionGeocodee | null> {
  const adresseNettoyee = adresse.trim();
  if (adresseNettoyee === '' || adresseNettoyee.length < LONGUEUR_MINIMALE_REQUETE) {
    return null;
  }

  const url = new URL(BASE_URL);
  url.searchParams.set('q', adresseNettoyee);
  url.searchParams.set('limit', '1');

  let reponse: Response;
  try {
    reponse = await fetch(url.toString(), { signal });
  } catch (erreur) {
    if (estAnnulation(erreur)) throw erreur;
    throw new ErreurApi('Impossible de contacter le service de géocodage.', {
      cause: erreur,
    });
  }

  if (!reponse.ok) {
    throw new ErreurApi(
      `Le service de géocodage a répondu avec une erreur (HTTP ${reponse.status}).`,
    );
  }

  const donnees: unknown = await reponse.json();
  const premiereFeature = extraireFeature(donnees);
  if (!premiereFeature) {
    return null;
  }

  const coordonnees = extraireCoordonnees(premiereFeature);
  if (!coordonnees) {
    return null;
  }

  return {
    coordonnees,
    libelle: extraireLibelle(premiereFeature) ?? adresseNettoyee,
  };
}

function extraireFeature(donnees: unknown): Record<string, unknown> | null {
  if (typeof donnees !== 'object' || donnees === null) return null;
  const features = (donnees as Record<string, unknown>)['features'];
  if (!Array.isArray(features) || features.length === 0) return null;
  const premiere = features[0];
  return typeof premiere === 'object' && premiere !== null
    ? (premiere as Record<string, unknown>)
    : null;
}

function extraireCoordonnees(feature: Record<string, unknown>): Coordonnees | null {
  const geometry = feature['geometry'];
  if (typeof geometry !== 'object' || geometry === null) return null;
  const coordinates = (geometry as Record<string, unknown>)['coordinates'];
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;
  const [longitude, latitude] = coordinates;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;
  return { latitude, longitude };
}

function extraireLibelle(feature: Record<string, unknown>): string | undefined {
  const properties = feature['properties'];
  if (typeof properties !== 'object' || properties === null) return undefined;
  const label = (properties as Record<string, unknown>)['label'];
  return typeof label === 'string' ? label : undefined;
}
