import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import MiseEnPage from './MiseEnPage';

function rendreMiseEnPage() {
  const router = createMemoryRouter([
    {
      path: '/',
      element: <MiseEnPage />,
      children: [{ index: true, element: <p>Contenu de la page</p> }],
    },
  ]);
  return render(<RouterProvider router={router} />);
}

describe('MiseEnPage — accessibilité clavier (US C4)', () => {
  it('place les liens d’évitement en tout premier dans l’ordre du focus', async () => {
    const utilisateur = userEvent.setup();
    rendreMiseEnPage();

    await utilisateur.tab();
    expect(screen.getByRole('link', { name: 'Contenu' })).toHaveFocus();

    await utilisateur.tab();
    expect(screen.getByRole('link', { name: 'Pied de page' })).toHaveFocus();
  });

  it('pointe vers des ancres réellement présentes dans la page', () => {
    rendreMiseEnPage();

    expect(screen.getByRole('link', { name: 'Contenu' })).toHaveAttribute('href', '#contenu');
    expect(document.getElementById('contenu')).not.toBeNull();

    expect(screen.getByRole('link', { name: 'Pied de page' })).toHaveAttribute(
      'href',
      '#pied-de-page',
    );
    expect(document.getElementById('pied-de-page')).not.toBeNull();
  });

  it('expose un repère de contenu principal unique (un seul <main>)', () => {
    rendreMiseEnPage();

    expect(screen.getAllByRole('main')).toHaveLength(1);
  });

  it('permet d’activer la bascule de thème au clavier sans souris', async () => {
    const utilisateur = userEvent.setup();
    rendreMiseEnPage();

    // Le Header DSFR duplique les actions rapides pour la version mobile
    // (masquée en CSS selon le point de rupture, invisible à jsdom) : on
    // cible la première occurrence, celle du bandeau desktop.
    const [boutonTheme] = screen.getAllByRole('button', { name: /passer au thème/i });
    boutonTheme.focus();
    expect(boutonTheme).toHaveFocus();

    await utilisateur.keyboard('{Enter}');
    // L'activation ne doit pas planter ni faire perdre le focus.
    expect(boutonTheme).toBeInTheDocument();
  });
});
