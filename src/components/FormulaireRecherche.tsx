import { useState, type FormEvent } from 'react';
import './FormulaireRecherche.css';

interface Props {
  enChargement: boolean;
  onRechercher: (adresse: string, carburant: string) => void;
}

export function FormulaireRecherche({ enChargement, onRechercher }: Props) {
  const [adresse, setAdresse] = useState('');
  const [carburant, setCarburant] = useState('Gazole');

  function soumettre(evenement: FormEvent) {
    evenement.preventDefault();
    if (adresse.trim() === '') return;
    onRechercher(adresse.trim(), carburant);
  }

  return (
    <form className="formulaire-recherche" onSubmit={soumettre}>
      <input
        type="text"
        placeholder="Votre adresse"
        value={adresse}
        onChange={(e) => setAdresse(e.target.value)}
      />
      <select value={carburant} onChange={(e) => setCarburant(e.target.value)}>
        <option value="Gazole">Gazole</option>
        <option value="SP95">SP95</option>
        <option value="SP98">SP98</option>
        <option value="E10">E10</option>
      </select>
      <button type="submit" disabled={enChargement}>
        {enChargement ? 'Recherche…' : 'Chercher'}
      </button>
    </form>
  );
}