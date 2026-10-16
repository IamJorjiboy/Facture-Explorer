# Mises à jour automatiques — version installée Windows

## Fonctionnement

La version installée NSIS vérifie les Releases stables de `IamJorjiboy/Facture-Explorer` 15 secondes après démarrage, puis toutes les 6 heures. Elle télécharge automatiquement une version supérieure et propose de redémarrer. En choisissant Plus tard, l’installation se fait à la fermeture normale. Exporter les annotations avant de fermer. Aucun redémarrage n’est forcé. Une panne réseau n’empêche pas l’utilisation de l’application.

Menu Aide → Rechercher une mise à jour pour lancer une vérification manuelle. La version portable et le lancement de développement ne s’auto-installent pas. Il faut installer une première fois la version 1.1.0 : la version portable 1.0.0 déjà livrée ne peut pas acquérir ce mécanisme seule.

## Accès au dépôt privé

Créer dans votre propre compte GitHub un jeton personnel à permissions fines, limité au dépôt Facture-Explorer et à **Contents: Read-only**. Vous devez vous-même avoir accès au dépôt. Dans Windows, ouvrir Modifier les variables d’environnement pour votre compte et ajouter une variable utilisateur `GH_TOKEN` contenant ce jeton. Fermer et relancer l’application. Le jeton n’est jamais ajouté aux fichiers sources ni à l’exécutable. Ne pas l’envoyer par message, le publier dans une capture ou partager un même jeton avec les clients. Révoquer un jeton compromis ; renouveler un jeton expiré.

Cette configuration conserve la confidentialité du dépôt mais nécessite une configuration par poste/utilisateur. Pour une distribution sans jeton aux clients, prévoir un dépôt PUBLIC distinct réservé aux exécutables et modifier la destination publish avant compilation. Un exécutable public contient le code applicatif embarqué : le dépôt source privé ne rend pas ce code secret. Aucun changement de visibilité n’est effectué par ce projet.

## Publier une version

1. Modifier le numéro de version de `package.json` (par exemple 1.1.1).
2. Exécuter `npm install --package-lock-only`, puis `npm test`.
3. Committer et pousser les changements.
4. Créer et pousser le tag correspondant, par exemple :

```sh
git tag v1.1.1
git push origin v1.1.1
```

Le workflow Windows vérifie la correspondance du tag, compile l’installateur et publie dans une Release privée : l’installateur `.exe`, son `.blockmap` et `latest.yml`. Ces fichiers doivent rester ensemble et ne pas être modifiés après publication. Les versions beta/prerelease et les rétrogradations sont ignorées. Le GITHUB_TOKEN de GitHub Actions sert uniquement à publier ; aucun jeton n’est inscrit dans la configuration embarquée.

Le lancement manuel du workflow compile sans publier de Release. Le workflow ne rend pas le dépôt public. Pour la première version, utiliser le tag v1.1.0 après recette.

## Validation requise avant diffusion

Installer 1.1.0 sur Windows, configurer le jeton local, puis publier une version supérieure et vérifier détection, téléchargement, report du redémarrage, installation et conservation du lancement. Tester aussi hors ligne et avec jeton absent/expiré. Les tests unitaires ne constituent pas une preuve de fonctionnement de bout en bout de l’installation automatique.

Le projet ne dispose pas de certificat de signature. L’avertissement Windows et la politique de sécurité du poste peuvent bloquer l’installation. Prévoir une signature de code avant diffusion professionnelle.

Référence : https://www.electron.build/docs/features/auto-update/
