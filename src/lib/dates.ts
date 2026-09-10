const MOIS_ABREGES = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];

const REGEX_HORODATAGE = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/;

/**
 * Formate un horodatage ISO 8601 en texte lisible (ex. "10 sept. 2026 à
 * 10:29"). Retourne null si la date est absente ou mal formée, plutôt que
 * d'afficher une chaîne cassée — l'appelant décide alors du texte de
 * repli ("inconnue", etc.).
 *
 * Volontairement PAS de passage par `new Date(...)` + `Intl.DateTimeFormat` :
 * ces API appliquent une conversion de fuseau horaire (UTC -> fuseau du
 * navigateur), ce qui décale l'heure affichée par rapport à celle du
 * dataset source (constaté : +1h). On extrait donc les chiffres
 * directement de la chaîne et on les affiche tels quels, en "heure
 * murale" — c'est ce que montre le dataset, sans réinterprétation.
 */
export function formaterHorodatage(iso: string | undefined | null): string | null {
  if (!iso) return null;

  const correspondance = REGEX_HORODATAGE.exec(iso.trim());
  if (!correspondance) return null;

  const [, annee, moisBrut, jourBrut, heure, minute] = correspondance;
  const mois = MOIS_ABREGES[Number(moisBrut) - 1];
  if (!mois) return null;

  return `${Number(jourBrut)} ${mois} ${annee} à ${heure}:${minute}`;
}
