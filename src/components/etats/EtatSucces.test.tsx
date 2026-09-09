import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { Station } from '../../domain/types';
import EtatSucces from './EtatSucces';

function station(id: string): Station {
  return {
    id,
    adresse: `Adresse ${id}`,
    coordonnees: { latitude: 45.7, longitude: 4.8 },
    prix: [],
    horaires: [],
    rupture: [],
    derniereMiseAJour: '',
  };
}

describe('EtatSucces', () => {
  it('annonce le nombre de résultats trouvés', () => {
    render(
      <MemoryRouter>
        <EtatSucces stations={[station('1'), station('2')]} positionLibelle="Lyon, France" />
      </MemoryRouter>,
    );

    expect(screen.getByText(/2 stations trouvées/i)).toBeInTheDocument();
    expect(screen.getByText(/Lyon, France/)).toBeInTheDocument();
  });

  it('affiche une carte par station', () => {
    render(
      <MemoryRouter>
        <EtatSucces stations={[station('1'), station('2'), station('3')]} positionLibelle="Lyon" />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('rend chaque carte de résultat atteignable au clavier, dans l’ordre (US C4)', async () => {
    const utilisateur = userEvent.setup();
    render(
      <MemoryRouter>
        <EtatSucces stations={[station('1'), station('2')]} positionLibelle="Lyon" />
      </MemoryRouter>,
    );

    const liens = screen.getAllByRole('link');

    await utilisateur.tab();
    expect(liens[0]).toHaveFocus();

    await utilisateur.tab();
    expect(liens[1]).toHaveFocus();
  });
});
