import CallOut from '@codegouvfr/react-dsfr/CallOut';

export default function EtatInitial() {
  return (
    <CallOut iconId="fr-icon-road-map-line" title="Avant de commencer" titleAs="h2">
      Saisissez une adresse de départ, choisissez éventuellement un carburant, puis un rayon
      de recherche. Carbur'Alert liste les stations autour de vous et calcule, pour chacune,
      si le détour vaut vraiment le coup compte tenu de votre véhicule.
    </CallOut>
  );
}
