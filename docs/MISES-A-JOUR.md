# Mises à jour automatiques — Windows installé

Depuis la version 1.1.4, les mises à jour utilisent le dépôt public IamJorjiboy/Facture-Explorer. Aucun compte GitHub ni jeton personnel requis. Les variables GH_TOKEN et GITHUB_TOKEN ne sont pas utilisées par le fournisseur public. Les en-têtes Authorization, Cookie et Referer sont supprimés des requêtes de mise à jour.

Installer une première fois Facture-Explorer-Installation-1.1.4-x64.exe : les anciennes versions bloquent la recherche sans jeton. Ensuite, la recherche s’effectue 15 secondes après le démarrage et toutes les six heures. Une version stable supérieure est téléchargée automatiquement. Le dialogue propose de redémarrer ou de reporter ; en cas de report, elle est installée à la fermeture normale. Exporter ses repères avant de fermer. Aucun redémarrage n’est forcé.

Aide → Rechercher une mise à jour permet une recherche manuelle. La version portable ne s’auto-installe pas. Une panne réseau n’empêche pas de travailler ; la prochaine recherche réessaie.

## Publication

1. Augmenter la version dans package.json et package-lock.json.
2. Mettre à jour docs/RELEASE-NOTES.md et exécuter npm test.
3. Mettre la même version dans release-request.json et pousser sur main.
4. Le workflow release.yml vérifie les dépendances et les tests, compile puis publie l’installateur, son blockmap, latest.yml et SHA256SUMS.txt. Ne pas remplacer les fichiers d’une version déjà publiée. Les préversions et rétrogradations sont ignorées.

Le jeton GitHub Actions sert uniquement à publier, il n’est pas embarqué. Les factures restent traitées dans la session locale isolée ; le module de mise à jour ne reçoit aucun contenu de facture.

## Validation

Tests automatisés : éligibilité sans jeton, filtrage du flux public et des téléchargements, suppression des en-têtes sensibles, dialogues et vérifications programmées. Une recette Windows entre deux versions installées reste nécessaire pour vérifier le cycle complet téléchargement/installation/redémarrage sur un poste réel. Les exécutables ne sont pas signés numériquement.

Référence : https://www.electron.build/v26/docs/features/auto-update/
