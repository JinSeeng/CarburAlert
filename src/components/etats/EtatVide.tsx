import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';

interface EtatVideProps {
  onElargirRayon: () => void;
}

export default function EtatVide({ onElargirRayon }: EtatVideProps) {
  return (
    <div>
      <Alert
        severity="info"
        title="Aucune station trouvée"
        description="Aucune station ne correspond à cette recherche dans le rayon indiqué. Vérifiez l'orthographe de l'adresse, ou élargissez le rayon de recherche."
      />
      <div className="fr-mt-2w">
        <Button priority="secondary" onClick={onElargirRayon}>
          Élargir le rayon de recherche
        </Button>
      </div>
    </div>
  );
}
