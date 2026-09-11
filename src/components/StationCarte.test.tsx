import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { Station } from '../domain/types';
import StationCarte from './StationCarte';

function stationComplete(): Station {
  return {
    id: '1',
    adresse: '1 rue de la République',
    ville: 'Lyon',
    codePostal: '69001',
    coordonnees: { latitude: 45.7, longitude: 4.8 },
    prix: [{ type: 'Gazole', valeur: 1.699, maj: '2026-09-08T08:00:00Z' }],
    horaires: [],
    rupture: [],
    derniereMiseAJour: '2026-09-08T08:00:00Z',
  };
}

describe('StationCarte', () => {
  it('affiche adresse, localisation et prix pour une station complète', () => {
    render(
      <MemoryRouter>
        <StationCarte station={stationComplete()} />
      </MemoryRouter>,
    );

    expect(screen.getByText('1 rue de la République')).toBeInTheDocument();
    expect(screen.getByText(/69001 Lyon/)).toBeInTheDocument();
    expect(screen.getByText(/Gazole.*1.699/)).toBeInTheDocument();
  });

  it('lie vers la fiche détail de la station', () => {
    render(
      <MemoryRouter>
        <StationCarte station={stationComplete()} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '/stations/1');
  });

  it("ne casse pas la mise en page et n'affiche jamais « undefined » avec des champs incomplets", () => {
    const stationIncomplete: Station = {
      id: '2',
      adresse: 'Adresse non communiquée',
      coordonnees: null,
      prix: [],
      horaires: [],
      rupture: [],
      derniereMiseAJour: '',
    };

    render(
      <MemoryRouter>
        <StationCarte station={stationIncomplete} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Adresse non communiquée')).toBeInTheDocument();
    expect(screen.getByText(/prix non communiqué/i)).toBeInTheDocument();
    expect(document.body.textContent).not.toContain('undefined');
  });

  it('signale une rupture de carburant quand elle est présente', () => {
    const station = { ...stationComplete(), rupture: ['Gazole' as const] };

    render(
      <MemoryRouter>
        <StationCarte station={station} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/rupture.*gazole/i)).toBeInTheDocument();
  });
});
