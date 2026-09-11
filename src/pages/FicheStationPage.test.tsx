import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as prixCarburantsModule from '../api/prixCarburants';
import type { Station } from '../domain/types';
import FicheStationPage from './FicheStationPage';

vi.mock('../api/prixCarburants');

function stationSansHoraires(): Station {
  return {
    id: '92230008',
    adresse: '192 Avenue Louis Roche',
    ville: 'Gennevilliers',
    codePostal: '92230',
    coordonnees: { latitude: 48.9327, longitude: 2.3044 },
    prix: [{ type: 'Gazole', valeur: 2.359, maj: '2026-09-05T08:57:18+00:00' }],
    horaires: [],
    automate2424: false,
    rupture: [],
    derniereMiseAJour: '2026-09-05T08:57:18+00:00',
  };
}

function rendreFicheStation(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/stations/${id}`]}>
      <Routes>
        <Route path="/stations/:id" element={<FicheStationPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('FicheStationPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('affiche un message explicite plutôt qu’une section vide quand les horaires ne sont pas communiqués', async () => {
    vi.mocked(prixCarburantsModule.recupererStationParId).mockResolvedValue(
      stationSansHoraires(),
    );

    rendreFicheStation('92230008');

    await waitFor(() =>
      expect(screen.getByText(/horaires non communiqués pour cette station/i)).toBeInTheDocument(),
    );
  });

  it('affiche l’horodatage avec la mention "Mis à jour" en toutes lettres', async () => {
    vi.mocked(prixCarburantsModule.recupererStationParId).mockResolvedValue(
      stationSansHoraires(),
    );

    rendreFicheStation('92230008');

    await waitFor(() => expect(screen.getByText(/mis à jour/i)).toBeInTheDocument());
  });
});
