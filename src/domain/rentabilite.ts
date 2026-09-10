/** Calcul de rentabilité d'un détour vers une station moins chère */

export interface ParametresRentabilite {
  /** Prix au litre à la station de référence (sans détour), en euros. */
  prixStationActuelle: number;
  /** Prix au litre à la station qui nécessite un détour, en euros. */
  prixStationDetour: number;
  /** Distance aller-retour supplémentaire occasionnée par le détour, en km. */
  distanceDetourKm: number;
  /** Consommation du véhicule, en L/100km. */
  consommationL100km: number;
  /** Contenance du réservoir, en litres. */
  capaciteReservoirLitres: number;
}

export interface ResultatRentabilite {
  rentable: boolean;
  /** Coût en carburant du détour lui-même, en euros. */
  coutDetourEuros: number;
  /** Économie par litre acheté à la station du détour, en euros (peut être négative ou nulle). */
  economieParLitre: number;
  /** Volume à partir duquel le détour devient rentable, ou null si jamais rentable. */
  volumeSeuilLitres: number | null;
  /** Le seuil est-il atteignable compte tenu de la contenance du réservoir. */
  volumeSeuilAtteignable: boolean;
  /** Explication en langage clair, destinée à être affichée à l'usager. */
  explication: string;
}

export function calculerRentabiliteDetour(
  params: ParametresRentabilite,
): ResultatRentabilite {
  const distanceDetourKm = Math.max(0, sanitizeNombre(params.distanceDetourKm));
  const consommationL100km = Math.max(0, sanitizeNombre(params.consommationL100km));
  const capaciteReservoirLitres = Math.max(0, sanitizeNombre(params.capaciteReservoirLitres));
  const prixStationActuelle = sanitizeNombre(params.prixStationActuelle);
  const prixStationDetour = sanitizeNombre(params.prixStationDetour);

  const economieParLitre = arrondi(prixStationActuelle - prixStationDetour);
  const litresConsommesDetour = (distanceDetourKm * consommationL100km) / 100;
  const coutDetourEuros = arrondi(litresConsommesDetour * prixStationDetour);

  // Pas de détour : rien à rentabiliser, mais le prix reste comparable.
  if (distanceDetourKm === 0) {
    return {
      rentable: economieParLitre > 0,
      coutDetourEuros: 0,
      economieParLitre,
      volumeSeuilLitres: 0,
      volumeSeuilAtteignable: true,
      explication:
        economieParLitre > 0
          ? `Aucun détour nécessaire : cette station est moins chère, rentable dès le premier litre.`
          : `Aucun détour nécessaire, mais cette station n'est pas moins chère.`,
    };
  }

  if (economieParLitre <= 0) {
    return {
      rentable: false,
      coutDetourEuros,
      economieParLitre,
      volumeSeuilLitres: null,
      volumeSeuilAtteignable: false,
      explication: `Cette station n'est pas moins chère (ou à prix égal) une fois le détour pris en compte : ce n'est jamais rentable.`,
    };
  }

  const volumeSeuilLitres = arrondi(coutDetourEuros / economieParLitre);
  const volumeSeuilAtteignable =
    capaciteReservoirLitres > 0 && volumeSeuilLitres <= capaciteReservoirLitres;

  const explication = volumeSeuilAtteignable
    ? `À partir de ${volumeSeuilLitres} L, l'économie de ${economieParLitre.toFixed(3)} €/L compense le coût du détour (${coutDetourEuros.toFixed(2)} €). Rentable avec un plein de ${capaciteReservoirLitres} L.`
    : `Il faudrait acheter ${volumeSeuilLitres} L pour rentabiliser ce détour de ${distanceDetourKm} km, ce qui dépasse la contenance du réservoir (${capaciteReservoirLitres} L).`;

  return {
    rentable: volumeSeuilAtteignable,
    coutDetourEuros,
    economieParLitre,
    volumeSeuilLitres,
    volumeSeuilAtteignable,
    explication,
  };
}

function sanitizeNombre(valeur: number): number {
  return Number.isFinite(valeur) ? valeur : 0;
}

function arrondi(valeur: number): number {
  return Math.round(valeur * 1000) / 1000;
}
