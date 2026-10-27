"use strict";

const TOUTES = "Toutes";
const etat = { livres: [], q: "", categorie: TOUTES, tri: "titre" };

const $ = (id) => document.getElementById(id);
const champ = $("q");
const selectTri = $("tri");

// Couleur (variable CSS) associée à chaque catégorie.
const COULEURS = {
  "Programmation": "--c-prog",
  "Développement web": "--c-web",
  "Systèmes & réseaux": "--c-sys",
  "Graphisme, 3D & multimédia": "--c-gfx",
  "Jeux vidéo": "--c-jeux",
  "Sciences & maths": "--c-sci",
  "Bureautique & logiciels": "--c-bur",
  "Divers": "--c-div",
};
const couleur = (categorie) => `var(${COULEURS[categorie] || "--c-div"})`;

// Nom court de la techno affiché sur la couverture, cherché dans le titre (premier trouvé).
const TECHNOS = [
  [/C\+\+/, "C++"], [/C#|\.NET/, "C#"], [/\bPHP/, "PHP"], [/MySQL|\bSQL\b|QtSql/, "SQL"],
  [/jQuery/, "jQ"], [/Node\.js/, "Node"], [/JavaScript|KineticJS|\bcanvas\b/, "JS"], [/HTML5/, "HTML5"],
  [/CSS3/, "CSS3"], [/\bCSS\b/, "CSS"], [/\bHTML\b/, "HTML"], [/XML/, "XML"], [/Python|PyGTK/, "Py"],
  [/Django/, "Dj"], [/Flask/, "Flask"], [/Symfony2/, "Sf2"], [/Java\b|JavaFX/, "Java"],
  [/Objective-C/, "ObjC"], [/Haskell/, "λ"], [/OCaml|Caml/, "ML"], [/Scala/, "Scala"], [/Ada\b/, "Ada"],
  [/Erlang|Yaws/, "Erl"], [/Perl/, "Perl"], [/\bQt\b/, "Qt"], [/SDL/, "SDL"], [/SFML/, "SFML"],
  [/GTK/, "GTK"], [/OpenGL|GLSL/, "GL"], [/Boost|STL/, "C++"], [/\ben C\b|\ble C\b|langage C\b/, "C"],
  [/ActionScript|AS3|Flash/, "AS3"], [/TI-Basic|\bTI\b/, "TI"], [/Casio/, "Casio"], [/Axe Parser/, "Axe"],
  [/LaTeX/, "TeX"], [/Markdown/, "MD"], [/GIMP/, "Gimp"], [/Photoshop/, "Ps"], [/Blender/, "Blend"],
  [/3ds Max|Maya|ZBrush|AutoCAD|SolidWorks|POV-Ray|Irrlicht|Ogre/, "3D"], [/\b3D\b/, "3D"],
  [/Android/, "Andr"], [/iPhone/, "iOS"], [/Windows Phone/, "WP"], [/Windows|Vista/, "Win"],
  [/GNU-Linux|Linux|Ubuntu|Debian|Arch|Unix|FreeBSD/, "Linux"], [/Git\b|Gitosis/, "Git"],
  [/Subversion|Mercurial/, "VCS"], [/FTP|SFTP/, "FTP"], [/DNS|DHCP|TCP|réseau|IRC|HTTP/, "Net"],
  [/Excel/, "Xl"], [/Word\b/, "Doc"], [/PowerPoint/, "Ppt"], [/R\b$/, "R"],
];
function techno(livre) {
  for (const [motif, nom] of TECHNOS) if (motif.test(livre.titre)) return nom;
  return livre.titre.replace(/^(Les?|La|L'|Un|Une|Des|À|De la|Du)\s*/i, "").charAt(0).toUpperCase();
}

// Minuscules sans accents ni ponctuation : « Développez » trouve « developpez ».
function normaliser(texte) {
  return texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, " ")
    .trim();
}

function formaterTaille(octets) {
  if (octets < 1024 * 1024) return `${Math.max(1, Math.round(octets / 1024))} Ko`;
  return `${(octets / 1024 / 1024).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo`;
}

// Surligne les mots recherchés dans le titre, sans injecter de HTML.
function titreSurligne(titre, mots) {
  const fragment = document.createDocumentFragment();
  const lettres = [...titre];
  const base = lettres.map((c) => normaliser(c) || " ");
  const aplati = base.join("");
  // Index de caractère normalisé -> index dans le titre d'origine.
  const vers = [];
  base.forEach((morceau, idx) => { for (const _ of morceau) vers.push(idx); });
  const marque = new Array(lettres.length).fill(false);
  for (const mot of mots) {
    for (let i = aplati.indexOf(mot); i !== -1; i = aplati.indexOf(mot, i + mot.length)) {
      for (let k = i; k < i + mot.length; k++) marque[vers[k]] = true;
    }
  }
  let tampon = "";
  let enMarque = false;
  const vider = () => {
    if (!tampon) return;
    if (enMarque) {
      const m = document.createElement("mark");
      m.textContent = tampon;
      fragment.append(m);
    } else {
      fragment.append(tampon);
    }
    tampon = "";
  };
  lettres.forEach((c, idx) => {
    if (marque[idx] !== enMarque) { vider(); enMarque = marque[idx]; }
    tampon += c;
  });
  vider();
  return fragment;
}

const ICONES = {
  telecharger: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0 4.5-4.5M12 15l-4.5-4.5M5 20h14"/></svg>',
  lire: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
  lien: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/></svg>',
};

function element(balise, classe, contenu) {
  const el = document.createElement(balise);
  if (classe) el.className = classe;
  if (contenu !== undefined) el.textContent = contenu;
  return el;
}

function creerCarte(livre, mots, index) {
  const li = element("li", "livre");
  li.style.setProperty("--couleur", couleur(livre.categorie));
  li.style.setProperty("--i", index);

  const couv = element("div", "couverture");
  couv.setAttribute("aria-hidden", "true");
  const nom = techno(livre);
  couv.append(element("span", `techno${nom.length > 4 ? " long" : ""}`, nom), element("span", "marque", "SdZ"));

  const corps = element("div", "livre-corps");
  const titre = element("h2", "livre-titre");
  titre.append(titreSurligne(livre.titre, mots));
  const meta = element("p", "livre-meta");
  meta.append(element("span", "cat", livre.categorie), element("span", "taille", `PDF · ${formaterTaille(livre.taille)}`));

  const actions = element("div", "actions");
  const telecharger = element("a", "bouton principal");
  telecharger.href = livre.telecharger;
  telecharger.innerHTML = `${ICONES.telecharger}<span>Télécharger</span>`;
  telecharger.setAttribute("aria-label", `Télécharger « ${livre.titre} » (${formaterTaille(livre.taille)})`);

  const lire = element("a", "bouton");
  lire.href = livre.lire;
  lire.target = "_blank";
  lire.rel = "noopener";
  lire.innerHTML = `${ICONES.lire}<span>Lire</span>`;
  lire.setAttribute("aria-label", `Lire « ${livre.titre} » en ligne`);

  const partager = element("button", "bouton carre");
  partager.type = "button";
  partager.innerHTML = ICONES.lien;
  partager.title = "Copier le lien vers ce livre";
  partager.setAttribute("aria-label", `Copier le lien vers « ${livre.titre} »`);
  partager.addEventListener("click", () => copierLien(livre));

  actions.append(telecharger, lire, partager);
  corps.append(titre, meta, actions);
  li.append(couv, corps);
  return li;
}

async function copierLien(livre) {
  const url = new URL(location.pathname, location.origin);
  url.searchParams.set("q", livre.titre);
  try {
    await navigator.clipboard.writeText(url.href);
    notifier("Lien copié");
  } catch {
    window.prompt("Copiez ce lien :", url.href);
  }
}

let minuteurToast;
function notifier(texte) {
  const toast = $("toast");
  toast.textContent = texte;
  toast.classList.add("visible");
  clearTimeout(minuteurToast);
  minuteurToast = setTimeout(() => toast.classList.remove("visible"), 1800);
}

function correspond(livre, mots) {
  return mots.every((m) => livre.cle.includes(m));
}

function afficher() {
  const mots = normaliser(etat.q).split(" ").filter(Boolean);
  const trouves = etat.livres.filter((l) => correspond(l, mots));
  let resultats = etat.categorie === TOUTES ? trouves : trouves.filter((l) => l.categorie === etat.categorie);
  if (etat.tri === "taille-desc") resultats = [...resultats].sort((a, b) => b.taille - a.taille);
  else if (etat.tri === "taille-asc") resultats = [...resultats].sort((a, b) => a.taille - b.taille);

  $("liste").replaceChildren(...resultats.map((l, i) => creerCarte(l, mots, i)));

  // Les compteurs des catégories suivent la recherche en cours.
  const parCategorie = new Map();
  for (const l of trouves) parCategorie.set(l.categorie, (parCategorie.get(l.categorie) || 0) + 1);
  for (const puce of $("categories").children) {
    const nom = puce.dataset.categorie;
    const n = nom === TOUTES ? trouves.length : parCategorie.get(nom) || 0;
    puce.querySelector(".nb").textContent = n;
    puce.classList.toggle("zero-resultat", n === 0);
    puce.setAttribute("aria-pressed", String(nom === etat.categorie));
  }

  const total = etat.livres.length;
  const n = resultats.length;
  $("compte").textContent = n === total ? `${total} livres` : `${n} livre${n > 1 ? "s" : ""} sur ${total}`;
  $("vide").hidden = n > 0;
  if (n === 0) $("vide-q").textContent = etat.q || etat.categorie;
  synchroniserUrl();
}

// L'URL garde la recherche (?q=python&cat=Programmation) pour partager un lien direct.
function synchroniserUrl() {
  const params = new URLSearchParams();
  if (etat.q) params.set("q", etat.q);
  if (etat.categorie !== TOUTES) params.set("cat", etat.categorie);
  if (etat.tri !== "titre") params.set("tri", etat.tri);
  const chaine = params.toString();
  history.replaceState(null, "", chaine ? `?${chaine}` : location.pathname);
}

function creerPuce(nom) {
  const puce = element("button", "puce");
  puce.type = "button";
  puce.dataset.categorie = nom;
  if (nom !== TOUTES) {
    puce.style.setProperty("--couleur", couleur(nom));
    puce.append(element("span", "point"));
  }
  puce.append(element("span", "", nom), element("span", "nb"));
  puce.addEventListener("click", () => {
    etat.categorie = nom;
    afficher();
  });
  return puce;
}

function construireCategories() {
  const noms = [...new Set(etat.livres.map((l) => l.categorie))].sort((a, b) =>
    a === "Divers" ? 1 : b === "Divers" ? -1 : a.localeCompare(b, "fr"));
  $("categories").replaceChildren(...[TOUTES, ...noms].map(creerPuce));
  $("stat-categories").textContent = noms.length;
  return noms;
}

function construireSuggestions() {
  const exemples = ["python", "c++", "php", "linux", "photoshop", "latex", "réseaux", "jeux"];
  $("suggestions").replaceChildren(...exemples.map((mot) => {
    const b = element("button", "puce", mot);
    b.type = "button";
    b.addEventListener("click", () => {
      etat.q = champ.value = mot;
      etat.categorie = TOUTES;
      afficher();
    });
    return b;
  }));
}

function afficherSquelettes() {
  $("liste").replaceChildren(...Array.from({ length: 9 }, () => element("li", "squelette")));
}

async function demarrer() {
  afficherSquelettes();
  try {
    const reponse = await fetch("catalogue.json");
    if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`);
    const { depot, livres } = await reponse.json();
    etat.livres = livres.map((l) => ({ ...l, cle: normaliser(l.titre) }));
    $("lien-depot").href = `https://github.com/${depot}`;
  } catch (erreur) {
    $("liste").replaceChildren();
    $("compte").textContent = `Le catalogue n'a pas pu être chargé (${erreur.message}). Rechargez la page.`;
    return;
  }

  const total = etat.livres.reduce((s, l) => s + l.taille, 0);
  $("stat-livres").textContent = etat.livres.length;
  $("stat-taille").textContent = total >= 1024 ** 3
    ? `${(total / 1024 ** 3).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Go`
    : formaterTaille(total);

  const noms = construireCategories();
  construireSuggestions();

  const params = new URLSearchParams(location.search);
  etat.q = params.get("q") || "";
  etat.categorie = noms.includes(params.get("cat")) ? params.get("cat") : TOUTES;
  etat.tri = params.get("tri") || "titre";
  champ.value = etat.q;
  selectTri.value = etat.tri;
  afficher();
}

champ.addEventListener("input", () => { etat.q = champ.value; afficher(); });
selectTri.addEventListener("change", () => { etat.tri = selectTri.value; afficher(); });

// « / » place le curseur dans la recherche, « Échap » la vide.
document.addEventListener("keydown", (e) => {
  if (e.key === "/" && !["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    e.preventDefault();
    champ.focus();
    champ.select();
  } else if (e.key === "Escape" && document.activeElement === champ && champ.value) {
    champ.value = "";
    etat.q = "";
    afficher();
  }
});

// Ombre sous la barre de recherche une fois qu'elle colle en haut.
const barre = $("barre");
new IntersectionObserver(([entree]) => barre.classList.toggle("decollee", entree.intersectionRatio === 0))
  .observe(document.querySelector(".hero"));

// Thème : automatique (système) → clair → sombre.
const boutonTheme = $("theme");
const MODES = ["auto", "light", "dark"];
const LIBELLES = { auto: "Thème automatique", light: "Thème clair", dark: "Thème sombre" };
function appliquerTheme(mode) {
  if (mode === "auto") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = mode;
  boutonTheme.dataset.mode = mode;
  boutonTheme.title = `${LIBELLES[mode]} (cliquer pour changer)`;
  try {
    if (mode === "auto") localStorage.removeItem("theme");
    else localStorage.setItem("theme", mode);
  } catch {}
}
appliquerTheme(document.documentElement.dataset.theme || "auto");
boutonTheme.addEventListener("click", () => {
  const suivant = MODES[(MODES.indexOf(boutonTheme.dataset.mode) + 1) % MODES.length];
  appliquerTheme(suivant);
  notifier(LIBELLES[suivant]);
});

demarrer();
