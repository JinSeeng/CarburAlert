import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErreurApi } from './erreurs';
import { recupererStationParId, rechercherStationsAutourDe } from './prixCarburants';

function reponseJson(corps: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => corps,
  } as unknown as Response;
}

describe('rechercherStationsAutourDe', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('construit l’URL avec le géofiltre, la limite et le filtre carburant', async () => {
    const fetchMock = vi.fn().mockResolvedValue(reponseJson({ results: [] }));
    vi.stubGlobal('fetch', fetchMock);

    await rechercherStationsAutourDe({
      latitude: 45.764,
      longitude: 4.8357,
      rayonMetres: 5000,
      carburant: 'Gazole',
      limite: 20,
    });

    const urlAppelee = new URL(fetchMock.mock.calls[0][0] as string);
    expect(urlAppelee.searchParams.get('geofilter.distance')).toBe('45.764,4.8357,5000');
    expect(urlAppelee.searchParams.get('limit')).toBe('20');
    expect(urlAppelee.searchParams.get('where')).toBe('gazole_prix is not null');
  });

  it('normalise les enregistrements bruts et fournit un horodatage de requête', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        reponseJson({
          results: [
            {
              id: '1',
              adresse: '1 rue Test',
              latitude: 45.7,
              longitude: 4.8,
              gazole_prix: 1.7,
              gazole_maj: '2026-09-08T08:00:00Z',
            },
          ],
        }),
      ),
    );

    const resultat = await rechercherStationsAutourDe({
      latitude: 45.7,
      longitude: 4.8,
      rayonMetres: 3000,
    });

    expect(resultat.stations).toHaveLength(1);
    expect(resultat.stations[0].adresse).toBe('1 rue Test');
    expect(() => new Date(resultat.horodatageRequete).toISOString()).not.toThrow();
  });

  it('retourne une liste vide sans planter si "results" est absent', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reponseJson({})));

    const resultat = await rechercherStationsAutourDe({
      latitude: 45.7,
      longitude: 4.8,
      rayonMetres: 3000,
    });

    expect(resultat.stations).toEqual([]);
  });

  it('lève une ErreurApi métier sur une réponse HTTP en erreur', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reponseJson({}, false, 503)));

    await expect(
      rechercherStationsAutourDe({ latitude: 45.7, longitude: 4.8, rayonMetres: 3000 }),
    ).rejects.toBeInstanceOf(ErreurApi);
  });

  it('lève une ErreurApi métier sur une panne réseau', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(
      rechercherStationsAutourDe({ latitude: 45.7, longitude: 4.8, rayonMetres: 3000 }),
    ).rejects.toBeInstanceOf(ErreurApi);
  });

  it('laisse remonter une annulation (AbortError) sans la transformer', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new DOMException('Annulé', 'AbortError')),
    );

    await expect(
      rechercherStationsAutourDe({ latitude: 45.7, longitude: 4.8, rayonMetres: 3000 }),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});

describe('recupererStationParId', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retourne la station normalisée quand elle existe', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(reponseJson({ results: [{ id: '42', adresse: '1 rue Test' }] })),
    );

    const station = await recupererStationParId('42');

    expect(station?.id).toBe('42');
    expect(station?.adresse).toBe('1 rue Test');
  });

  it('retourne null si aucun résultat (station inexistante), pas une erreur', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reponseJson({ results: [] })));

    const station = await recupererStationParId('inexistant');

    expect(station).toBeNull();
  });

  it('lève une ErreurApi sur une réponse HTTP en erreur', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reponseJson({}, false, 500)));

    await expect(recupererStationParId('42')).rejects.toBeInstanceOf(ErreurApi);
  });
});
