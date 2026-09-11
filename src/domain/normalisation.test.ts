import { describe, expect, it } from 'vitest';
import {
  ADRESSE_INCONNUE,
  normaliserListeStations,
  normaliserStation,
} from './normalisation';

const HORAIRES_EXEMPLE = JSON.stringify({
  '@automate-24-24': '',
  jour: [
    { '@id': '1', '@nom': 'Lundi', '@ferme': '' },
    { '@id': '2', '@nom': 'Mardi', '@ferme': '1' },
  ],
});

describe('normaliserStation', () => {
  it('normalise un enregistrement complet et bien formé (schéma large réel)', () => {
    const station = normaliserStation({
      id: '12345001',
      adresse: '1 rue de la République',
      ville: 'Lyon',
      cp: '69001',
      latitude: 45.764,
      longitude: 4.8357,
      gazole_prix: 1.699,
      gazole_maj: '2026-09-08T10:00:00Z',
      sp98_prix: 1.85,
      sp98_maj: '2026-09-08T09:50:00Z',
      sp95_rupture_type: 'temporaire',
      horaires: HORAIRES_EXEMPLE,
    });

    expect(station.id).toBe('12345001');
    expect(station.adresse).toBe('1 rue de la République');
    expect(station.ville).toBe('Lyon');
    expect(station.codePostal).toBe('69001');
    expect(station.coordonnees).toEqual({ latitude: 45.764, longitude: 4.8357 });
    expect(station.prix).toEqual([
      { type: 'Gazole', valeur: 1.699, maj: '2026-09-08T10:00:00Z' },
      { type: 'SP98', valeur: 1.85, maj: '2026-09-08T09:50:00Z' },
    ]);
    expect(station.rupture).toEqual(['SP95']);
    expect(station.derniereMiseAJour).toBe('2026-09-08T10:00:00Z');
    expect(station.horaires).toEqual([
      { jour: 'Lundi', ouverture: undefined, fermeture: undefined, ferme: false },
      { jour: 'Mardi', ouverture: undefined, fermeture: undefined, ferme: true },
    ]);
  });

  it(
    'lit les horaires détaillés dans le sous-objet "horaire" (exemple réel de l’API), ' +
      'et convertit le format "HH.MM" en "HH:MM"',
    () => {
      const horairesReels = JSON.stringify({
        '@automate-24-24': '',
        jour: [
          {
            '@id': '1',
            '@nom': 'Lundi',
            '@ferme': '1',
            horaire: { '@ouverture': '01.00', '@fermeture': '01.00' },
          },
          {
            '@id': '2',
            '@nom': 'Mardi',
            '@ferme': '',
            horaire: { '@ouverture': '06.30', '@fermeture': '21.00' },
          },
        ],
      });

      const station = normaliserStation({ horaires: horairesReels });

      expect(station.horaires).toEqual([
        { jour: 'Lundi', ouverture: '01:00', fermeture: '01:00', ferme: true },
        { jour: 'Mardi', ouverture: '06:30', fermeture: '21:00', ferme: false },
      ]);
    },
  );

  it(
    'laisse ouverture/fermeture indéfinies quand seul "@ferme" est présent, sans sous-objet ' +
      '"horaire" (autre exemple réel de l’API, station sans détail d’horaires)',
    () => {
      const station = normaliserStation({ horaires: HORAIRES_EXEMPLE });

      expect(station.horaires[0]).toEqual({
        jour: 'Lundi',
        ouverture: undefined,
        fermeture: undefined,
        ferme: false,
      });
    },
  );

  it('ne lève jamais d’exception avec null, undefined ou un type inattendu', () => {
    expect(() => normaliserStation(null)).not.toThrow();
    expect(() => normaliserStation(undefined)).not.toThrow();
    expect(() => normaliserStation('chaîne inattendue')).not.toThrow();
    expect(() => normaliserStation(42)).not.toThrow();
    expect(() => normaliserStation([])).not.toThrow();
  });

  it('affiche une mention explicite plutôt que "undefined" quand l’adresse manque', () => {
    const station = normaliserStation({ id: '1' });

    expect(station.adresse).toBe(ADRESSE_INCONNUE);
    expect(station.adresse).not.toContain('undefined');
  });

  it('lit le code postal depuis la colonne "cp" du dataset réel', () => {
    expect(normaliserStation({ cp: '75001' }).codePostal).toBe('75001');
  });

  it('retombe sur "code_postal" si "cp" est absent (compatibilité)', () => {
    expect(normaliserStation({ code_postal: '75001' }).codePostal).toBe('75001');
  });

  it('retombe sur un identifiant "inconnu" si absent, et accepte un id numérique', () => {
    expect(normaliserStation({}).id).toBe('inconnu');
    expect(normaliserStation({ id: 12345 }).id).toBe('12345');
    expect(normaliserStation({ id: '' }).id).toBe('inconnu');
  });

  it('retourne des coordonnées null si latitude ou longitude est manquante ou invalide', () => {
    expect(normaliserStation({ latitude: 45.7 }).coordonnees).toBeNull();
    expect(normaliserStation({ latitude: 'abc', longitude: 4.8 }).coordonnees).toBeNull();
    expect(
      normaliserStation({ latitude: '45.7', longitude: '4.8' }).coordonnees,
    ).toEqual({ latitude: 45.7, longitude: 4.8 });
  });

  it(
    'divise par 100 000 les coordonnées PTV_GEODECIMAL du dataset réel ' +
      '(exemple officiel : station d’Aureilhan, ~43.25°N 0.09°E)',
    () => {
      const station = normaliserStation({
        latitude: 4324885.3174,
        longitude: 9002.00535935,
      });

      expect(station.coordonnees?.latitude).toBeCloseTo(43.2488, 3);
      expect(station.coordonnees?.longitude).toBeCloseTo(0.09, 3);
    },
  );

  it('ne divise pas une seconde fois des coordonnées déjà dans une plage plausible de degrés', () => {
    expect(
      normaliserStation({ latitude: -12.5, longitude: 45.2 }).coordonnees,
    ).toEqual({ latitude: -12.5, longitude: 45.2 });
  });

  it('ne liste que les carburants réellement proposés par la station (prix présent)', () => {
    const station = normaliserStation({
      gazole_prix: 1.7,
      sp95_prix: 'pas un nombre',
      e10_prix: 1.6,
      e10_maj: '2026-09-08T08:00:00Z',
    });

    expect(station.prix.map((p) => p.type)).toEqual(['Gazole', 'E10']);
  });

  it('retourne un tableau vide pour horaires et rupture si absents ou mal formés', () => {
    const station = normaliserStation({ horaires: 'pas du JSON valide {{{', rupture: null });
    expect(station.horaires).toEqual([]);
    expect(station.rupture).toEqual([]);
  });

  it('ignore un horaires JSON valide mais dont "jour" est absent ou mal formé', () => {
    expect(normaliserStation({ horaires: JSON.stringify({}) }).horaires).toEqual([]);
    expect(
      normaliserStation({ horaires: JSON.stringify({ jour: 'pas un tableau' }) }).horaires,
    ).toEqual([]);
    expect(
      normaliserStation({ horaires: JSON.stringify({ jour: [null, { '@ferme': '' }] }) })
        .horaires,
    ).toEqual([]);
  });

  it('signale une rupture uniquement pour les carburants ayant un rupture_type non vide', () => {
    const station = normaliserStation({
      gazole_rupture_type: 'definitive',
      sp98_rupture_type: '',
      e85_rupture_type: '  ',
    });
    expect(station.rupture).toEqual(['Gazole']);
  });

  it('calcule la dernière mise à jour comme la plus récente des prix, "" si aucune date valide', () => {
    const avecDates = normaliserStation({
      gazole_prix: 1.7,
      gazole_maj: '2026-09-01T08:00:00Z',
      sp98_prix: 1.8,
      sp98_maj: '2026-09-08T08:00:00Z',
    });
    expect(avecDates.derniereMiseAJour).toBe('2026-09-08T08:00:00Z');

    const sansDate = normaliserStation({ gazole_prix: 1.7 });
    expect(sansDate.derniereMiseAJour).toBe('');
  });

  it('préfère le champ "geom" (déjà en degrés WGS84) aux colonnes latitude/longitude échelonnées', () => {
    const station = normaliserStation({
      latitude: '4893270',
      longitude: '230440',
      geom: { lon: 2.3044, lat: 48.9327 },
    });

    expect(station.coordonnees).toEqual({ latitude: 48.9327, longitude: 2.3044 });
  });

  it('retombe sur les colonnes latitude/longitude échelonnées si "geom" est absent ou invalide', () => {
    expect(
      normaliserStation({ latitude: '4893270', longitude: '230440', geom: null }).coordonnees,
    ).toEqual({ latitude: 48.9327, longitude: 2.3044 });
    expect(
      normaliserStation({ latitude: '4893270', longitude: '230440', geom: 'invalide' })
        .coordonnees,
    ).toEqual({ latitude: 48.9327, longitude: 2.3044 });
  });

  it(
    'traite sans planter un enregistrement réel complet de l’API, y compris ' +
      'horaires: null, des prix partiels (certains carburants absents) et des ' +
      'colonnes de rupture par carburant (exemple réel : station de Gennevilliers)',
    () => {
      const enregistrementReel = {
        id: 92230008,
        latitude: '4893270',
        longitude: '230440',
        cp: '92230',
        pop: 'R',
        adresse: '192 Avenue Louis Roche',
        ville: 'Gennevilliers',
        horaires: null,
        services: null,
        prix:
          '[{"@nom": "Gazole", "@id": "1", "@maj": "2026-09-05 08:57:18", "@valeur": "2.359"}]',
        rupture:
          '[{"@nom": "E85", "@id": "3", "@debut": "2018-11-02 12:13:02", "@fin": "", "@type": "definitive"}]',
        geom: { lon: 2.3044, lat: 48.9327 },
        gazole_maj: '2026-09-05T08:57:18+00:00',
        gazole_prix: 2.359,
        sp95_maj: '2026-09-05T08:57:18+00:00',
        sp95_prix: 2.319,
        e85_maj: null,
        e85_prix: null,
        gplc_maj: null,
        gplc_prix: null,
        e10_maj: '2026-09-05T08:57:18+00:00',
        e10_prix: 2.269,
        sp98_maj: '2026-09-05T08:57:18+00:00',
        sp98_prix: 2.349,
        e10_rupture_debut: null,
        e10_rupture_type: null,
        sp98_rupture_debut: null,
        sp98_rupture_type: null,
        sp95_rupture_debut: null,
        sp95_rupture_type: null,
        e85_rupture_debut: '2018-11-02T12:13:02+00:00',
        e85_rupture_type: 'definitive',
        gplc_rupture_debut: '2018-11-02T12:13:03+00:00',
        gplc_rupture_type: 'definitive',
        gazole_rupture_debut: null,
        gazole_rupture_type: null,
        carburants_disponibles: ['Gazole', 'SP95', 'E10', 'SP98'],
        carburants_indisponibles: ['E85', 'GPLc'],
        carburants_rupture_temporaire: null,
        carburants_rupture_definitive: 'E85;GPLc',
        horaires_automate_24_24: 'Non',
        services_service: null,
        departement: 'Hauts-de-Seine',
        code_departement: '92',
        region: 'Île-de-France',
        code_region: '11',
        horaires_jour: null,
      };

      expect(() => normaliserStation(enregistrementReel)).not.toThrow();

      const station = normaliserStation(enregistrementReel);

      expect(station.id).toBe('92230008');
      expect(station.adresse).toBe('192 Avenue Louis Roche');
      expect(station.ville).toBe('Gennevilliers');
      expect(station.codePostal).toBe('92230');
      expect(station.coordonnees).toEqual({ latitude: 48.9327, longitude: 2.3044 });
      expect(station.horaires).toEqual([]);
      expect(station.prix).toEqual([
        { type: 'Gazole', valeur: 2.359, maj: '2026-09-05T08:57:18+00:00' },
        { type: 'SP95', valeur: 2.319, maj: '2026-09-05T08:57:18+00:00' },
        { type: 'SP98', valeur: 2.349, maj: '2026-09-05T08:57:18+00:00' },
        { type: 'E10', valeur: 2.269, maj: '2026-09-05T08:57:18+00:00' },
      ]);
      expect(station.rupture).toEqual(['E85', 'GPLc']);
    },
  );
});

describe('normaliserListeStations', () => {
  it('normalise chaque élément d’un tableau', () => {
    const stations = normaliserListeStations([{ id: '1' }, { id: '2' }]);
    expect(stations).toHaveLength(2);
  });

  it('retourne un tableau vide si l’entrée n’est pas un tableau', () => {
    expect(normaliserListeStations(null)).toEqual([]);
    expect(normaliserListeStations({ id: '1' })).toEqual([]);
    expect(normaliserListeStations('erreur')).toEqual([]);
  });
});
