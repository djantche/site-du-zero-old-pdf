# La bibliothèque du Site du Zéro

Les anciens tutoriels PDF du Site du Zéro (devenu OpenClassrooms) : 431 livres, rangés dans le dossier [`livres/`](livres/).

**👉 Rechercher et télécharger un livre : https://djantche.github.io/site-du-zero-old-pdf/**

Le site permet de chercher un livre par titre, techno ou sujet (sans se soucier des accents), de filtrer par catégorie, puis de le télécharger, de le lire en ligne ou de copier un lien direct vers lui.

## Organisation du dépôt

| Chemin | Rôle |
| --- | --- |
| `livres/` | Les PDF, nommés avec leur titre complet (accents compris) |
| `scripts/categories.json` | La catégorie de chaque livre (titre → catégorie) |
| `scripts/generer_catalogue.py` | Génère `site/catalogue.json` (liste des livres, tailles, liens) |
| `site/` | La page de recherche publiée sur GitHub Pages |
| `.github/workflows/pages.yml` | Régénère le catalogue et publie le site à chaque push sur `master` |

Les PDF pèsent environ 1 Go au total, ce qui dépasse la limite de GitHub Pages (1 Go par site). Le site ne publie donc que la page de recherche : le bouton « Télécharger » récupère le fichier dans ce dépôt via `raw.githubusercontent.com`, et « Lire » ouvre l'aperçu GitHub du fichier.

## Ajouter un livre

Vous avez un ancien PDF du Site du Zéro qui manque ici ? Les contributions sont les bienvenues.

### 1. Vérifier le fichier

- C'est bien un tutoriel du Site du Zéro / OpenClassrooms, au format PDF.
- Il n'est pas déjà dans le dossier [`livres/`](livres/) : cherchez son titre sur le site avant de l'ajouter.
- Il fait moins de **100 Mo** : GitHub refuse les fichiers plus gros.

### 2. Nommer le fichier

Le nom du fichier est le titre affiché sur le site. Il doit donc reprendre le titre exact du tutoriel :

- avec les accents et les majuscules : `Apprenez à programmer en Python.pdf`, pas `apprenez-a-programmer-en-python.pdf` ;
- avec les noms de technos écrits correctement : `C++`, `C#`, `.NET`, `PHP`, `MySQL`, `jQuery`, `LaTeX`, `GIMP`… ;
- sans les caractères interdits sous Windows `/ \ : * ? " < > |`. Remplacez `:` et `/` par ` - ` ou `-` (`C++ - les templates.pdf`, `GNU-Linux`), et supprimez les `?` ;
- avec l'extension `.pdf` en minuscules.

### 3. Lui donner une catégorie

Ajoutez une ligne dans [`scripts/categories.json`](scripts/categories.json), avec le titre exact (sans `.pdf`) et l'une des catégories ci-dessous :

```json
"Apprenez à programmer en Rust": "Programmation",
```

| Catégorie | Pour… |
| --- | --- |
| `Programmation` | langages, algorithmes, bibliothèques (C, C++, Java, Python, Qt…) |
| `Développement web` | HTML, CSS, JavaScript, PHP, SQL, frameworks web |
| `Systèmes & réseaux` | Linux, Windows, matériel, réseaux, sécurité, serveurs |
| `Graphisme, 3D & multimédia` | GIMP, Photoshop, Blender, 3D, audio, vidéo |
| `Jeux vidéo` | création de jeux, mods, cartes |
| `Sciences & maths` | mathématiques, physique, chimie, calculatrices |
| `Bureautique & logiciels` | Word, Excel, LaTeX, logiciels du quotidien |
| `Divers` | tout le reste |

Un livre absent de `categories.json` apparaît quand même sur le site, dans « Divers ».

### 4. Envoyer le livre

**Vous avez les droits d'écriture sur le dépôt :**

```bash
git add "livres/Apprenez à programmer en Rust.pdf" scripts/categories.json
git commit -m "Ajoute « Apprenez à programmer en Rust »"
git push
```

**Sinon, proposez-le par une pull request :**

1. Cliquez sur **Fork** en haut de cette page pour copier le dépôt sur votre compte.
2. Dans votre copie, ouvrez le dossier `livres/`, puis **Add file → Upload files** et déposez le PDF.
3. Ouvrez `scripts/categories.json`, cliquez sur le crayon ✏️ et ajoutez la ligne du livre.
4. Cliquez sur **Contribute → Open pull request**, en indiquant d'où vient le PDF.

Une fois la modification sur `master`, le site se met à jour tout seul en une à deux minutes (onglet **Actions** pour suivre la publication).

### Cloner le dépôt sans télécharger 1 Go de PDF

Pour modifier le site ou ajouter un livre sans récupérer tous les PDF :

```bash
git clone --filter=blob:none --sparse git@github.com:djantche/site-du-zero-old-pdf.git
cd site-du-zero-old-pdf
git sparse-checkout set site scripts .github
```

Le dossier `livres/` reste alors vide en local, mais vous pouvez quand même y ajouter des fichiers avec `git add --sparse "livres/Mon livre.pdf"`. Pour tout récupérer : `git sparse-checkout disable`.

## Tester la page en local

```bash
python3 scripts/generer_catalogue.py   # lit la liste des PDF de la branche master via l'API GitHub
python3 -m http.server -d site 8000     # puis ouvrir http://localhost:8000
```

Le catalogue est généré à partir de ce qui est sur GitHub : un livre ajouté en local n'y apparaît qu'après le push.

## Droits

Les tutoriels appartiennent à leurs auteurs et à OpenClassrooms (ex-Site du Zéro). Ce dépôt ne fait que les archiver.
