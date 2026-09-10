import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import EtatInitial from './EtatInitial';

describe('EtatInitial', () => {
  it('explique quoi faire avant toute recherche', () => {
    render(<EtatInitial />);

    expect(
      screen.getByText(/saisissez une adresse de départ/i),
    ).toBeInTheDocument();
  });

  it("ne montre aucun indicateur de chargement", () => {
    render(<EtatInitial />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
