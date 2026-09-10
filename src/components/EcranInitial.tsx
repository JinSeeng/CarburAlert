import './EcranInitial.css';

export function EcranInitial() {
  return (
    <section className="ecran-initial">
      <h1>Bienvenue sur CarburAlerte</h1>
      <p className="ecran-initial__intro">
        Ce service compare les prix des stations autour de vous, à partir des données officielles du gouvernement.
      </p>

      <ol className="ecran-initial__etapes">
        <li className="ecran-initial__etape">
          <span className="ecran-initial__numero">1</span>
          <div>
            <h2>Votre position</h2>
            <p>Indiquez une adresse pour chercher les stations autour de vous.</p>
          </div>
        </li>

        <li className="ecran-initial__etape">
          <span className="ecran-initial__numero">2</span>
          <div>
            <h2>Votre carburant</h2>
            <p>Choisissez le carburant que vous recherchez.</p>
          </div>
        </li>

        <li className="ecran-initial__etape">
          <span className="ecran-initial__numero">3</span>
          <div>
            <h2>Le résultat</h2>
            <p>La liste des stations trouvées s'affiche, avec leur prix.</p>
          </div>
        </li>
      </ol>
    </section>
  );
}