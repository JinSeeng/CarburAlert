import { Outlet } from 'react-router-dom';
import { Header } from '@codegouvfr/react-dsfr/Header';
import { Footer } from '@codegouvfr/react-dsfr/Footer';
import { SkipLinks } from '@codegouvfr/react-dsfr/SkipLinks';
import { useIsDark } from '@codegouvfr/react-dsfr/useIsDark';

const ID_CONTENU = 'contenu';
const ID_PIED_DE_PAGE = 'pied-de-page';

export default function MiseEnPage() {
  const { isDark, setIsDark } = useIsDark();

  return (
    <>
      <SkipLinks
        links={[
          { anchor: `#${ID_CONTENU}`, label: 'Contenu' },
          { anchor: `#${ID_PIED_DE_PAGE}`, label: 'Pied de page' },
        ]}
      />

      {/* Bandeau obligatoire (consignes) : ce service n'est pas officiel. */}
      <div className="fr-alert fr-alert--info fr-alert--sm" style={{ borderRadius: 0 }}>
        <p className="fr-alert__title" style={{ marginBottom: 0 }}>
          Ce service est un projet pédagogique, il ne constitue pas un service officiel.
        </p>
      </div>
      
      <Header
        brandTop={
          <>
            RÉPUBLIQUE
            <br />
            FRANÇAISE
          </>
        }
        homeLinkProps={{ to: '/', title: "Accueil — Carbur'Alert" }}
        serviceTitle="Carbur'Alert"
        serviceTagline="Le détour en vaut-il le carburant ?"
        quickAccessItems={[
          {
            iconId: isDark ? 'fr-icon-sun-line' : 'fr-icon-moon-line',
            text: isDark ? 'Passer au thème clair' : 'Passer au thème sombre',
            buttonProps: {
              onClick: () => setIsDark(!isDark),
              'aria-pressed': isDark,
            },
          },
        ]}
      />

      <main id={ID_CONTENU}>
        <div className="fr-container fr-py-6w">
          <Outlet />
        </div>
      </main>

      <Footer
        id={ID_PIED_DE_PAGE}
        accessibility="non compliant"
        homeLinkProps={{ to: '/', title: "Accueil — Carbur'Alert" }}
      />
    </>
  );
}
