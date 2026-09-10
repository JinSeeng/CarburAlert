import { useState } from 'react';
import { EtatRecherche, ErreurRecherche, type Station } from '../types';
import { ServiceCarburants } from '../services/ServiceCarburants';

const serviceCarburants = new ServiceCarburants();

export function useRecherche() {
  const [etat, setEtat] = useState<EtatRecherche>(EtatRecherche.Initial);
  const [stations, setStations] = useState<Station[]>([]);
  const [messageErreur, setMessageErreur] = useState('');

  async function lancerRecherche(adresse: string, carburant: string = 'gaspal') {
    setEtat(EtatRecherche.Chargement);
    setMessageErreur('');

    try {
      const position = await serviceCarburants.geocoderAdresse(adresse);
      const resultats = await serviceCarburants.chercherStations(
        position.latitude,
        position.longitude,
        carburant
      );

      if (resultats.length === 0) {
        setStations([]);
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