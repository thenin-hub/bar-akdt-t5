# Bar AKDT — Comptoir Jetons

Application PWA de caisse du bar AKDT. L’interface et les données métier restent dans `index.html`; le service worker assure le cache hors ligne.

## Fichiers

- `index.html` : application complète, catalogue par défaut (65 produits), caisse, ticket, statistiques, clôture, cagnotte et réglages.
- `sw.js` : service worker, cache `comptoir-v44`.
- `manifest.webmanifest` et `icons/` : métadonnées et icônes de l’application installable.
- `README.md` : ce guide.

## Démarrage et stockage

Ouvrir l’application servie en HTTPS ou depuis son hébergement habituel. Le mode local conserve les données dans le stockage de ce navigateur/appareil (`localStorage`); une connexion à la base partagée est utilisée lorsqu’elle est configurée. Les sauvegardes JSON de catalogue et de configuration sont disponibles dans Réglages → Exports.

## Caisse, ordre des cases et clôture

Dans Caisse, choisir un groupe puis une catégorie. L’ordre peut être personnalisé avec **Personnaliser** et les poignées de glisser-déposer. Chaque vue garde son propre ordre : **Tous** (`layout["all:<id-groupe>"]`, avec un ordre distinct pour Boissons et Snacks) et chaque catégorie (`layout["cat:<nom>"]`) sont indépendants. Une vue jamais personnalisée suit l’ordre de catalogue existant; les produits ajoutés apparaissent à la fin de la vue personnalisée et les produits supprimés sont ignorés. Les emplacements vides sont réordonnables comme les produits, mais restent non vendables; chaque emplacement appartient à sa catégorie. Cela fonctionne aussi pour les catégories créées/renommées par l’utilisateur, y compris sans produit, et les noms avec accents, espaces ou majuscules.

La migration v38 sépare l’ancien ordre Tous global en ordres Boissons/Snacks, initialise les dispositions de catégorie (y compris vides) sans modifier les produits ni les ventes existantes, et conserve les ordres déjà personnalisés. Le déplacement direct d’une tuile vers une autre catégorie reste disponible. Les fonctions de ticket, totaux, cagnotte, statistiques et clôture conservent leurs données existantes.

## Pont d’impression (facultatif)

La configuration d’imprimante réseau et le pont d’impression sont facultatifs. L’impression système du navigateur reste disponible.

## Cagnotte liée aux ventes

La cagnotte et son journal restent gérés dans l’onglet Cagnotte et ne sont pas affectés par la personnalisation de l’ordre des cases.

## Sauvegardes de configuration et du catalogue

Les exports restent au format JSON existant. En WebView Android, l’import fonctionne également par collage du JSON si le sélecteur de fichiers n’est pas compatible; le texte exporté est affiché avec un bouton Copier comme solution de secours. Les sauvegardes de catalogue embarquent les réglages `catalog`, y compris `layout`; les imports historiques sans `layout` sont acceptés et démarrent avec l’ordre par défaut/ordre catalogue. En fusion, les dispositions de vues importées sont fusionnées par identifiant; en remplacement, la disposition importée remplace celle du catalogue courant. Les anciennes clés `layout.all` sont migrées sans perte en `layout["all:<id-groupe>"]`. L’ordre produit historique `products[].order` demeure présent et sert de fallback pour les vues non encore personnalisées.

Le cache du service worker est `comptoir-v44`.

## Changelog

- **v44** : le relevé texte de fin de journée masque les produits sans quantité vendue, conserve les produits offerts et affiche « Aucune vente » si aucun produit n’a été vendu; totaux inchangés.

- **v43** : les lignes produits sans quantité vendue sont masquées dans Journée/Clôture et dans les exports CSV/XLSX; totaux inchangés; message « Aucune vente » si aucun produit n’a été vendu.

- **v42** : import fichier renforcé avec écoute `input` et `change`, statuts visibles du fichier et de l’absence de transmission par le sélecteur, contrôles des fichiers vides/métadonnées, lecture progressive `file.text()`/`FileReader`/`arrayBuffer`, et import direct depuis le presse-papiers avec solution de collage.

- **v41** : fiabilisation de l’import JSON en WebView Android (sélecteur sans filtre MIME, lecture UTF-8 avec BOM, réinitialisation du champ, import par collage et erreurs explicites); secours d’export JSON affiché avec copie lorsque le téléchargement n’est pas disponible.

- **v40** : centrage vertical équilibré des noms et des prix dans les tuiles de caisse, avec marges symétriques, retour à la ligne robuste et poignée de personnalisation conservée.

- **v39** : préparation à la publication statique GitHub Pages; ajout du manifeste et des icônes PWA; cache des ressources de l’application et chemins relatifs compatibles avec un sous-dossier.

- **v38** : clé Tous séparée par groupe (Boissons/Snacks), correction des espaces vides et du glisser-déposer dans toutes les catégories, prise en charge des catégories renommées/vides et migration depuis l’ordre Tous v37 sans perte.
- **v37** : dispositions indépendantes pour Tous et chaque catégorie, migration sans perte de l’ordre historique, conservation des cases vides et de l’export/import existant.


## Publier sur GitHub Pages

1. Créer un dépôt GitHub (public, ou compatible avec l’offre Pages du compte).
2. Uploader le contenu de ce dossier à la racine du dépôt, en conservant `index.html`, `sw.js`, `manifest.webmanifest`, `icons/`, `.nojekyll` et `.gitignore`.
3. Dans **Settings → Pages**, choisir **Deploy from a branch**, puis la branche `main` et le dossier `/ (root)`, et enregistrer.
4. Après le déploiement, ouvrir `https://<utilisateur>.github.io/<nom-du-depot>/` (pour un dépôt de site utilisateur, l’URL est `https://<utilisateur>.github.io/`). L’URL exacte apparaît dans **Settings → Pages**.

Les chemins du manifeste, des icônes et du service worker sont relatifs, pour fonctionner dans un dépôt de projet hébergé en sous-dossier. GitHub Pages fournit HTTPS, requis pour l’installation PWA et le service worker.
