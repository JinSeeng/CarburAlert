import { useState } from 'react';
import { ServiceCarburants } from '../services/ServiceCarburants';
import { EtatRecherche, ErreurRecherche, type Station } from '../types';

const serviceCarburants = new ServiceCarburants();

export function useRecherche() {
  const [etat, setEtat] = useState<EtatRecherche>(EtatRecherche.Initial);
  const [stations, setStations] = useState<Station[]>([]);
  const [messageErreur, setMessageErreur] = useState('');

  async function lancerRecherche(adresse: string, carburant: string) {
    setEtat(EtatRecherche.Chargement); // le spinner ne s'affiche qu'à partir d'ici

    try {
      const position = await serviceCarburants.geocoderAdresse(adresse);
      const resultats = await serviceCarburants.chercherStations(
        position.latitude,
        position.longitude,
        carburant
      );

      if (resultats.length === 0) {
        setEtat(EtatRecherche.Vide);
        return;
      }

      setStations(resultats);
      setEtat(EtatRecherche.Resultats);
    } catch (erreur) {
      if (erreur instanceof ErreurRecherche) {
        setMessageErreur(erreur.message);
      } else {
        setMessageErreur("Une erreur inattendue s'est produite.");
      }
      setEtat(EtatRecherche.Erreur);
    }
  }

  return { etat, stations, messageErreur, lancerRecherche };
}