import './EcranErreur.css';

interface EcranErreurProps {
  message: string;
  onReessayer: () => void;
}

export function EcranErreur({ message, onReessayer }: EcranErreurProps) {
  return (
    <div className="ecran-erreur" role="alert">
      <div className="ecran-erreur__icone">⚠️</div>
      <h2 className="ecran-erreur__titre">Une erreur est survenue</h2>
      <p className="ecran-erreur__message">{message}</p>
      <button type="button" className="ecran-erreur__bouton" onClick={onReessayer}>
        Réessayer
      </button>
    </div>
  );
}