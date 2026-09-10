import './EcranChargement.css';

export function EcranChargement() {
  return (
    <div className="ecran-chargement" role="status" aria-live="polite">
      <span className="ecran-chargement__spinner" aria-hidden="true" />
      <p>Recherche en cours…</p>
    </div>
  );
}