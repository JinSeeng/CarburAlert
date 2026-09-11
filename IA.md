# Utilisation de l’IA

## Outils IA utilisés

*Quels outils vous avez utilisés, et pour quoi (génération, refactoring, tests, débogage, documentation).*

- **Claude (Anthropic)**
- **ChatGPT**
- **Copilot**, intégré à VS Code

## Code fait avec l’IA / Code fait sans assistance

*Une partie du code que vous avez écrite sans assistance, et pourquoi vous avez fait ce choix.*

### Cas de Félicien

J’ai écrit toutes les requêtes API à la main. Étant donné qu’elles constituent le cœur du système de recherche, j’avais besoin de les réaliser moi-même afin de comprendre le fonctionnement du script de recherche.

J’ai également codé moi-même toute la structure interne de la page de recherche. J’ai principalement utilisé l’IA pour deux types de tâches :

- **La création de code générique** : par exemple, j’ai utilisé l’IA pour créer une fonction `fetchData` générique, que j’ai ensuite personnalisée avec les API du projet.
- **La modification de code existant** : par exemple, j’ai fourni à l’IA le code de `fetchData` que j’avais personnalisé afin qu’elle puisse m’aider à y ajouter une requête API supplémentaire.

Lorsque j’ai voulu modifier `<span>fetchData</span>` pour faire deux requêtes API l’une après l’autre, la première solution proposée par l’IA ne fonctionnait pas. J’ai ensuite essayé de le faire sans IA, mais j’ai pensé que cela me prendrait trop de temps. J’ai alors fait un prompt beaucoup plus précis et détaillé, en précisant que je voulais modifier le moins possible le code initial pour éviter les erreurs. À partir de là, la solution a fonctionné.

### Cas de Sellia

J’ai principalement utilisé l’IA pour accélérer certaines tâches réalisées en fin de projet, notamment lorsque le temps disponible ne me permettait pas de tout implémenter manuellement.

Pour les tests, j’ai utilisé **Claude**. J’ai d’abord écrit moi-même un fichier de test de référence afin de définir la structure et les comportements attendus. Je l’ai ensuite fourni à Claude pour générer des fichiers similaires sur les autres modules. Cela m’a permis de produire rapidement une suite de tests cohérente, tout en gardant le contrôle sur la structure et les tests de référence.

J’ai également utilisé **Copilot (intégré à VS Code)** principalement pour le débogage après les merges de branches Git. Il m’a notamment aidé à identifier les différences entre certaines versions du code, à repérer des régressions et à proposer des corrections ciblées. Il m’a aussi servi à adapter le format des horodatages reçus par l’API afin qu’ils correspondent au format attendu dans l’interface.

La majorité du développement fonctionnel a cependant été réalisée manuellement. J’ai notamment développé moi-même les différents états de recherche (chargement, erreur, succès et état vide), ainsi que leur logique, car je souhaitais en maîtriser entièrement le fonctionnement.

### Cas de Heidi

L’IA m’a principalement aidée sur des tâches de correction et d’amélioration du code. Elle m’a notamment permis de :

- corriger des erreurs de syntaxe et de compilation ;
- simplifier certaines parties du code afin de les rendre plus compréhensibles ;
- intégrer le système de design de l’État.

Cependant, les résultats proposés n’étaient pas toujours adaptés dès la première réponse. Il a parfois été nécessaire de reformuler mes demandes ou de préciser davantage le contexte afin d’obtenir le résultat souhaité.

Cette utilisation m’a donc également demandé de comprendre les propositions de l’IA et de les adapter lorsque cela était nécessaire.

### Cas de Léa

L’IA m’a aidée à créer la structure de base de certaines parties, comme `useRechercheParams`.

Elle m’a également servi à relire et vérifier mon code, notamment pour le nettoyer, corriger certaines erreurs et améliorer certaines parties.

Cependant, les solutions proposées n’étaient pas toujours adaptées à mes besoins. L’IA avait parfois du mal à se focaliser sur un problème précis, proposait des solutions qui ne correspondaient pas à ma requête ou introduisait de nouvelles erreurs dans mon code.

### Cas général

L’IA a également été utilisée pour la  **documentation et la préparation des livrables** . Nous avons notamment pu lui fournir du contenu que nous avions déjà rédigé afin de le reformuler, le structurer et le rendre plus clair et professionnel. Cette utilisation concerne notamment ce document ainsi que le README du projet. L’IA n’a donc pas servi à inventer le contenu, mais principalement à améliorer la forme de documents dont le contenu et les informations provenaient de notre travail.

## 3 erreurs de l’IA

*Trois cas où l’assistant s’est trompé, avec la nature de l’erreur et la façon dont vous l’avez corrigée. Ces trois cas doivent être vérifiables dans votre historique Git.*

L’IA a été utile pour accélérer la production de code et de tests, mais elle a également commis plusieurs erreurs sur des points qui n’avaient pas été vérifiés en conditions réelles.

### 1. Les horaires d’ouverture ne s’affichaient pas

Les horaires d’ouverture ne s’affichaient jamais, malgré leur présence dans les données.

L’IA avait supposé que les heures (`@ouverture` / `@fermeture`) étaient directement présentes sur chaque entrée du jour. En réalité, elles étaient stockées dans un sous-objet imbriqué nommé `horaire`, et leur format utilisait des décimales comme `"HH.MM"` plutôt que `"HH:MM"`.

Ce problème n’a été détecté qu’après qu’un membre de l’équipe a fourni des exemples réels et complets du champ.

La correction a consisté à adapter la logique de normalisation afin de lire correctement les valeurs dans leur structure réelle, puis à ajouter des tests sur des cas réels pour sécuriser le comportement.

### 2. Les coordonnées géographiques du dataset n’étaient pas interprétées correctement

L’IA avait initialement supposé que les coordonnées étaient exprimées en degrés WGS84 standards. Elles utilisaient en réalité un format spécifique au dataset, **PTV_GEODECIMAL**, exprimé en degrés × 100 000.

Cela a entraîné des distances absurdes entre des stations d’une même commune, parfois de plusieurs milliers de kilomètres.

La correction a été effectuée après vérification de la documentation officielle et des réponses réelles de l’API. J’ai ensuite ajouté la logique de conversion adéquate ainsi que des tests de régression correspondants.

### 3. Une erreur de versioning dans le workflow CI

Un problème de configuration dans le workflow GitHub Actions a empêché le bon fonctionnement du pipeline, ce qui a eu un impact direct sur la validation du projet.

La correction a été faite manuellement en vérifiant les versions des outils utilisés dans le workflow et en ajustant la configuration afin qu’elle corresponde au bon environnement de build.

Ce problème ne concernait pas la logique applicative, mais la configuration technique du pipeline. Il a donc nécessité une vérification directe du workflow CI.
