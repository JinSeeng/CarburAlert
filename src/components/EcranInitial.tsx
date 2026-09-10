// Cet écran s'affiche quand on arrive sur le site, avant d'avoir rien tapé.

export default function EcranInitial() {
  return (
    <div className="ecran ecran-initial">
      <h1>Bienvenue sur CarburAlerte ⛽</h1>
      <p>
        Ce site t'aide à trouver une station moins chère autour de toi, et te
        dit si le détour vaut vraiment le coup.
      </p>
      <ol>
        <li>Indique ton adresse</li>
        <li>Choisis ton carburant</li>
        <li>Le site liste les stations autour de toi avec leur prix</li>
      </ol>
    </div>
  );
}