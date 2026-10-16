# Audit de confidentialité et dépendances — 16 octobre 2026

## Conclusion et périmètre

Revue du code Electron et de son interface locale, sur la base du commit d138360b58c2bc21dbf05fd9e308406794e92b46, avec correctifs version 1.1.1. Aucun mécanisme applicatif de téléversement des factures, d’analytics ou de télémétrie n’a été identifié dans les sources examinées. Cela ne constitue PAS une garantie d’absence de fuite, un audit indépendant ni une certification de sécurité. Les dépendances transitives n’ont pas toutes été relues ligne par ligne.

Les exécutables 1.0.0 déjà téléchargés et le site précédemment hébergé ne sont pas modifiés par ce commit. Ne pas les considérer comme couverts par les correctifs. Recompiler et recetter la version corrigée avant traitement de factures confidentielles ou diffusion client.

## Résultats et corrections

| Élément | Constat | Correction / limite |
|---|---|---|
| PDF.js embarqué 5.6.205 | Dans la plage de l’avis GHSA-hq66-cqwq-w95j (CVE-2026-16633). L’exploitation décrite exige le scripting actif et l’absence de CSP bloquante ; l’application Electron disposait déjà d’une CSP restrictive et n’utilise pas le viewer avec scripting. | Remplacé par 6.4.299, version postérieure au correctif 6.2.108. Scripting et évaluation dynamique désactivés explicitement. Adaptation de l’API des pièces jointes et de la fermeture des workers. |
| Dépendance sprintf-js des outils de compilation | 8 alertes npm modérées remontées par propagation d’une même vulnérabilité de déni de service GHSA-hp3w-g68c-fv3c. Ce ne sont pas 8 fuites distinctes. | Suppression de cette chaîne via override global-agent 4.1.3, sans rétrograder electron-builder. API bootstrap contrôlée. Packaging testé avec l’archive Electron déjà disponible. |
| Liens externes | L’ancien filtre autorisait tous les chemins et paramètres de trois domaines. Une injection de script éventuelle aurait pu y placer des valeurs confidentielles. | Liste exacte des trois URL documentaires ; paramètres, fragments et chemins supplémentaires refusés. |
| Session des documents | Session Chromium par défaut potentiellement persistante. | Partition dédiée sans persistance et sans cache, sans correcteur orthographique, réponses no-store et no-referrer. Pas de stockage applicatif des factures. |
| Réseau des documents | Node désactivé, sandbox et isolation déjà actifs. | Filtrage des requêtes externes conservé, CSP renforcée avec frame-src none. Aucun pont IPC donnant accès au disque ou au réseau. |
| Mises à jour privées | Session réseau distincte et jeton GitHub local nécessaires. | GET/HEAD HTTPS limités aux endpoints Releases du dépôt et aux serveurs GitHub de téléchargement. Suppression Authorization hors api.github.com et suppression Cookie/Referer. Aucun objet facture transmis à ce module. |
| Effacement session | Des références pouvaient rester dans activeRecords ou le dialogue. | Nettoyage et rechargement de la page pour éliminer les références et traitements de l’ancienne session. Cela ne garantit pas l’effacement physique de la RAM, du swap ou de dumps système. |
| Exécutable Electron | Fonctionnalités puissantes inutiles disponibles par défaut. | Fuses : RunAsNode, NODE_OPTIONS, inspection CLI et privilèges file désactivés ; chargement depuis ASAR et vérification d’intégrité ASAR activés. |
| Chaîne CI | Actions référencées par tags mobiles, PDF.js copié manuellement hors inventaire npm. | Actions épinglées par SHA, jeton checkout non conservé, audit npm et vérification des fichiers PDF.js obligatoires avant build, Dependabot hebdomadaire configuré. |

## Inventaire contrôlé

- Electron 44.8.0 : moteur Chromium/Node de l’application.
- electron-updater 6.8.9 : seule dépendance npm directe de production ; 17 dépendances de production rapportées par npm, en incluant sa chaîne transitive.
- electron-builder 26.15.3 : outil de fabrication, non embarqué comme dépendance de production.
- pdfjs-dist 6.4.299 : dépendance de développement verrouillée dont deux fichiers de distribution sont embarqués dans dist/vendor. La classification npm dev ne signifie donc PAS qu’il est absent de l’application finale.
- global-agent 4.1.3 : override de compilation, à réévaluer lors d’une mise à jour de builder.
- Toutes les URL resolved du verrou proviennent de https://registry.npmjs.org/ ; contrôle ponctuel, pas une preuve de confiance de chaque paquet.

Audit npm après modifications : **0 vulnérabilité connue signalée**, tous niveaux et dépendances de développement inclus. Rapport brut conservé dans audit-npm-2026-10-16.json. Cette base n’exclut ni une faille non publiée, ni une compromission de paquet, ni un problème non couvert par npm audit. PDF.js vendored est désormais comparé octet par octet au paquet verrouillé avec npm run vendor:verify.

## Vérifications effectuées

- Tests des chemins locaux et refus de traversée de répertoires.
- Tests d’URL externe contenant données en paramètres/fragments, domaines similaires et schémas non HTTPS.
- Tests de blocage réseau de l’updater, méthode POST et suppression du jeton sur les téléchargements CDN.
- Tests de reconnaissance des montants, dates, répétitions du même BT, placements manuels et pages multiples.
- PDF synthétique sans données client : extraction du texte et de la pièce jointe XML CII avec PDF.js 6.4.299. Shim Uint8Array.toHex pour le test Node 24 seulement ; aucun shim ajouté à l’application.
- Tests de rejet DTD/ENTITY avant appel au parseur XML.
- Compilation du dossier Windows avec les dépendances et fuses corrigés. Le téléchargement réseau initial a échoué sur le certificat du proxy de cet environnement ; reprise avec l’archive Electron déjà téléchargée, sans désactiver TLS. Cette compilation de contrôle précède les derniers ajustements du lecteur PDF : les sources finales sont testées, mais un nouvel installateur final reste à produire.
- Recherche de signatures de jetons GitHub, clés privées et identifiants AWS dans les sources : aucun résultat. Pas d’inspection de secrets GitHub ni des variables privées de l’utilisateur.

## Ce qui peut sortir ou persister

| Action | Données / destination |
|---|---|
| Ouverture locale d’une facture | Mémoire du moteur de rendu et workers ; pas de téléversement applicatif identifié. |
| Mise à jour | IP, métadonnées HTTP et demandes de versions à GitHub ; jeton personnel à l’API GitHub pour le dépôt privé. GitHub peut journaliser ces échanges. Aucun texte de facture n’est passé à l’updater. |
| Clic sur documentation | Navigateur externe, URL fixe ; l’IP et les données propres à ce navigateur peuvent être visibles du site. |
| Export JSON | Fichier contenant valeurs BT, nom du document, positions et résultats : potentiellement confidentiel. Si le dossier choisi est synchronisé, son service de synchronisation peut l’envoyer. |
| Impression / copie | Spouleur d’impression, imprimante éventuellement réseau, presse-papiers et logiciels du poste. |
| Système d’exploitation | RAM, fichier d’échange, crash dumps ou outils de sécurité/sauvegarde possibles ; hors garantie de l’application. Aucun crashReporter applicatif configuré. |

## Risques résiduels et conditions de diffusion

1. **Signature de code absente.** Les checksums protègent contre la corruption, pas contre une Release malveillante publiée par un compte compromis. Configurer la signature Windows et un éditeur attendu avant diffusion sensible. Protéger les comptes, branches et droits de publication GitHub. Ces réglages et certificats n’ont pas été modifiés par cet audit.
2. **Pas de capture réseau Windows ni de test de pénétration.** Faire une recette avec factures synthétiques et surveillance réseau ; vérifier qu’aucun contenu de document n’apparaît dans les connexions et journaux. Tester également les mises à jour privées de bout en bout et les redirections CDN réelles. Le filtrage peut bloquer un nouveau domaine de GitHub : échouer fermé plutôt qu’élargir sans contrôle.
3. **PDF hostiles et déni de service.** Limites d’entrée 25 Mo/100 pages, XML 12 Mo et fragments limités. Une pièce jointe très compressée peut néanmoins consommer de la mémoire avant le contrôle de taille après extraction ; aucun quota mémoire dur ni sandbox de processus indépendante du moteur de rendu ajouté.
4. **Poste compromis.** Un administrateur local, malware, extension de sauvegarde ou outil de capture peut lire mémoire, fichiers, jeton d’environnement ou écran. Le jeton GH_TOKEN reste un secret local, non un secret matériel chiffré par cette application.
5. **Futures versions.** Une mise à jour modifie le code ; aucune revue ne garantit à l’avance toutes les versions futures. L’audit CI et Dependabot réduisent le risque sans remplacer la revue et la signature.
6. **Version web distincte.** Les protections de session Electron ne s’appliquent pas automatiquement à l’hébergement web. Le site antérieurement publié et ses dépendances doivent être mis à jour séparément.

## Références primaires

- https://github.com/mozilla/pdf.js/security/advisories/GHSA-hq66-cqwq-w95j
- https://github.com/advisories/GHSA-hp3w-g68c-fv3c
- https://www.electronjs.org/docs/latest/tutorial/security/
- https://www.electronjs.org/docs/latest/tutorial/fuses
- https://www.electron.build/docs/features/auto-update/

## Évolution 1.1.4 — dépôt public

Les mentions de mise à jour privée ci-dessus décrivent l’audit 1.1.1. Depuis 1.1.4 : aucun jeton requis ou envoyé ; Authorization est retiré sur tous les domaines. Le flux releases.atom et releases/latest du seul dépôt sont autorisés en complément des téléchargements. La session des factures reste isolée. La recette Windows complète reste à effectuer.
