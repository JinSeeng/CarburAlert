import './EcranStatut.css';

interface Props {
  message: string;
}

export function EcranErreur({ message }: Props) {
  return (
    <div className="ecran-statut ecran-statut--erreur" role="alert">
      <span className="ecran-statut__icone" aria-hidden="true">
        ⚠
      </span>
      <h2>La recherche a échoué</h2>
      <p>{message}</p>
    </div>
  );
}