import { describe, expect, it } from 'vitest';
import { annoterEtTrierStations, trouverStationReference } from './tri';
import type { Station } from './types';

const POSITION = { latitude: 45.764, longitude: 4.8357 };

function station(partiel: Partial<Station> & { id: string }): Station {
  return {
    adresse: `Adresse ${partiel.id}`,
    coordonnees: { latitude: 45.764, longitude: 4.8357 },
    prix: [],
    horaires: [],
    rupture: [],
    derniereMiseAJour: '',
    ...partiel,
    automate2424: partiel.automate2424 ?? false,
  };
}

describe('annoterEtTrierStations', () => {
  it('annote chaque station avec sa distance au point de recherche', () => {
    const proche = station({ id: 'proche', coordonnees: { latitude: 45.764, longitude: 4.8357 } });
    const loin = station({ id: 'loin', coordonnees: { latitude: 48.8566, longitude: 2.3522 } });

    const resultat = annoterEtTrierStations([loin, proche], POSITION, 'distance', null);

    expect(resultat[0].id).toBe('proche');
    expect(resultat[0].distanceKm).toBe(0);
    expect(resultat[1].id).toBe('loin');
    expect(resultat[1].distanceKm).toBeGreaterThan(300);
  });

  it('laisse distanceKm indéfini pour une station sans coordonnées, et la classe en fin de liste triée par distance', () => {
    const sansCoordonnees = station({ id: 'sans-coord', coordonnees: null });
    const avecCoordonnees = station({ id: 'avec-coord' });

    const resultat = annoterEtTrierStations(
      [sansCoordonnees, avecCoordonnees],
      POSITION,
      'distance',
      null,
    );

    expect(resultat[0].id).toBe('avec-coord');
    expect(resultat[1].id).toBe('sans-coord');
    expect(resultat[1].distanceKm).toBeUndefined();
  });

  it('trie par prix du carburant filtré quand un carburant est précisé', () => {
    const chere = station({
      id: 'chere',
      prix: [{ type: 'Gazole', valeur: 1.9, maj: '' }],
    });
    const pasChere = station({
      id: 'pas-chere',
      prix: [{ type: 'Gazole', valeur: 1.6, maj: '' }],
    });

    const resultat = annoterEtTrierStations([chere, pasChere], POSITION, 'prix', 'Gazole');

    expect(resultat.map((s) => s.id)).toEqual(['pas-chere', 'chere']);
  });

  it('trie par le prix le moins cher disponible quand aucun carburant n’est filtré', () => {
    const a = station({
      id: 'a',
      prix: [
        { type: 'Gazole', valeur: 1.9, maj: '' },
        { type: 'SP98', valeur: 1.5, maj: '' },
      ],
    });
    const b = station({ id: 'b', prix: [{ type: 'Gazole', valeur: 1.7, maj: '' }] });

    const resultat = annoterEtTrierStations([a, b], POSITION, 'prix', null);

    // a a un prix mini (SP98) de 1.5, inférieur au 1.7 de b.
    expect(resultat.map((s) => s.id)).toEqual(['a', 'b']);
  });

  it('classe en fin de liste les stations sans prix pour le carburant filtré', () => {
    const sansCeCarburant = station({ id: 'sans', prix: [{ type: 'SP95', valeur: 1.6, maj: '' }] });
    const avecCeCarburant = station({ id: 'avec', prix: [{ type: 'Gazole', valeur: 1.9, maj: '' }] });

    const resultat = annoterEtTrierStations(
      [sansCeCarburant, avecCeCarburant],
      POSITION,
      'prix',
      'Gazole',
    );

    expect(resultat.map((s) => s.id)).toEqual(['avec', 'sans']);
  });

  it('ne mute pas le tableau reçu', () => {
    const original = [station({ id: '1' }), station({ id: '2' })];
    const copie = [...original];

    annoterEtTrierStations(original, POSITION, 'distance', null);

    expect(original).toEqual(copie);
  });
});

describe('trouverStationReference', () => {
  it('retourne la station la plus proche, indépendamment de l’ordre du tableau', () => {
    const stations = annoterEtTrierStations(
      [
        station({ id: 'loin', coordonnees: { latitude: 48.8566, longitude: 2.3522 } }),
        station({ id: 'proche', coordonnees: { latitude: 45.764, longitude: 4.8357 } }),
      ],
      POSITION,
      'prix', // tri différent de la distance : ne doit pas influencer la référence
      null,
    );

    expect(trouverStationReference(stations)?.id).toBe('proche');
  });

  it('retourne null si aucune station n’a de distance connue', () => {
    const stations = [station({ id: '1', coordonnees: null })].map((s) => ({
      ...s,
      distanceKm: undefined,
    }));
    expect(trouverStationReference(stations)).toBeNull();
  });

  it('retourne null pour une liste vide', () => {
    expect(trouverStationReference([])).toBeNull();
  });
});