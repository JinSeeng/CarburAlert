# Carbur'Alert

> **Ce détour de 8 km pour économiser 4 centimes, il est rentable ?**

**Carbur'Alert** liste les stations-service autour d'une adresse, permet de filtrer par carburant et calcule, pour chaque station, le seuil à partir duquel un détour devient rentable en fonction du véhicule de l'usager.

> ⚠️ **Projet pédagogique** — Ce service ne constitue pas un service officiel.

---

## Installation

### Prérequis

* Node.js ≥ 20
* npm

### Installation des dépendances

```bash
npm install
```

---

## Lancement

```bash
npm run dev       # Serveur de développement (Vite)
npm run build     # Build de production dans dist/
npm run preview   # Sert le build de production localement
```

---

## Tests

```bash
npm test               # Exécute la suite de tests une fois
npm run test:watch     # Lance les tests en mode watch
npm run test:coverage  # Exécute les tests avec rapport de couverture
```

Le rapport de couverture HTML est généré dans `coverage/index.html` après l'exécution de `npm run test:coverage`.

Il est également généré automatiquement par la CI et disponible comme artefact de build.

### Seuils de couverture

Les seuils sont définis dans `vite.config.ts` :

* `src/domain/**` : **90 %** minimum sur les lignes et les branches ;
* reste du projet : **60 %** minimum sur les lignes.

---

## Choix d'architecture

### Séparation domaine / API / UI

Le projet sépare clairement les règles métier, l'accès aux API et l'interface utilisateur.

* `src/domain/` contient les règles métier, notamment le calcul de rentabilité, la gestion des distances et la normalisation des données. Ce dossier ne dépend ni de React ni des modules d'API.
* `src/api/` transforme les réponses brutes des API externes vers le modèle métier, notamment via `normaliserListeStations`.
* `src/hooks/useRecherche.ts` orchestre la récupération des données et gère les cinq états de la recherche :
  `initial`, `chargement`, `succès`, `vide` et `erreur`.

Cette séparation permet notamment de tester les règles métier indépendamment de l'interface et des appels réseau.

### L'URL comme source de vérité

Les paramètres de recherche sont gérés dans `src/routes/rechercheParams.ts` à l'aide de `URLSearchParams`.

Ils ne sont pas stockés uniquement dans le state React. Une recherche peut ainsi :

* être partagée via son URL ;
* être conservée après un rechargement ;
* être intégrée à l'historique de navigation.

### Composants d'état découplés

Les cinq états obligatoires de l'application sont regroupés dans `src/components/etats/`.

Ces composants sont uniquement dédiés à la présentation : ils reçoivent leurs données via des props et n'effectuent aucun appel réseau. Cela permet de les tester indépendamment de la logique de récupération des données.

### Utilisation du DSFR

Le projet utilise le **Design System de l'État (DSFR)** via `@codegouvfr/react-dsfr`, plutôt que de réimplémenter les composants existants.

Les composants utilisés comprennent notamment :

* Header
* Footer
* SkipLinks
* Alert
* Card
* Input
* Select
* Button
* Badge
* CallOut

Le point d'entrée SPA `startReactDsfr` est initialisé dans `src/main.tsx` et également dans `src/test/setup.ts` pour les tests, afin que les liens DSFR utilisent correctement `Link` de React Router.

---

## API utilisées

### Prix des carburants

**Prix des carburants — flux instantané v2**
OpenDataSoft v2.1

`https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/`

La source est mise à jour toutes les 10 minutes et moissonnée toutes les 15 minutes.

L'application distingue deux informations temporelles :

* `horodatageRequete` : date et heure de la requête ;
* `station.derniereMiseAJour` : date et heure du prix le plus récent connu pour une station.

Ces deux informations sont affichées séparément et ne sont jamais fusionnées.

### Géocodage

**Géocodage Géoplateforme** (ex-API Adresse / BAN)

`https://data.geopf.fr/geocodage/search/`

Cette API permet de transformer l'adresse saisie par l'utilisateur en coordonnées géographiques.

---

## Limites et particularités techniques

### Structure du dataset des carburants

Le dataset utilise un format « large » : contrairement à une structure contenant un tableau de prix par station, il possède une colonne par carburant.

On retrouve notamment :

* `gazole_prix` / `gazole_maj`
* `sp95_prix` / `sp95_maj`
* `sp98_prix` / `sp98_maj`
* `e10_prix` / `e10_maj`
* `e85_prix` / `e85_maj`
* `gplc_prix` / `gplc_maj`

Chaque carburant possède également une colonne `<carburant>_rupture_type`.

Le champ `horaires` est une **chaîne JSON imbriquée**, héritée d'une conversion XML, et non un objet directement exploitable.

Ce comportement a été confirmé via l'export CSV public du dataset. La normalisation correspondante est réalisée dans `src/domain/normalisation.ts` et `src/api/prixCarburants.ts`.

La correspondance entre les carburants et leurs préfixes de colonnes est définie dans `src/domain/types.ts`, via `PREFIXE_COLONNE_CARBURANT`.

### Code postal

Le dataset utilise la colonne `cp` plutôt que `code_postal`.

`normaliserStation` accepte les deux formats, avec `cp` utilisé en priorité.

### Coordonnées géographiques

Les coordonnées du dataset utilisent le format **PTV_GEODECIMAL**, et non des degrés WGS84 bruts.

Selon la documentation officielle, les coordonnées sont exprimées en degrés WGS84 multipliés par 100 000. Par exemple :

```text
4576400 → 45.764°
```

Sans cette conversion, les distances calculées peuvent atteindre plusieurs milliers de kilomètres entre des points pourtant proches.

`normaliserStation` applique donc la conversion nécessaire, tout en vérifiant qu'une coordonnée déjà exprimée en degrés ne soit pas divisée une seconde fois.

Lorsque le champ `geom: { lat, lon }` est disponible, il est privilégié : ces coordonnées sont déjà exprimées en degrés WGS84 standards.

### Horodatages

Les horodatages sont affichés sans conversion de fuseau horaire.

`formaterHorodatage` dans `src/lib/dates.ts` extrait directement les valeurs de la chaîne ISO au lieu d'utiliser `Date` ou `Intl.DateTimeFormat`.

Cela évite une conversion automatique UTC → fuseau horaire du navigateur qui provoquerait un décalage d'une heure par rapport à l'heure fournie par le dataset.

### Horaires des stations

L'absence d'horaires est considérée comme un cas normal.

Lorsque `horaires` vaut `null`, `normaliserStation` renvoie un tableau vide et la fiche station affiche :

> Horaires non communiqués pour cette station.

Lorsque les horaires sont disponibles, les heures sont stockées dans un sous-objet :

```text
jour[].horaire.@ouverture
jour[].horaire.@fermeture
```

Le format source utilise un point (`"HH.MM"`), converti en deux-points (`"HH:MM"`) pour l'affichage.

### Recherche d'adresse

L'API de géocodage refuse les requêtes trop courtes avec une erreur HTTP 400.

Pour éviter les appels réseau inutiles, `useRecherche` et `geocoderAdresse` n'effectuent aucune requête lorsque l'adresse contient moins de `LONGUEUR_MINIMALE_ADRESSE` caractères, fixé à 3.

L'utilisateur reste alors dans l'état initial jusqu'à ce que suffisamment de caractères soient saisis.

### Identification des stations

Les données officielles ne fournissent pas les enseignes des stations (Total, Esso, etc.).

Conformément aux données disponibles et aux consignes du projet, les stations sont donc identifiées principalement par leur adresse. `StationCarte` utilise ainsi l'adresse comme identifiant principal.

---

## Calcul de rentabilité

Le calcul de rentabilité est implémenté dans `src/domain/rentabilite.ts` et bénéficie d'une couverture de tests de **100 %**.

Il est directement utilisé dans `EtatSucces` et `StationCarte`.

Pour comparer les stations, la station de référence (« sans détour ») est définie comme la station la plus proche du point de recherche.

Le coût du détour vers une autre station est ensuite estimé à partir de la distance supplémentaire parcourue, en considérant un aller-retour.

Le calcul n'est affiché que lorsqu'un carburant précis est sélectionné, car comparer directement les prix de carburants différents n'aurait pas de sens.

Les API utilisées ne fournissant pas de distance routière, la distance est calculée à vol d'oiseau à l'aide de la **formule de Haversine**, implémentée dans `src/domain/distance.ts`.

Il s'agit donc d'une approximation et non d'une estimation réelle du trajet routier.

---

## Affichage du chargement

Le DSFR ne proposant pas de composant `spinner` officiel correspondant au besoin du projet, `EtatChargement` utilise une icône DSFR animée via du CSS personnalisé.

Le composant `carbur-alerte-spinner`, défini dans `src/index.css`, respecte également la préférence utilisateur `prefers-reduced-motion`.
