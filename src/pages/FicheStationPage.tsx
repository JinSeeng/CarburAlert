import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { recupererStationParId } from '../api/prixCarburants';
import { estAnnulation } from '../api/erreurs';
import { formaterHorodatage } from '../lib/dates';
import type { Station } from '../domain/types';
import NotFoundPage from './NotFoundPage'; 

type EtatFiche =
  | { statut: 'chargement' }
  | { statut: 'succes'; station: Station }
  | { statut: 'introuvable' }
  | { statut: 'erreur'; message: string };

export default function FicheStationPage() {
  const { id } = useParams<{ id: string }>();
  const [etat, setEtat] = useState<EtatFiche>({ statut: 'chargement' });

  useEffect(() => {
    if (!id) {
      setEtat({ statut: 'introuvable' });
      return;
    }

    const controleur = new AbortController();
    setEtat({ statut: 'chargement' });

    recupererStationParId(id, controleur.signal)
      .then((station) => {
        if (controleur.signal.aborted) return;
        setEtat(station ? { statut: 'succes', station } : { statut: 'introuvable' });
      })
      .catch((erreur) => {
        if (controleur.signal.aborted || estAnnulation(erreur)) return;
        setEtat({
          statut: 'erreur',
          message: erreur instanceof Error ? erreur.message : 'Une erreur est survenue.',
        });
      });

    return () => controleur.abort();
  }, [id]);

  useEffect(() => {
    document.title =
      etat.statut === 'succes'
        ? `${etat.station.adresse} — Carbur'Alert`
        : "Fiche station — Carbur'Alert";
  }, [etat]);

  if (etat.statut === 'introuvable') {
    return <NotFoundPage />;
  }

  if (etat.statut === 'chargement') {
    return (
      <>
        <p aria-live="polite">Chargement de la fiche station…</p>
      </>
    );
  }

  if (etat.statut === 'erreur') {
    return (
      <>
        <p role="alert">{etat.message}</p>
      </>
    );
  }

  const { station } = etat;

  return (
    <>
      <h1>{station.adresse}</h1>
      {(station.ville || station.codePostal) && (
        <p>
          {station.codePostal} {station.ville}
        </p>
      )}

      <h2>Prix</h2>
      <ul className="fr-raw-list fr-mb-4w">
        {station.prix.map((p) => {
          const horodatage = formaterHorodatage(p.maj);
          return (
            <li key={p.type} className="fr-mb-1w">
              <span className="fr-text--bold">{p.type}</span> : {p.valeur.toFixed(3)} €{' '}
              <span
                className="fr-text--sm"
                style={{ color: 'var(--text-mention-grey)' }}
              >
                (Mis à jour le {horodatage ?? 'inconnue'})
              </span>
            </li>
          );
        })}
      </ul>

      <h2>Horaires</h2>
      {station.horaires.length > 0 ? (
        <ul className="fr-raw-list fr-mb-4w">
          {station.horaires.map((h) => (
            <li key={h.jour} className="fr-mb-1w">
              <span className="fr-text--bold">{h.jour}</span> :{' '}
              {h.ferme
                ? 'Fermé'
                : h.ouverture && h.fermeture
                  ? `${h.ouverture} - ${h.fermeture}`
                  : 'Horaires non communiqués'}
            </li>
          ))}
        </ul>
      ) : (
        <p className="fr-mb-4w">Horaires non communiqués pour cette station.</p>
      )}

      {station.rupture.length > 0 && (
        <p role="alert">Rupture signalée : {station.rupture.join(', ')}</p>
      )}
    </>
  );
}