import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErreurApi } from './erreurs';
import { geocoderAdresse } from './geocodage';

function reponseJson(corps: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => corps,
  } as unknown as Response;
}

describe('geocoderAdresse', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retourne null pour une adresse vide sans appeler fetch', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const resultat = await geocoderAdresse('   ');

    expect(resultat).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("retourne null pour une adresse trop courte (< 3 caractères) sans appeler fetch — l'API répond 400 en dessous de ce seuil", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    expect(await geocoderAdresse('j')).toBeNull();
    expect(await geocoderAdresse('ju')).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('retourne les coordonnées et le libellé pour une adresse trouvée', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        reponseJson({
          features: [
            {
              geometry: { coordinates: [4.8357, 45.764] },
              properties: { label: '1 Rue de la République 69001 Lyon' },
            },
          ],
        }),
      ),
    );

    const resultat = await geocoderAdresse('1 rue de la République Lyon');

    expect(resultat).toEqual({
      coordonnees: { latitude: 45.764, longitude: 4.8357 },
      libelle: '1 Rue de la République 69001 Lyon',
    });
  });

  it('retourne null si aucune feature ne correspond (adresse introuvable)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reponseJson({ features: [] })));

    const resultat = await geocoderAdresse('adresse totalement inventée xyz');

    expect(resultat).toBeNull();
  });

  it('retourne null si la réponse est malformée plutôt que de planter', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reponseJson({ inattendu: true })));

    const resultat = await geocoderAdresse('adresse quelconque');

    expect(resultat).toBeNull();
  });

  it('lève une ErreurApi métier sur une réponse HTTP en erreur', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reponseJson({}, false, 500)));

    await expect(geocoderAdresse('adresse quelconque')).rejects.toBeInstanceOf(ErreurApi);
  });

  it('lève une ErreurApi métier sur une panne réseau', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(geocoderAdresse('adresse quelconque')).rejects.toBeInstanceOf(ErreurApi);
  });

  it('laisse remonter une annulation (AbortError) sans la transformer en ErreurApi', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new DOMException('Annulé', 'AbortError')),
    );

    await expect(geocoderAdresse('adresse quelconque')).rejects.toMatchObject({
      name: 'AbortError',
    });
  });
});
