import Card from '@codegouvfr/react-dsfr/Card';
import Badge from '@codegouvfr/react-dsfr/Badge';
import type { ResultatRentabilite } from '../domain/rentabilite';
import type { Station } from '../domain/types';

interface StationCarteProps {
  station: Station;
  estReference?: boolean;
  rentabilite?: ResultatRentabilite;
}

export default function StationCarte({ station, estReference, rentabilite }: StationCarteProps) {
  const localisation = [station.codePostal, station.ville].filter(Boolean).join(' ');

  return (
    <Card
      title={station.adresse}
      titleAs="h3"
      enlargeLink
      linkProps={{ to: `/stations/${station.id}` }}
      size="small"
      desc={localisation || undefined}
      detail={
        station.rupture.length > 0 ? (
          <Badge as="span" severity="warning" small>
            Rupture : {station.rupture.join(', ')}
          </Badge>
        ) : undefined
      }
      end={
        station.prix.length > 0 ? (
          <ul className="fr-tags-group" aria-label="Prix par carburant">
            {station.prix.map((p) => (
              <li key={p.type}>
                <Badge as="span" small noIcon>
                  {p.type} : {p.valeur.toFixed(3)} €
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="fr-text--sm fr-mb-0">Prix non communiqué</p>
        )
      }
      endDetail={
        station.distanceKm !== undefined ? `${station.distanceKm.toFixed(1)} km` : undefined
      }
      footer={
        estReference ? (
          <p className="fr-text--sm fr-mb-0" style={{ color: 'var(--text-mention-grey)' }}>
            Station la plus proche — référence du calcul de rentabilité
          </p>
        ) : rentabilite ? (
          <p className="fr-text--sm fr-mb-0">
            <Badge
              as="span"
              small
              noIcon
              severity={rentabilite.rentable ? 'success' : undefined}
            >
              {rentabilite.rentable ? 'Détour rentable' : 'Détour non rentable'}
            </Badge>{' '}
            {rentabilite.explication}
          </p>
        ) : undefined
      }
    />
  );
}