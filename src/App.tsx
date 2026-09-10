import { EtatRecherche } from './types';
import { useRecherche } from './hooks/useRecherche';
import { EcranInitial } from './components/EcranInitial';
import { EcranChargement } from './components/EcranChargement';
import { EcranVide } from './components/EcranVide';
import { EcranErreur } from './components/EcranErreur';
import { FormulaireRecherche } from './components/FormulaireRecherche';
import './App.css';

export default function App() {
  const { etat, stations, messageErreur, lancerRecherche } = useRecherche();

  return (
    <main className="app">
      <h1 className="app__logo">CarburAlerte</h1>

      <FormulaireRecherche
        enChargement={etat === EtatRecherche.Chargement}
        onRechercher={lancerRecherche}
      />

      {etat === EtatRecherche.Initial && <EcranInitial />}
      {etat === EtatRecherche.Chargement && <EcranChargement />}
      {etat === EtatRecherche.Vide && <EcranVide />}
      {etat === EtatRecherche.Erreur && <EcranErreur message={messageErreur} />}

      {etat === EtatRecherche.Resultats && (
        <ul className="app__resultats">
          {stations.map((station, index) => (
            <li key={index}>
              {station.adresse} — {station.prixLitre.toFixed(3)} €/L
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}