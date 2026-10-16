# Facture Explorer — installation GitHub Pages

Site statique en français : facture interactive, fiches BT, catalogue, imports UBL/CII et rapprochement visuel Factur-X. Aucun serveur applicatif, base de données ou compilation à installer.

## Publication recommandée avec GitHub Desktop

1. Décompresser cette archive.
2. Dans GitHub Desktop : File → New repository. Nom : `facture-explorer`. Créer le dépôt local.
3. Copier **le contenu** du dossier décompressé dans ce dépôt, en incluant le dossier caché `.github`. `dist` et `.github` doivent être directement à la racine du dépôt.
4. Vérifier que la branche est `main`, puis créer un commit dans GitHub Desktop.
5. Cliquer sur Publish repository. Pour GitHub Free, utiliser un dépôt public (décocher Keep this code private). Le dépôt contient seulement le logiciel et des exemples fictifs : ne pas y ajouter les factures clients.
6. Sur GitHub, ouvrir le dépôt → Settings → Pages → Build and deployment → Source : **GitHub Actions**.
7. Ouvrir Actions → Publier Facture Explorer → Run workflow → main → Run workflow. Si un premier lancement a échoué avant l’activation de Pages, cette nouvelle exécution le remplace.
8. Attendre le succès du déploiement. L’adresse apparaît dans Settings → Pages et dans le résultat du workflow.

Pour le compte IamJorjiboy et le dépôt facture-explorer, l’adresse attendue est :
https://iamjorjiboy.github.io/facture-explorer/
Cette adresse ne sera active qu’après publication réussie.

Chaque push sur `main` publiera ensuite automatiquement les changements.

## Alternative sans GitHub Desktop

Créer un dépôt GitHub public, puis utiliser Add file → Upload files pour envoyer le dossier `dist` et le README. Créer ensuite `.github/workflows/pages.yml` via Add file → Create new file, en recopiant le fichier fourni dans cette archive. Activer Pages avec la source GitHub Actions, puis lancer le workflow comme ci-dessus. Ne pas téléverser le ZIP lui-même : GitHub ne le décompresse pas.

## Vérifier après publication

- La facture de démonstration apparaît et ses fiches BT s’ouvrent.
- Dans Importer une facture, les exemples UBL et CII produisent un lisible.
- Un Factur-X contenant un XML CII et une couche texte affiche ses repères automatiques, y compris les occurrences répétées.
- L’export des repères produit un fichier JSON.

## Fonctionnement et limites

Les fichiers sélectionnés sont traités dans le navigateur, en mémoire. Le code ne transmet pas les factures à GitHub et ne les conserve pas après fermeture. Les dépendances PDF sont embarquées dans `dist/vendor`. La visite du site charge naturellement ses ressources depuis l’hébergeur.

La reconnaissance utilise le texte natif du PDF : ce n’est pas un OCR pour les pages scannées. Le placement est heuristique ; une même valeur peut correspondre à plusieurs BT. Tous les emplacements reconnus sont placés sans confirmation. Les codes courts peuvent nécessiter un placement manuel.

Le catalogue est pédagogique ; les imports sont expérimentaux. Aucun contrôle XSD/Schematron, fiscal ou PDF/A n’est effectué. Le site n’est pas un validateur de conformité. L’export des repères est proposé ; leur réimport ne l’est pas encore.

## Essai local

Depuis ce dossier, avec Python installé :

```sh
python3 -m http.server 8080 --directory dist
```

Ouvrir http://localhost:8080. Ne pas ouvrir `index.html` par double-clic : les modules et chargements XML/JSON nécessitent HTTP.

## Structure et maintenance

- `dist/index.html`, `style.css`, `app.js` : interface.
- `dist/catalog.json` : définitions BT.
- `dist/parser.js` : lecture XML.
- `dist/recognition.js`, `recognition-worker.js`, `placements.js` : reconnaissance et positions.
- `dist/vendor/` : PDF.js et sa licence à conserver.
- `.github/workflows/pages.yml` : publication du seul dossier `dist`.

Les chemins relatifs permettent l’hébergement sous `/facture-explorer/`. Aucun nom de dépôt n’est codé dans l’application. La navigation utilise des fragments d’URL et ne nécessite pas de réécriture serveur. Pour changer de branche, adapter `branches: [main]` dans le workflow.

Pour un VPS : servir le contenu de `dist` avec Nginx ou Apache en HTTPS, en conservant l’arborescence et les types MIME JavaScript pour `.js` et `.mjs`.

## État de livraison

Archive préparée depuis la version source `223619b2eb186ba5f808acb946198585d85b1dab`. Aucun dépôt GitHub n’a été créé et aucun déploiement GitHub Pages n’a été effectué pour cette livraison. La publication existante du site est conservée.

Configuration fondée sur la documentation GitHub Pages :
https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
