import { describe, expect, it } from 'vitest';
import {
  CAPACITE_RESERVOIR_DEFAUT_L,
  CONSOMMATION_DEFAUT_L_100KM,
  RAYON_KM_DEFAUT,
  ecrireParametresRecherche,
  lireParametresRecherche,
} from './rechercheParams';

describe('lireParametresRecherche', () => {
  it('retourne les valeurs par défaut sur une URL sans paramètre', () => {
    const params = lireParametresRecherche(new URLSearchParams(''));
    expect(params).toEqual({
      adresse: '',
      carburant: null,
      rayonKm: RAYON_KM_DEFAUT,
      tri: 'prix',
      capaciteReservoirLitres: CAPACITE_RESERVOIR_DEFAUT_L,
      consommationL100km: CONSOMMATION_DEFAUT_L_100KM,
    });
  });

  it('lit des paramètres valides', () => {
    const params = lireParametresRecherche(
      new URLSearchParams(
        'adresse=10+rue+de+Paris&carburant=Gazole&rayon=15&tri=distance&reservoir=45&conso=5.5',
      ),
    );
    expect(params).toEqual({
      adresse: '10 rue de Paris',
      carburant: 'Gazole',
      rayonKm: 15,
      tri: 'distance',
      capaciteReservoirLitres: 45,
      consommationL100km: 5.5,
    });
  });

  it('retombe sur les valeurs par défaut pour des paramètres invalides', () => {
    const params = lireParametresRecherche(
      new URLSearchParams('carburant=Kerosene&rayon=-5&tri=alphabetique&reservoir=-10&conso=0'),
    );
    expect(params.carburant).toBeNull();
    expect(params.rayonKm).toBe(RAYON_KM_DEFAUT);
    expect(params.tri).toBe('prix');
    expect(params.capaciteReservoirLitres).toBe(CAPACITE_RESERVOIR_DEFAUT_L);
    expect(params.consommationL100km).toBe(CONSOMMATION_DEFAUT_L_100KM);
  });

  it('nettoie les espaces superflus de l’adresse', () => {
    const params = lireParametresRecherche(new URLSearchParams('adresse=+Lyon+'));
    expect(params.adresse).toBe('Lyon');
  });
});

describe('ecrireParametresRecherche', () => {
  it('omet les valeurs par défaut pour garder une URL courte', () => {
    const searchParams = ecrireParametresRecherche({
      adresse: '',
      carburant: null,
      rayonKm: RAYON_KM_DEFAUT,
      tri: 'prix',
      capaciteReservoirLitres: CAPACITE_RESERVOIR_DEFAUT_L,
      consommationL100km: CONSOMMATION_DEFAUT_L_100KM,
    });
    expect(searchParams.toString()).toBe('');
  });

  it('inclut les valeurs non par défaut', () => {
    const searchParams = ecrireParametresRecherche({
      adresse: 'Lyon',
      carburant: 'SP98',
      rayonKm: 25,
      tri: 'distance',
      capaciteReservoirLitres: 60,
      consommationL100km: 7,
    });
    expect(searchParams.get('adresse')).toBe('Lyon');
    expect(searchParams.get('carburant')).toBe('SP98');
    expect(searchParams.get('rayon')).toBe('25');
    expect(searchParams.get('tri')).toBe('distance');
    expect(searchParams.get('reservoir')).toBe('60');
    expect(searchParams.get('conso')).toBe('7');
  });

  it('round-trip : lire(écrire(params)) redonne les mêmes params', () => {
    const original = {
      adresse: '5 avenue de la Gare',
      carburant: 'E10' as const,
      rayonKm: 8,
      tri: 'distance' as const,
      capaciteReservoirLitres: 42,
      consommationL100km: 5.2,
    };
    const relu = lireParametresRecherche(ecrireParametresRecherche(original));
    expect(relu).toEqual(original);
  });
});
