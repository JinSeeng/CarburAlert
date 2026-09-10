import './EcranStatut.css';

export function EcranVide() {
  return (
    <div className="ecran-statut ecran-statut--vide" role="status">
      <span className="ecran-statut__icone" aria-hidden="true">
        🔍
      </span>
      <h2>Aucune station trouvée</h2>
      <p>Aucune station proposant ce carburant n'a été trouvée près de cette adresse.</p>
    </div>
  );
}