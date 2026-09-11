import {
  PREFIXE_COLONNE_CARBURANT,
  TYPES_CARBURANT,
  type CreneauHoraire,
  type PrixCarburant,
  type Station,
  type TypeCarburant,
} from './types';

export const ADRESSE_INCONNUE = 'Adresse non communiquée';

export function normaliserStation(brute: unknown): Station {
  const s = isObjet(brute) ? brute : {};
  const prix = normaliserPrix(s);

  return {
    id: normaliserId(s['id']),
    adresse: normaliserChaine(s['adresse'], ADRESSE_INCONNUE),
    ville: normaliserChaineOptionnelle(s['ville']),
    codePostal: normaliserChaineOptionnelle(s['cp'] ?? s['code_postal']),
    coordonnees: normaliserCoordonnees(s),
    prix,
    automate2424: false,
    horaires: normaliserHoraires(s['horaires']),
    rupture: normaliserRupture(s),
    derniereMiseAJour: derniereMiseAJour(prix),
  };
}

export function normaliserListeStations(brute: unknown): Station[] {
  if (!Array.isArray(brute)) {
    return [];
  }
  return brute.map(normaliserStation);
}

// --- Helpers internes -------------------------------------------------

function isObjet(valeur: unknown): valeur is Record<string, unknown> {
  return typeof valeur === 'object' && valeur !== null && !Array.isArray(valeur);
}

function normaliserId(valeur: unknown): string {
  if (typeof valeur === 'string' && valeur.trim() !== '') return valeur;
  if (typeof valeur === 'number' && Number.isFinite(valeur)) return String(valeur);
  return 'inconnu';
}

function normaliserChaine(valeur: unknown, valeurParDefaut: string): string {
  if (typeof valeur === 'string' && valeur.trim() !== '') return valeur;
  return valeurParDefaut;
}

function normaliserChaineOptionnelle(valeur: unknown): string | undefined {
  if (typeof valeur === 'string' && valeur.trim() !== '') return valeur;
  return undefined;
}

function normaliserNombre(valeur: unknown): number | null {
  if (typeof valeur === 'number' && Number.isFinite(valeur)) return valeur;
  if (typeof valeur === 'string' && valeur.trim() !== '') {
    const parsed = Number(valeur.replace(',', '.'));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

/**
 * Les coordonnées de ce dataset sont exprimées en PTV_GEODECIMAL, une
 * variante de WGS84 où les degrés sont multipliés par 100 000 (ex. une
 * latitude "4576400" représente 45.764°). Confirmé par la documentation
 * officielle : https://www.prix-carburants.gouv.fr/rubrique/opendata/
 * — "il faut diviser les coordonnées fournies par 100000". Sans cette
 * conversion, les calculs de distance produisent des résultats absurdes
 * (des milliers de km d'écart entre deux points de la même ville).
 */
const DIVISEUR_PTV_GEODECIMAL = 100_000;

function normaliserCoordonnees(
  s: Record<string, unknown>,
): { latitude: number; longitude: number } | null {
  const depuisGeom = normaliserCoordonneesDepuisGeom(s['geom']);
  if (depuisGeom) return depuisGeom;

  return normaliserCoordonneesDepuisColonnesEchelonnees(s['latitude'], s['longitude']);
}

function normaliserCoordonneesDepuisGeom(
  geomBrut: unknown,
): { latitude: number; longitude: number } | null {
  if (!isObjet(geomBrut)) return null;
  const latitude = normaliserNombre(geomBrut['lat']);
  const longitude = normaliserNombre(geomBrut['lon']);
  if (latitude === null || longitude === null) return null;
  return { latitude, longitude };
}

function normaliserCoordonneesDepuisColonnesEchelonnees(
  latitudeBrute: unknown,
  longitudeBrute: unknown,
): { latitude: number; longitude: number } | null {
  const latitudeGeodecimal = normaliserNombre(latitudeBrute);
  const longitudeGeodecimal = normaliserNombre(longitudeBrute);
  if (latitudeGeodecimal === null || longitudeGeodecimal === null) return null;

  const latitude = latitudeGeodecimal / DIVISEUR_PTV_GEODECIMAL;
  const longitude = longitudeGeodecimal / DIVISEUR_PTV_GEODECIMAL;

  // Garde-fou : si les valeurs sont déjà dans une plage plausible de
  // degrés WGS84, elles ne viennent probablement pas de ce système
  // d'encodage (ex. données de test, ou évolution future de l'API) —
  // dans ce cas, ne pas les diviser une seconde fois.
  if (Math.abs(latitudeGeodecimal) <= 90 && Math.abs(longitudeGeodecimal) <= 180) {
    return { latitude: latitudeGeodecimal, longitude: longitudeGeodecimal };
  }

  return { latitude, longitude };
}

/**
 * Lit gazole_prix, sp95_prix, sp98_prix, e10_prix, e85_prix, gplc_prix (et
 * leurs *_maj associés) : une station n'a une entrée dans le tableau
 * retourné que pour les carburants qu'elle propose réellement.
 */
function normaliserPrix(s: Record<string, unknown>): PrixCarburant[] {
  const resultat: PrixCarburant[] = [];
  for (const type of TYPES_CARBURANT) {
    const prefixe = PREFIXE_COLONNE_CARBURANT[type];
    const valeur = normaliserNombre(s[`${prefixe}_prix`]);
    if (valeur === null) continue; // carburant non proposé par cette station
    const maj = normaliserChaineOptionnelle(s[`${prefixe}_maj`]);
    resultat.push({ type, valeur, maj: maj ?? '' });
  }
  return resultat;
}

/**
 * Une rupture est signalée par la présence d'un `<préfixe>_rupture_type`
 * non vide pour le carburant concerné.
 */
function normaliserRupture(s: Record<string, unknown>): TypeCarburant[] {
  const resultat: TypeCarburant[] = [];
  for (const type of TYPES_CARBURANT) {
    const prefixe = PREFIXE_COLONNE_CARBURANT[type];
    const ruptureType = s[`${prefixe}_rupture_type`];
    if (typeof ruptureType === 'string' && ruptureType.trim() !== '') {
      resultat.push(type);
    }
  }
  return resultat;
}

function normaliserHoraires(brute: unknown): CreneauHoraire[] {
  if (typeof brute !== 'string' || brute.trim() === '') return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(brute);
  } catch {
    return [];
  }

  if (!isObjet(parsed)) return [];
  const jours = parsed['jour'];
  if (!Array.isArray(jours)) return [];

  const resultat: CreneauHoraire[] = [];
  for (const entree of jours) {
    if (!isObjet(entree)) continue;
    const jour = normaliserChaineOptionnelle(entree['@nom']);
    if (!jour) continue;

    const detailHoraire = isObjet(entree['horaire']) ? entree['horaire'] : null;

    resultat.push({
      jour,
      ouverture: formaterHeure(detailHoraire?.['@ouverture']),
      fermeture: formaterHeure(detailHoraire?.['@fermeture']),
      ferme: typeof entree['@ferme'] === 'string' && entree['@ferme'] !== '',
    });
  }
  return resultat;
}

/** Le dataset encode l'heure "HH.MM" (point) ; on l'affiche "HH:MM" (deux-points). */
function formaterHeure(valeur: unknown): string | undefined {
  const chaine = normaliserChaineOptionnelle(valeur);
  if (!chaine) return undefined;
  return chaine.replace('.', ':');
}

function derniereMiseAJour(prix: PrixCarburant[]): string {
  const dates = prix
    .map((p) => p.maj)
    .filter((maj): maj is string => maj !== '' && !Number.isNaN(Date.parse(maj)));

  if (dates.length === 0) return '';

  return dates.reduce((plusRecente, courante) =>
    Date.parse(courante) > Date.parse(plusRecente) ? courante : plusRecente,
  );
}