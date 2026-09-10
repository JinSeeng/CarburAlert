import './EcranInitial.css';

interface Etape {
  numero: number;
  titre: string;
  texte: string;
}

const ETAPES: Etape[] = [
  {
    numero: 1,
    titre: 'Votre position',
    texte: "Indiquez une adresse pour chercher les stations autour de vous.",
  },
  {
    numero: 2,
    titre: 'Votre carburant',
    texte: 'Choisissez le carburant que vous recherchez.',
  },
  {
    numero: 3,
    titre: 'Le résultat',
    texte: 'La liste des stations trouvées s\u2019affiche, avec leur prix.',
  },
];

export function EcranInitial() {
  return (
    <section className="ecran-initial" aria-labelledby="titre-ecran-initial">
      <h1 id="titre-ecran-initial">Bienvenue sur CarburAlerte</h1>
      <p className="ecran-initial__intro">
        Ce service compare les prix des stations autour de vous, à partir
        des données officielles du gouvernement.
      </p>

      <ol className="ecran-initial__etapes">
        {ETAPES.map((etape) => (
          <li key={etape.numero} className="ecran-initial__etape">
            <span className="ecran-initial__numero">{etape.numero}</span>
            <div>
              <h2>{etape.titre}</h2>
              <p>{etape.texte}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}