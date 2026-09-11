import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErreurApi } from '../api/erreurs';
import * as geocodageModule from '../api/geocodage';
import * as prixModule from '../api/prixCarburants';
import type { Station } from '../domain/types';
import { useRecherche } from './useRecherche';

vi.mock('../api/geocodage');
vi.mock('../api/prixCarburants');

const paramsDefaut = {
  adresse: '',
  carburant: null,
  rayonKm: 10,
  tri: 'prix' as const,
  capaciteReservoirLitres: 50,
  consommationL100km: 6,
};

function stationDeTest(id: string): Station {
  return {
    id,
    adresse: `Adresse ${id}`,
    coordonnees: { latitude: 45.7, longitude: 4.8 },
    prix: [],
    horaires: [],
    automate2424: false,
    rupture: [],
    derniereMiseAJour: '',
  };
}

describe('useRecherche', () => {
  beforeEach(() => {
    vi.mocked(geocodageModule.geocoderAdresse).mockReset();
    vi.mocked(prixModule.rechercherStationsAutourDe).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('reste à l’état initial tant qu’aucune adresse n’est saisie', () => {
    const { result } = renderHook(() => useRecherche(paramsDefaut, 10));
    expect(result.current.etat).toEqual({ statut: "initial" });
  });

  it("reste à l’état initial pour une adresse trop courte, sans jamais appeler l'API (l'API Géoplateforme répond 400 en dessous de 3 caractères)", async () => {
    const { result, rerender } = renderHook(
      ({ adresse }) => useRecherche({ ...paramsDefaut, adresse }, 10),
      { initialProps: { adresse: 'j' } },
    );
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });
    expect(result.current.etat).toEqual({ statut: 'initial' });

    rerender({ adresse: 'ju' });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });
    expect(result.current.etat).toEqual({ statut: 'initial' });

    expect(geocodageModule.geocoderAdresse).not.toHaveBeenCalled();
  });

  it('passe par chargement puis succès pour une recherche fructueuse', async () => {
    vi.mocked(geocodageModule.geocoderAdresse).mockResolvedValue({
      coordonnees: { latitude: 45.7, longitude: 4.8 },
      libelle: 'Lyon, France',
    });
    vi.mocked(prixModule.rechercherStationsAutourDe).mockResolvedValue({
      stations: [stationDeTest('1'), stationDeTest('2')],
      horodatageRequete: '2026-09-08T10:00:00Z',
    });

    const { result } = renderHook(() =>
      useRecherche({ ...paramsDefaut, adresse: 'Lyon' }, 10),
    );

    await waitFor(() => expect(result.current.etat.statut).toBe('succes'));

    expect(result.current.etat).toMatchObject({
      statut: 'succes',
      positionLibelle: 'Lyon, France',
    });
    if (result.current.etat.statut === 'succes') {
      expect(result.current.etat.stations).toHaveLength(2);
    }
  });

  it('passe à l’état vide si aucune station n’est trouvée', async () => {
    vi.mocked(geocodageModule.geocoderAdresse).mockResolvedValue({
      coordonnees: { latitude: 45.7, longitude: 4.8 },
      libelle: 'Lieu isolé',
    });
    vi.mocked(prixModule.rechercherStationsAutourDe).mockResolvedValue({
      stations: [],
      horodatageRequete: '2026-09-08T10:00:00Z',
    });

    const { result } = renderHook(() =>
      useRecherche({ ...paramsDefaut, adresse: 'Lieu isolé' }, 10),
    );

    await waitFor(() => expect(result.current.etat.statut).toBe('vide'));
  });

  it("passe à l’état vide (pas erreur) si l’adresse est introuvable — critère explicite du backlog ('zzzzzz')", async () => {
    vi.mocked(geocodageModule.geocoderAdresse).mockResolvedValue(null);

    const { result } = renderHook(() =>
      useRecherche({ ...paramsDefaut, adresse: 'zzzzzz' }, 10),
    );

    await waitFor(() => expect(result.current.etat.statut).toBe('vide'));
  });

  it('passe à l’état erreur, sans détail technique, si l’API échoue', async () => {
    vi.mocked(geocodageModule.geocoderAdresse).mockRejectedValue(
      new ErreurApi('Impossible de contacter le service de géocodage.'),
    );

    const { result } = renderHook(() =>
      useRecherche({ ...paramsDefaut, adresse: 'Lyon' }, 10),
    );

    await waitFor(() => expect(result.current.etat.statut).toBe('erreur'));
    expect(result.current.etat).toMatchObject({
      statut: 'erreur',
      message: 'Impossible de contacter le service de géocodage.',
    });
  });

  it('revient à l’état initial si l’adresse est vidée après une recherche', async () => {
    vi.mocked(geocodageModule.geocoderAdresse).mockResolvedValue({
      coordonnees: { latitude: 45.7, longitude: 4.8 },
      libelle: 'Lyon, France',
    });
    vi.mocked(prixModule.rechercherStationsAutourDe).mockResolvedValue({
      stations: [stationDeTest('1')],
      horodatageRequete: '2026-09-08T10:00:00Z',
    });

    const { result, rerender } = renderHook(
      ({ adresse }) => useRecherche({ ...paramsDefaut, adresse }, 10),
      { initialProps: { adresse: 'Lyon' } },
    );

    await waitFor(() => expect(result.current.etat.statut).toBe('succes'));

    rerender({ adresse: '' });

    await waitFor(() => expect(result.current.etat.statut).toBe('initial'));
  });

  it("n'écrase jamais un résultat récent par une réponse tardive à une recherche abandonnée (US C1)", async () => {
    let resoudrePremiereRecherche: (valeur: {
      stations: Station[];
      horodatageRequete: string;
    }) => void = () => {};
    const premierePromesse = new Promise<{ stations: Station[]; horodatageRequete: string }>(
      (resolve) => {
        resoudrePremiereRecherche = resolve;
      },
    );

    vi.mocked(geocodageModule.geocoderAdresse).mockResolvedValue({
      coordonnees: { latitude: 45.7, longitude: 4.8 },
      libelle: 'Adresse',
    });

    vi.mocked(prixModule.rechercherStationsAutourDe)
      .mockImplementationOnce(() => premierePromesse)
      .mockResolvedValueOnce({
        stations: [stationDeTest('recent')],
        horodatageRequete: '2026-09-08T10:05:00Z',
      });

    const { result, rerender } = renderHook(
      ({ adresse }) => useRecherche({ ...paramsDefaut, adresse }, 10),
      { initialProps: { adresse: 'adresse-abandonnee' } },
    );

    // On change immédiatement de recherche avant que la première ne réponde.
    rerender({ adresse: 'adresse-recente' });

    await waitFor(() => expect(result.current.etat.statut).toBe('succes'));
    if (result.current.etat.statut === 'succes') {
      expect(result.current.etat.stations[0].id).toBe('recent');
    }

    // La première recherche répond enfin, en retard : elle ne doit rien écraser.
    resoudrePremiereRecherche({
      stations: [stationDeTest('perime')],
      horodatageRequete: '2026-09-08T10:00:00Z',
    });
    await new Promise((r) => setTimeout(r, 20));

    expect(result.current.etat).toMatchObject({ statut: 'succes' });
    if (result.current.etat.statut === 'succes') {
      expect(result.current.etat.stations[0].id).toBe('recent');
    }
  });

  it('relancer() redéclenche la recherche courante (US B5)', async () => {
    vi.mocked(geocodageModule.geocoderAdresse).mockResolvedValue({
      coordonnees: { latitude: 45.7, longitude: 4.8 },
      libelle: 'Lyon, France',
    });
    vi.mocked(prixModule.rechercherStationsAutourDe)
      .mockRejectedValueOnce(new ErreurApi('Panne temporaire.'))
      .mockResolvedValueOnce({
        stations: [stationDeTest('1')],
        horodatageRequete: '2026-09-08T10:00:00Z',
      });

    const { result } = renderHook(() =>
      useRecherche({ ...paramsDefaut, adresse: 'Lyon' }, 10),
    );

    await waitFor(() => expect(result.current.etat.statut).toBe('erreur'));

    act(() => {
      result.current.relancer();
    });

    await waitFor(() => expect(result.current.etat.statut).toBe('succes'));
    expect(prixModule.rechercherStationsAutourDe).toHaveBeenCalledTimes(2);
  });
});
