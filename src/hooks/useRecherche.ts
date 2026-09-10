import { useEffect, useState } from 'react';
import { ErreurApi, estAnnulation } from '../api/erreurs';
import { geocoderAdresse } from '../api/geocodage';
import { rechercherStationsAutourDe } from '../api/prixCarburants';
import { annoterEtTrierStations } from '../domain/tri';
import type { Station } from '../domain/types';
import type { ParametresRecherche } from '../routes/rechercheParams';
import { useValeurDifferee } from './useValeurDifferee';

const DELAI_DEBOUNCE_MS = 400;
/** 400 (Bad Request) pour les requêtes trop courtes  */
export const LONGUEUR_MINIMALE_ADRESSE = 3;
const MESSAGE_ERREUR_GENERIQUE = "Une erreur inattendue est survenue. Réessayez.";

export type EtatRecherche =
  | { statut: 'initial' }
  | { statut: 'chargement' }
  | {
      statut: 'succes';
      stations: Station[];
      horodatageRequete: string;
      positionLibelle: string;
    }
  | { statut: 'vide'; horodatageRequete: string }
  | { statut: 'erreur'; message: string };

export interface ResultatUseRecherche {
  etat: EtatRecherche;
  /** Relance la recherche courante (US B5 : bouton "réessayer"). */
  relancer: () => void;
}

export function useRecherche(
  params: ParametresRecherche,
  delaiDebounceMs: number = DELAI_DEBOUNCE_MS,
): ResultatUseRecherche {
  const adresseDifferee = useValeurDifferee(params.adresse, delaiDebounceMs);
  const [etat, setEtat] = useState<EtatRecherche>({ statut: 'initial' });
  const [tentative, setTentative] = useState(0);

  useEffect(() => {
    const adresseNettoyee = adresseDifferee.trim();

    if (adresseNettoyee === '' || adresseNettoyee.length < LONGUEUR_MINIMALE_ADRESSE) {
      setEtat({ statut: 'initial' });
      return;
    }

    const controleur = new AbortController();
    setEtat({ statut: 'chargement' });

    (async () => {
      try {
        const position = await geocoderAdresse(adresseNettoyee, controleur.signal);
        if (controleur.signal.aborted) return; // recherche abandonnée entre-temps

        if (!position) {
          setEtat({ statut: 'vide', horodatageRequete: new Date().toISOString() });
          return;
        }

        const resultat = await rechercherStationsAutourDe(
          {
            latitude: position.coordonnees.latitude,
            longitude: position.coordonnees.longitude,
            rayonMetres: params.rayonKm * 1000,
            carburant: params.carburant ?? undefined,
          },
          controleur.signal,
        );
        if (controleur.signal.aborted) return; // réponse tardive à une recherche abandonnée

        if (resultat.stations.length === 0) {
          setEtat({ statut: 'vide', horodatageRequete: resultat.horodatageRequete });
        } else {
          const stationsTriees = annoterEtTrierStations(
            resultat.stations,
            position.coordonnees,
            params.tri,
            params.carburant,
          );
          setEtat({
            statut: 'succes',
            stations: stationsTriees,
            horodatageRequete: resultat.horodatageRequete,
            positionLibelle: position.libelle,
          });
        }
      } catch (erreur) {
        if (controleur.signal.aborted || estAnnulation(erreur)) return;
        setEtat({
          statut: 'erreur',
          message: erreur instanceof ErreurApi ? erreur.message : MESSAGE_ERREUR_GENERIQUE,
        });
      }
    })();

    return () => controleur.abort();
  }, [adresseDifferee, params.carburant, params.rayonKm, params.tri, tentative]);

  return { etat, relancer: () => setTentative((t) => t + 1) };
}
