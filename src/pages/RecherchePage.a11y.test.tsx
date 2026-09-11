import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import RecherchePage from './RecherchePage';

describe('RecherchePage — accessibilité', () => {
  it("ne présente aucune violation d'accessibilité détectable automatiquement (état initial)", async () => {
    const { container } = render(
      <MemoryRouter>
        <RecherchePage />
      </MemoryRouter>,
    );

    const resultats = await axe(container);

    expect(resultats).toHaveNoViolations();
  });
});
