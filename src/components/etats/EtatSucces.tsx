import type { Station } from '../../domain/types';
import StationCarte from '../StationCarte';

interface EtatSuccesProps {
  stations: Station[];
  positionLibelle: string;
}

export default function EtatSucces({ stations, positionLibelle }: EtatSuccesProps) {
  return (
    <div>
      <h2 className="fr-sr-only">Résultats de la recherche</h2>
      {/* Le nombre de résultats est annoncé avant la liste (US B3). */}
      <p aria-live="polite" className="fr-text--bold">
        {stations.length} station{stations.length > 1 ? 's' : ''} trouvée
        {stations.length > 1 ? 's' : ''} autour de « {positionLibelle} ».
      </p>
      <ul className="fr-grid-row fr-grid-row--gutters" style={{ listStyle: 'none', padding: 0 }}>
        {stations.map((station) => (
          <li key={station.id} className="fr-col-12 fr-col-md-6">
            <StationCarte station={station} />
          </li>
        ))}
      </ul>
    </div>
  );
}
