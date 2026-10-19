# Version web — GitHub Pages

URL prévue : https://iamjorjiboy.github.io/Facture-Explorer/

La même interface est générée depuis dist avec scripts/build-pages.cjs. Les modifications de dist sur main déclenchent la vérification et la publication. L’application Windows reste disponible séparément.

## Activation initiale

Settings → Pages → Build and deployment → Source : GitHub Actions. Puis Actions → Publier la version web → Run workflow. Cette opération nécessite les droits d’administration du dépôt. Le workflow ne modifie pas les paramètres d’administration.

## Confidentialité

Les fichiers sélectionnés sont lus dans la mémoire du navigateur via File API. Le PDF, le XML embarqué et les correspondances BT sont traités localement. Aucun envoi de facture, télémétrie, stockage serveur ou stockage des factures dans localStorage/IndexedDB. L’export JSON est un téléchargement local déclenché par l’utilisateur. Effacer la session recharge l’onglet et supprime l’état applicatif.

Le catalogue et les exemples fictifs sont embarqués en module pour appliquer connect-src 'none', qui interdit fetch, XHR, WebSocket et les autres connexions de données depuis la page, y compris vers GitHub Pages. Les scripts, styles, images et workers de l’application sont servis localement par le site, sans CDN tiers. Les noms et contenus des fichiers importés ne sont pas utilisés pour construire une URL réseau. Les liens documentaires s’ouvrent seulement sur action de l’utilisateur, sans référent.

GitHub voit les requêtes de chargement du site et les métadonnées HTTP habituelles (notamment l’adresse IP). Cela ne signifie pas que les factures sont transmises. Un navigateur ou poste compromis, une extension autorisée à lire les pages ou une future modification du code restent hors de cette protection ; aucune promesse de risque nul.

## Vérification avant publication

Le workflow teste les imports UBL, CII et Factur-X avec des fichiers fictifs dans Chromium, surveille les requêtes réseau et vérifie le blocage des connexions de données et l’effacement de session. La publication dépend du succès de ces tests, de la vérification des dépendances PDF embarquées et de l’audit npm.
