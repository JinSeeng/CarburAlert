import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Input from '@codegouvfr/react-dsfr/Input';
import Select from '@codegouvfr/react-dsfr/Select';
import { TYPES_CARBURANT, type CritereTri, type TypeCarburant } from '../domain/types';
import { useRecherche } from '../hooks/useRecherche';
import {
  RAYON_KM_DEFAUT,
  ecrireParametresRecherche,
  lireParametresRecherche,
} from '../routes/rechercheParams';
import EtatInitial from '../components/etats/EtatInitial';
import EtatChargement from '../components/etats/EtatChargement';
import EtatSucces from '../components/etats/EtatSucces';
import EtatVide from '../components/etats/EtatVide';
import EtatErreur from '../components/etats/EtatErreur';

const INCREMENT_ELARGISSEMENT_KM = 10;

export default function RecherchePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const parametresUrl = lireParametresRecherche(searchParams);

  // Saisie locale pour une frappe fluide, indépendante du cycle de l'URL.
  const [adresseSaisie, setAdresseSaisie] = useState(parametresUrl.adresse);

  const { etat, relancer } = useRecherche({ ...parametresUrl, adresse: adresseSaisie });

  useEffect(() => {
    if (etat.statut === 'initial') return;

    const prochains = ecrireParametresRecherche({ ...parametresUrl, adresse: adresseSaisie });
    if (prochains.toString() !== searchParams.toString()) {
      setSearchParams(prochains);
    }
  }, [etat.statut]);

  useEffect(() => {
    document.title = "Carbur'Alert — Trouvez la station la plus rentable";
  }, []);

  function mettreAJourCarburant(valeur: string) {
    setSearchParams(
      ecrireParametresRecherche({
        ...parametresUrl,
        adresse: adresseSaisie,
        carburant: (valeur || null) as TypeCarburant | null,
      }),
    );
  }

  function mettreAJourTri(valeur: string) {
    setSearchParams(
      ecrireParametresRecherche({
        ...parametresUrl,
        adresse: adresseSaisie,
        tri: valeur as CritereTri,
      }),
    );
  }

  function mettreAJourProfilVehicule(champ: 'capaciteReservoirLitres' | 'consommationL100km', valeur: string) {
    const nombre = Number(valeur);
    setSearchParams(
      ecrireParametresRecherche({
        ...parametresUrl,
        adresse: adresseSaisie,
        [champ]: Number.isFinite(nombre) && nombre > 0 ? nombre : parametresUrl[champ],
      }),
      { replace: true },
    );
  }

  function elargirRayon() {
    setSearchParams(
      ecrireParametresRecherche({
        ...parametresUrl,
        adresse: adresseSaisie,
        rayonKm: (parametresUrl.rayonKm || RAYON_KM_DEFAUT) + INCREMENT_ELARGISSEMENT_KM,
      }),
    );
  }

  return (
    <>
      <h1>Carbur'Alert</h1>

      <form onSubmit={(e) => e.preventDefault()} className="fr-mb-4w">
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-md-6">
            <Input
              label="Adresse de départ"
              hintText="Numéro, rue, ville… (3 caractères minimum)"
              nativeInputProps={{
                id: 'adresse',
                name: 'adresse',
                type: 'text',
                autoComplete: 'off',
                value: adresseSaisie,
                onChange: (e) => setAdresseSaisie(e.target.value),
              }}
            />
          </div>

          <div className="fr-col-12 fr-col-md-6">
            <Select
              label="Carburant"
              nativeSelectProps={{
                id: 'carburant',
                name: 'carburant',
                value: parametresUrl.carburant ?? '',
                onChange: (e) => mettreAJourCarburant(e.target.value),
              }}
            >
              <option value="">Tous carburants</option>
              {TYPES_CARBURANT.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>

          <div className="fr-col-12 fr-col-md-4">
            <Input
              label="Contenance du réservoir (L)"
              hintText="Nécessaire au calcul de rentabilité"
              nativeInputProps={{
                id: 'reservoir',
                name: 'reservoir',
                type: 'number',
                min: 1,
                inputMode: 'numeric',
                value: parametresUrl.capaciteReservoirLitres,
                onChange: (e) =>
                  mettreAJourProfilVehicule('capaciteReservoirLitres', e.target.value),
              }}
            />
          </div>

          <div className="fr-col-12 fr-col-md-4">
            <Input
              label="Consommation (L/100km)"
              hintText="Nécessaire au calcul de rentabilité"
              nativeInputProps={{
                id: 'consommation',
                name: 'consommation',
                type: 'number',
                min: 0.1,
                step: 0.1,
                inputMode: 'decimal',
                value: parametresUrl.consommationL100km,
                onChange: (e) =>
                  mettreAJourProfilVehicule('consommationL100km', e.target.value),
              }}
            />
          </div>

          <div className="fr-col-12 fr-col-md-4">
            <Select
              label="Trier par"
              nativeSelectProps={{
                id: 'tri',
                name: 'tri',
                value: parametresUrl.tri,
                onChange: (e) => mettreAJourTri(e.target.value),
              }}
            >
              <option value="prix">Prix</option>
              <option value="distance">Distance</option>
            </Select>
          </div>
        </div>
      </form>

      <div style={{ minHeight: '4rem' }}>
        {etat.statut === 'initial' && <EtatInitial />}
        {etat.statut === 'chargement' && <EtatChargement />}
        {etat.statut === 'erreur' && (
          <EtatErreur message={etat.message} onReessayer={relancer} />
        )}
        {etat.statut === 'vide' && <EtatVide onElargirRayon={elargirRayon} />}
        {etat.statut === 'succes' && (
          <EtatSucces
            stations={etat.stations}
            positionLibelle={etat.positionLibelle}
            carburant={parametresUrl.carburant}
            capaciteReservoirLitres={parametresUrl.capaciteReservoirLitres}
            consommationL100km={parametresUrl.consommationL100km}
          />
        )}
      </div>
    </>
  );
}
