import { useState } from 'react';
import EcranInitial from './EcranInitial';
import EcranChargement from './EcranChargement';
import EcranVide from './EcranVide';
import EcranErreur from './EcranErreur';
import { ErreurApi } from './ErreurApi';
import Socle from './Socle';

type Etat = 'initial' | 'chargement' | 'resultats' | 'vide' | 'erreur';

interface Station {
  adresse: string;
  prix: number;
}

export default function App() {
  const [etat, setEtat] = useState<Etat>('initial');
  const [messageErreur, setMessageErreur] = useState('');
  const [stations, setStations] = useState<Station[]>([]);

  const [adresse, setAdresse] = useState('');
  const [carburant, setCarburant] = useState('Gazole');

  // pour le bouton "Réessayer" de la US B5
  const [derniereAdresse, setDerniereAdresse] = useState('');
  const [dernierCarburant, setDernierCarburant] = useState('');

  async function chercher(adresseRecherchee: string, carburantRecherche: string) {
    setDerniereAdresse(adresseRecherchee);
    setDernierCarburant(carburantRecherche);
    setEtat('chargement');

    try {
      // 1. transformer l'adresse en coordonnées GPS
      const reponseGeo = await fetch(
        'https://data.geopf.fr/geocodage/search?q=' +
          encodeURIComponent(adresseRecherchee) +
          '&limit=1'
      );

      if (reponseGeo.ok === false) {
        throw new ErreurApi('Le service de géolocalisation ne répond pas.');
      }

      const donneesGeo = await reponseGeo.json();

      if (donneesGeo.features.length === 0) {
        throw new ErreurApi("Adresse introuvable. Vérifie l'orthographe.");
      }

      const longitude = donneesGeo.features[0].geometry.coordinates[0];
      const latitude = donneesGeo.features[0].geometry.coordinates[1];

      // 2. chercher les stations autour de ces coordonnées
      const filtre = "distance(geom, geom'POINT(" + longitude + ' ' + latitude + ")', 10000m)";
      const url =
        'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/' +
        'prix-des-carburants-en-france-flux-instantane-v2/records' +
        '?where=' +
        encodeURIComponent(filtre) +
        '&limit=20';

      const reponsePrix = await fetch(url);

      if (reponsePrix.ok === false) {
        throw new ErreurApi('Le service des prix ne répond pas.');
      }

      const donneesPrix = await reponsePrix.json();
      const enregistrements = donneesPrix.results;

      // ⚠️ nom de champ à vérifier avec un vrai appel réseau
      const champPrix = carburantRecherche.toLowerCase() + '_prix';
      const stationsTrouvees: Station[] = [];

      for (let i = 0; i < enregistrements.length; i++) {
        const enregistrement = enregistrements[i];

        if (enregistrement[champPrix]) {
          let adresseStation = 'Adresse inconnue';
          if (enregistrement.adresse) {
            adresseStation = enregistrement.adresse;
          }

          stationsTrouvees.push({
            adresse: adresseStation,
            prix: Number(enregistrement[champPrix]),
          });
        }
      }

      if (stationsTrouvees.length === 0) {
        setEtat('vide');
      } else {
        setStations(stationsTrouvees);
        setEtat('resultats');
      }
    } catch (erreur) {
      // US B5 : jamais de code HTTP, jamais de détail technique montré
      if (erreur instanceof ErreurApi) {
        setMessageErreur(erreur.message);
      } else {
        setMessageErreur('Impossible de contacter le service, vérifie ta connexion.');
      }
      setEtat('erreur');
    }
  }

  function reessayer() {
    chercher(derniereAdresse, dernierCarburant);
  }

  function soumettre() {
    if (adresse.trim() === '') {
      return;
    }
    chercher(adresse.trim(), carburant);
  }

  return (
    <Socle>
      <div className="app">
        <h1 className="titre-app">CarburAlerte</h1>

        <div className="formulaire">
          <input
            type="text"
            placeholder="Ton adresse"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
          />
          <select value={carburant} onChange={(e) => setCarburant(e.target.value)}>
            <option value="Gazole">Gazole</option>
            <option value="SP95">SP95</option>
            <option value="SP98">SP98</option>
            <option value="E10">E10</option>
          </select>
          <button onClick={soumettre} disabled={etat === 'chargement'}>
            Chercher
          </button>
        </div>

        {etat === 'initial' && <EcranInitial />}
        {etat === 'chargement' && <EcranChargement />}
        {etat === 'erreur' && (
          <EcranErreur message={messageErreur} onReessayer={reessayer} />
        )}
        {etat === 'vide' && <EcranVide />}

        {etat === 'resultats' && (
          <ul className="liste-resultats">
            {stations.map((station, index) => (
              <li key={index}>
                {station.adresse} — {station.prix.toFixed(3)} €/L
              </li>
            ))}
          </ul>
        )}
      </div>
    </Socle>
  );
}