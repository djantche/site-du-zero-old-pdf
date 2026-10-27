#!/usr/bin/env python3
"""Génère site/catalogue.json à partir des PDF présents dans livres/.

La liste des fichiers (et leur taille) est lue via l'API GitHub, ce qui évite
de devoir télécharger les ~1 Go de PDF. Les catégories viennent de
scripts/categories.json (titre -> catégorie) ; un livre absent de ce fichier
est classé dans « Divers ».

Variables d'environnement (renseignées automatiquement dans GitHub Actions) :
  GITHUB_REPOSITORY  dépôt « propriétaire/nom »   (défaut : djantche/site-du-zero-old-pdf)
  GITHUB_REF_NAME    branche utilisée pour les liens (défaut : master)
  GITHUB_TOKEN       facultatif, évite la limite de 60 requêtes/heure de l'API
"""
import json
import os
import urllib.parse
import urllib.request
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
DOSSIER = "livres/"
DEPOT = os.environ.get("GITHUB_REPOSITORY", "djantche/site-du-zero-old-pdf")
BRANCHE = os.environ.get("GITHUB_REF_NAME", "master")


def lire_arbre():
    url = f"https://api.github.com/repos/{DEPOT}/git/trees/{BRANCHE}?recursive=1"
    requete = urllib.request.Request(url, headers={"Accept": "application/vnd.github+json"})
    if jeton := os.environ.get("GITHUB_TOKEN"):
        requete.add_header("Authorization", f"Bearer {jeton}")
    with urllib.request.urlopen(requete) as reponse:
        arbre = json.load(reponse)
    if arbre.get("truncated"):
        raise SystemExit("Arbre Git tronqué par l'API : trop de fichiers.")
    return arbre["tree"]


def main():
    categories = json.loads((RACINE / "scripts" / "categories.json").read_text(encoding="utf-8"))
    livres = []
    for entree in lire_arbre():
        chemin = entree["path"]
        if entree["type"] != "blob" or not chemin.startswith(DOSSIER) or not chemin.lower().endswith(".pdf"):
            continue
        fichier = chemin[len(DOSSIER):]
        titre = fichier[:-4]
        chemin_url = urllib.parse.quote(chemin)
        livres.append({
            "titre": titre,
            "categorie": categories.get(titre, "Divers"),
            "taille": entree["size"],
            "telecharger": f"https://raw.githubusercontent.com/{DEPOT}/{BRANCHE}/{chemin_url}",
            "lire": f"https://github.com/{DEPOT}/blob/{BRANCHE}/{chemin_url}",
        })
    livres.sort(key=lambda livre: livre["titre"].casefold())

    sortie = RACINE / "site" / "catalogue.json"
    sortie.write_text(
        json.dumps({"depot": DEPOT, "livres": livres}, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    sans_categorie = [l["titre"] for l in livres if l["titre"] not in categories]
    print(f"{len(livres)} livres écrits dans {sortie.relative_to(RACINE)}")
    if sans_categorie:
        print("Sans catégorie (classés « Divers ») :", *sans_categorie, sep="\n  - ")


if __name__ == "__main__":
    main()
