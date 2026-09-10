import { SkipLinks } from '@codegouvfr/react-dsfr/SkipLinks';
import { Header } from '@codegouvfr/react-dsfr/Header';
import { Footer } from '@codegouvfr/react-dsfr/Footer';
import { Alert } from '@codegouvfr/react-dsfr/Alert';
import { useIsDark } from '@codegouvfr/react-dsfr';

interface Props {
  children: React.ReactNode;
}

export default function Socle({ children }: Props) {
  const themeInfo = useIsDark();
  const isDark = themeInfo.isDark;
  const setIsDark = themeInfo.setIsDark;

  function changerTheme() {
    if (isDark === true) {
      setIsDark(false);
    } else {
      setIsDark(true);
    }
  }

  const liensEvitement = [{ anchor: '#contenu', label: 'Contenu' }];

  const boutonsRapides = [
    {
      iconId: 'fr-icon-theme-fill',
      text: 'Changer de thème',
      buttonProps: { onClick: changerTheme },
    },
  ];

  return (
    <>
      <Alert
        small
        severity="info"
        description="Projet pédagogique, ne constitue pas un service officiel."
      />

      <SkipLinks links={liensEvitement} />

      <Header
        brandTop="République Française"
        serviceTitle="CarburAlerte"
        homeLinkProps={{ href: '/', title: 'Accueil' }}
        quickAccessItems={boutonsRapides}
      />

      <div id="contenu">{children}</div>

      <Footer brandTop="République Française" />
    </>
  );
}