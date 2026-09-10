interface Props {
  message: string;
  onReessayer: () => void;
}

export default function EcranErreur({ message, onReessayer }: Props) {
  return (
    <div className="ecran ecran-erreur">
      <p className="emoji">⚠️</p>
      <h2>Oups, ça n'a pas marché</h2>
      <p>{message}</p>
      <button onClick={onReessayer}>Réessayer</button>
    </div>
  );
}