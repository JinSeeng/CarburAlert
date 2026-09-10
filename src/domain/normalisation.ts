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
  const horaires = normaliserHoraires(s['horaires']);

  return {
    id: normaliserId(s['id']),
    adresse: normaliserChaine(s['adresse'], ADRESSE_INCONNUE),
    ville: normaliserChaineOptionnelle(s['ville']),
    codePostal: normaliserChaineOptionnelle(s['cp'] ?? s['code_postal']),
    coordonnees: normaliserCoordonnees(s['latitude'], s['longitude']),
    prix,
    automate2424: horaires.automate2424,
    horaires: horaires.creneaux,
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

interface HorairesNormalises {
  /** Station accessible 24h/24 via un automate (paiement carte), quel que soit le détail par jour. */
  automate2424: boolean;
  creneaux: CreneauHoraire[];
}

const HORAIRES_VIDES: HorairesNormalises = { automate2424: false, creneaux: [] };

/**
 * Le champ "horaires" brut est une chaîne JSON (héritée d'une conversion
 * XML), de la forme :
 *   {"@automate-24-24": "", "jour": [{"@id":"1","@nom":"Lundi","@ferme":""}, ...]}
 *
 * ATTENTION : l'attribut "@ferme" ne reflète PAS de façon fiable une
 * fermeture réelle. Deux exemples réels du dataset portent "@ferme":"1"
 * sur les 7 jours alors qu'aucune des deux stations n'est fermée (l'une
 * en automate 24/24, l'autre ouverte en continu 01.00-01.00 chaque jour,
 * confirmé par le champ calculé "horaires_jour" renvoyé par l'API). On
 * n'utilise donc jamais "@ferme" pour décider si un jour est fermé.
 *
 * À la place, un jour est considéré fermé uniquement quand aucun créneau
 * "horaire" n'est fourni pour ce jour ET que la station n'est pas en
 * automate 24/24 (ce second cas, prioritaire, est traité séparément via
 * `automate2424`).
 */
function normaliserHoraires(brute: unknown): HorairesNormalises {
  if (typeof brute !== 'string' || brute.trim() === '') return HORAIRES_VIDES;

  let parsed: unknown;
  try {
    parsed = JSON.parse(brute);
  } catch {
    return HORAIRES_VIDES;
  }

  if (!isObjet(parsed)) return HORAIRES_VIDES;

  const automate2424 = parsed['@automate-24-24'] === '1';

  const jours = parsed['jour'];
  if (!Array.isArray(jours)) return { automate2424, creneaux: [] };

  const creneaux: CreneauHoraire[] = [];
  for (const entree of jours) {
    if (!isObjet(entree)) continue;
    const jour = normaliserChaineOptionnelle(entree['@nom']);
    if (!jour) continue;

    const { ouverture, fermeture } = normaliserCreneauJour(entree['horaire']);

    creneaux.push({
      jour,
      ouverture,
      fermeture,
      ferme: !automate2424 && ouverture === undefined && fermeture === undefined,
    });
  }
  return { automate2424, creneaux };
}

/**
 * Le sous-champ "horaire" est imbriqué sous chaque jour et porte les clés
 * "@ouverture"/"@fermeture" (confirmé par un exemple réel du dataset, ex.
 * {"@ouverture": "01.00", "@fermeture": "01.00"}) — ce n'est pas
 * "@ouverture"/"@fermeture" directement sur l'objet du jour, contrairement
 * à ce qui était supposé initialement. L'API peut aussi le retourner comme
 * un tableau d'objets pour les jours à plusieurs créneaux (coupure
 * méridienne) : dans ce cas on ne garde que le premier créneau, faute de
 * structure de données adaptée pour en afficher plusieurs.
 */
function normaliserCreneauJour(brute: unknown): { ouverture?: string; fermeture?: string } {
  const horaire = Array.isArray(brute) ? brute[0] : brute;
  if (!isObjet(horaire)) return {};
  return {
    ouverture: normaliserChaineOptionnelle(horaire['@ouverture']),
    fermeture: normaliserChaineOptionnelle(horaire['@fermeture']),
  };
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