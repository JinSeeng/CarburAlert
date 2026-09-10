import { calculerRentabiliteDetour, type ResultatRentabilite } from '../../domain/rentabilite';
import { trouverStationReference } from '../../domain/tri';
import type { Station, TypeCarburant } from '../../domain/types';
import StationCarte from '../StationCarte';

interface EtatSuccesProps {
  stations: Station[];
  positionLibelle: string;
  carburant: TypeCarburant | null;
  capaciteReservoirLitres: number;
  consommationL100km: number;
}

export default function EtatSucces({
  stations,
  positionLibelle,
  carburant,
  capaciteReservoirLitres,
  consommationL100km,
}: EtatSuccesProps) {
  const reference = trouverStationReference(stations);

  return (
    <div>
      <h2 className="fr-sr-only">Résultats de la recherche</h2>
      {/* Le nombre de résultats est annoncé avant la liste (US B3). */}
      <p aria-live="polite" className="fr-text--bold">
        {stations.length} station{stations.length > 1 ? 's' : ''} trouvée
        {stations.length > 1 ? 's' : ''} autour de « {positionLibelle} ».
      </p>
      <ul className="fr-grid-row fr-grid-row--gutters" style={{ listStyle: 'none', padding: 0 }}>
        {stations.map((station) => {
          const estReference = reference !== null && station.id === reference.id;
          return (
            <li key={station.id} className="fr-col-12 fr-col-md-6">
              <StationCarte
                station={station}
                estReference={estReference}
                rentabilite={
                  estReference
                    ? undefined
                    : calculerRentabilitePourStation(
                        station,
                        reference,
                        carburant,
                        capaciteReservoirLitres,
                        consommationL100km,
                      )
                }
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function calculerRentabilitePourStation(
  station: Station,
  reference: Station | null,
  carburant: TypeCarburant | null,
  capaciteReservoirLitres: number,
  consommationL100km: number,
): ResultatRentabilite | undefined {
  if (!carburant || !reference) return undefined;
  if (station.distanceKm === undefined || reference.distanceKm === undefined) return undefined;

  const prixStationDetour = station.prix.find((p) => p.type === carburant)?.valeur;
  const prixStationActuelle = reference.prix.find((p) => p.type === carburant)?.valeur;
  if (prixStationDetour === undefined || prixStationActuelle === undefined) return undefined;

  const distanceDetourKm = Math.max(0, 2 * (station.distanceKm - reference.distanceKm));

  return calculerRentabiliteDetour({
    prixStationActuelle,
    prixStationDetour,
    distanceDetourKm,
    consommationL100km,
    capaciteReservoirLitres,
  });
}
