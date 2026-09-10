import { Notice } from '@codegouvfr/react-dsfr/Notice';

export function BandeauPedagogique() {
  return (
    <Notice
      title="Projet pédagogique, ne constitue pas un service officiel"
      isDismissible={false}
    />
  );
}