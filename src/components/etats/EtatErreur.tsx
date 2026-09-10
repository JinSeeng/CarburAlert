import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';

interface EtatErreurProps {
  message: string;
  onReessayer: () => void;
}

export default function EtatErreur({ message, onReessayer }: EtatErreurProps) {
  return (
    <div>
      <Alert severity="error" role="alert" title="Une erreur est survenue" description={message} />
      <div className="fr-mt-2w">
        <Button priority="secondary" iconId="fr-icon-refresh-line" onClick={onReessayer}>
          Réessayer
        </Button>
      </div>
    </div>
  );
}
