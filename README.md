> **Sécurité — version 1.1.1 :** lire [l’audit de confidentialité](docs/AUDIT-SECURITE.md). Les anciens exécutables et le site hébergé ne reçoivent pas ces correctifs automatiquement. Recompiler et recetter avant usage sensible.

# Yooz - Facture Explorer — application Electron Windows

Application de bureau locale issue de Facture Explorer. Facture interactive, catalogue BT, imports UBL/CII, lecture du XML embarqué Factur-X, repères automatiques multiples et export JSON sont intégrés. Aucune connexion au site hébergé n’est nécessaire.

## Version portable compilée

La version portable 1.0.0 a été générée séparément. Le présent dépôt contient les sources 1.1.0 avec mise à jour automatique pour la version installée ; cette nouvelle version reste à compiler et tester sur Windows. Aucune installation de Node.js nécessaire. Le premier démarrage extrait temporairement les ressources de l’application.

## État des vérifications

Tests automatisés réussis : sécurité des chemins et liens, reconnaissance des valeurs, répétitions du même BT sur plusieurs pages et conservation des placements manuels. Les ressources de l’archive applicative Windows ont été contrôlées. Le lancement graphique et la recette sur Windows n’ont pas été exécutés ici. L’installateur NSIS n’a pas pu être finalisé sur cet environnement Linux dépourvu de Wine ; le workflow Windows fourni permet de le générer.

## Lancer depuis les sources sur Windows

1. Installer Node.js **24 LTS** depuis https://nodejs.org/.
2. Décompresser entièrement l’archive dans un dossier de travail.
3. Double-cliquer sur **Lancer-application.cmd**.

Le premier lancement télécharge les dépendances : Internet est nécessaire à cette étape. Les suivants utilisent les fichiers installés. Une fenêtre de commande peut rester ouverte en mode développement ; utiliser l’exécutable compilé pour la distribution aux clients.

Commandes équivalentes :
```sh
npm ci
npm start
```

## Créer l’installateur et la version portable

Sur Windows, double-cliquer sur **Creer-installateur-Windows.cmd**, ou exécuter :
```sh
npm ci
npm test
npm run build:win
```

Les résultats seront dans `release` :
- `Facture-Explorer-Installation-1.1.0-x64.exe` : assistant d’installation pour l’utilisateur, choix du dossier, raccourci bureau et désinstallation Windows.
- `Facture-Explorer-Portable-1.1.0-x64.exe` : exécutable portable sans installation.

Cible : Windows 10/11 64 bits x64. Aucun Node.js ni serveur n’est requis chez les utilisateurs des exécutables. Les binaires ne sont pas signés numériquement : Windows peut afficher un avertissement d’éditeur inconnu. Pour une diffusion professionnelle, prévoir la signature avec un certificat détenu par l’éditeur. La version installée 1.1.0 intègre les mises à jour automatiques depuis les Releases GitHub privées ; voir `docs/MISES-A-JOUR.md`.

## Construire avec GitHub sans outils sur le PC

Déposer les sources dans un dépôt en incluant `.github/workflows/windows.yml` et `package-lock.json`. Dans Actions, choisir **Construire application Windows → Run workflow**. Quand le traitement a réussi, télécharger l’artefact **Facture-Explorer-Windows** contenant les deux exécutables. Un lancement manuel produit des fichiers téléchargeables. Un tag `v1.1.0` correspondant à la version de package.json publie une Release privée et ses fichiers de mise à jour.

## Utilisation

- Facture interactive : cliquer sur une valeur pour ouvrir sa fiche BT ; activer le mode technique pour afficher les repères.
- Importer une facture : sélectionner un XML UBL/CII ou un PDF Factur-X. Les fichiers restent locaux.
- Factur-X : les valeurs du XML sont recherchées dans la couche texte du PDF. Plusieurs occurrences du même BT sont repérées automatiquement, sans confirmation. Les valeurs ambiguës restent des associations possibles.
- Export : choisir l’emplacement du fichier JSON de repères dans la boîte d’enregistrement.
- Impression : bouton de la facture ou menu Fichier → Imprimer le lisible. Windows propose les imprimantes installées, notamment Microsoft Print to PDF si activée.

## Périmètre

Le moteur utilise le texte natif : pas d’OCR pour les scans. Pas de validation réglementaire, XSD/Schematron ou PDF/A. Les mappings sont expérimentaux et ne couvrent pas toutes les extensions. Le lisible ne remplace pas la facture originale. Pas de réimport des annotations, d’historique de documents ni de synchronisation.

Les factures ne sont pas téléversées ; elles restent en mémoire jusqu’à effacement ou fermeture. Seuls les exports et impressions demandés écrivent leurs données. Electron peut conserver des fichiers techniques de profil dans le dossier applicatif Windows. Les liens documentaires autorisés s’ouvrent dans le navigateur externe et nécessitent Internet.

## Architecture

`dist` contient l’interface, le catalogue et PDF.js avec sa licence. `electron/main.cjs` ouvre la fenêtre et sert uniquement les ressources embarquées via le protocole interne `facture://app`. Aucun port réseau n’est ouvert. Le moteur de rendu est isolé et sandboxé, sans accès Node.js et sans pont IPC. Les requêtes réseau externes du moteur de rendu sont bloquées. Les scripts sont locaux ; aucune autorisation système supplémentaire n’est accordée.

`electron/assets.cjs` borne les ressources au dossier `dist` et limite les liens externes aux domaines documentaires utilisés dans le guide. Les modifications de domaines doivent être volontaires. Les dépendances sont figées dans le manifeste et le verrou npm ; les maintenir à jour avant une diffusion large.

## Recette Windows à effectuer avant diffusion

1. Démarrage de la version installée et de la version portable, y compris hors ligne.
2. Ouverture des fiches BT et chargement des exemples UBL/CII.
3. Lecture d’un Factur-X réel avec XML embarqué, rendu des pages, repères répétitifs et placements manuels.
4. Export JSON via la boîte d’enregistrement puis impression.
5. Ouverture d’une source officielle dans le navigateur externe.
6. Installation, raccourci et désinstallation.

Les tests automatisés du dossier `tests` contrôlent la résolution des ressources et le filtrage des chemins/liens. Ils ne remplacent pas cette recette visuelle Windows.

Références techniques :
- https://www.electronjs.org/docs/latest/api/protocol
- https://www.electronjs.org/docs/latest/tutorial/security/
- https://www.electron.build/nsis/

Compilation portable effectuée sur Linux avec : `npm exec electron-builder -- --win portable --x64 --publish never -c.win.signAndEditExecutable=false`. Les métadonnées/icône du lanceur Electron interne ne sont donc pas personnalisées.

## Hébergement web optionnel

L’interface `dist` reste utilisable sur un serveur statique. La configuration Pages est conservée dans `docs/pages-workflow.yml` comme modèle inactif ; elle n’est pas exécutée par le workflow Windows. L’ancien dossier `..github` comportait un point de trop et n’était pas reconnu par GitHub Actions.

## Mise à jour des dépendances PDF

Après une mise à jour de pdfjs-dist : `npm run vendor:sync`, `npm run vendor:verify`, puis `npm test`. Committer les fichiers embarqués et le verrou ensemble.
