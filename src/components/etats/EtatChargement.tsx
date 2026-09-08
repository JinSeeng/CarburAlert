const HAUTEUR_RESERVEE = '4rem';

export default function EtatChargement() {
  return (
    <p
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        minHeight: HAUTEUR_RESERVEE,
      }}
    >
      <span className="fr-icon-refresh-line carbur-alerte-spinner" aria-hidden="true" />
      Recherche des stations en cours…
    </p>
  );
}
