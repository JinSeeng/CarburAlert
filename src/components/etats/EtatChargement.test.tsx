import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import EtatChargement from './EtatChargement';

describe('EtatChargement', () => {
  it('annonce le chargement aux technologies d’assistance (role status)', () => {
    render(<EtatChargement />);

    const indicateur = screen.getByRole('status');
    expect(indicateur).toHaveTextContent(/recherche des stations en cours/i);
  });

  it('utilise un aria-live poli pour ne pas interrompre l’utilisateur', () => {
    render(<EtatChargement />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });
});
