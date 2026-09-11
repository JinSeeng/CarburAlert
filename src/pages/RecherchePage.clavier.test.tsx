import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import RecherchePage from './RecherchePage';

describe('RecherchePage — accessibilité clavier (US C4)', () => {
  it("permet d'atteindre tous les champs du formulaire à la touche Tab, dans l'ordre, sans souris", async () => {
    const utilisateur = userEvent.setup();
    render(
      <MemoryRouter>
        <RecherchePage />
      </MemoryRouter>,
    );

    const champAdresse = screen.getByLabelText(/adresse de départ/i);
    const champCarburant = screen.getByLabelText(/carburant/i);
    const champReservoir = screen.getByLabelText(/contenance du réservoir/i);
    const champConsommation = screen.getByLabelText(/consommation/i);
    const champTri = screen.getByLabelText(/trier par/i);

    await utilisateur.tab();
    expect(champAdresse).toHaveFocus();

    await utilisateur.tab();
    expect(champCarburant).toHaveFocus();

    await utilisateur.tab();
    expect(champReservoir).toHaveFocus();

    await utilisateur.tab();
    expect(champConsommation).toHaveFocus();

    await utilisateur.tab();
    expect(champTri).toHaveFocus();
  });

  it('permet de saisir une adresse et de choisir un carburant entièrement au clavier', async () => {
    const utilisateur = userEvent.setup();
    render(
      <MemoryRouter>
        <RecherchePage />
      </MemoryRouter>,
    );

    await utilisateur.tab();
    await utilisateur.keyboard('10 rue de Paris');
    expect(screen.getByLabelText(/adresse de départ/i)).toHaveValue('10 rue de Paris');

    await utilisateur.tab();
    await utilisateur.selectOptions(screen.getByLabelText(/carburant/i), 'Gazole');
    expect(screen.getByLabelText(/carburant/i)).toHaveValue('Gazole');
  });

  it('ne place aucun élément interactif hors de l’ordre naturel du focus (aucun tabIndex positif)', () => {
    const { container } = render(
      <MemoryRouter>
        <RecherchePage />
      </MemoryRouter>,
    );

    const elementsAvecTabIndexPositif = container.querySelectorAll(
      '[tabindex]:not([tabindex="-1"]):not([tabindex="0"])',
    );
    expect(elementsAvecTabIndexPositif).toHaveLength(0);
  });
});
