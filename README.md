# WEALTH — Tableau de bord patrimonial

Application web complète de suivi patrimonial. Zéro dépendance, 100% vanilla HTML/CSS/JS. Fonctionne en local (`file://`) ou sur n'importe quel hébergeur statique.

## Fonctionnalités

- **Dashboard** — Vue d'ensemble patrimoine net, allocation (donut), projection 10 ans, quote du jour
- **Portfolio** — CRUD complet pour PEA, CTO, Crypto, Immobilier et DCA
- **Catalogue** — 15 actifs (ETF, Crypto, Actions) avec recherche et filtres
- **Simulateur** — Calcul d'intérêts composés avec sliders interactifs et 5 scénarios comparés
- **Roadmap** — Timeline vers la liberté financière avec calcul du capital requis
- **Mindset** — 15 citations d'investisseurs + 6 principes fondamentaux
- **Dark mode** — Bascule instantanée light/dark
- **Export/Import** — Sauvegarde et restauration JSON
- **Persistance** — Toutes les données en localStorage

## Structure

```
wealth-tracker/
├── index.html          # Point d'entrée SPA
├── css/
│   └── style.css       # Design system complet (variables, dark mode, responsive)
├── js/
│   ├── data.js         # Données statiques (quotes, catalogue, roadmap, principes)
│   ├── state.js        # Gestion état global + localStorage
│   ├── charts.js       # Graphiques canvas (donut, projection, simulateur)
│   ├── portfolio.js    # CRUD toutes catégories
│   ├── simulator.js    # Calculs intérêts composés + scénarios
│   ├── catalog.js      # Catalogue actifs + filtres + modale d'ajout
│   ├── mindset.js      # Quotes + principes + navigation
│   ├── roadmap.js      # Timeline + objectif liberté financière
│   ├── dashboard.js    # Assemblage dashboard principal
│   └── app.js          # Navigation SPA + init + toast + export/import
├── assets/
│   └── favicon.svg     # Favicon lettre W
└── README.md
```

## Hébergement

### Méthode 1 — GitHub Pages

1. Poussez ce repo sur GitHub
2. Allez dans **Settings > Pages**
3. Source : **Deploy from a branch**
4. Branche : `main` (ou `master`), dossier : `/ (root)`
5. Cliquez **Save**
6. Votre site est live à `https://<user>.github.io/<repo>/`

### Méthode 2 — Hostinger

1. Connectez-vous à votre panel Hostinger
2. Allez dans **Fichiers > Gestionnaire de fichiers**
3. Ouvrez le dossier `public_html`
4. Uploadez **tous les fichiers** du projet (index.html, css/, js/, assets/)
5. Votre site est live à votre domaine

### En local

Double-cliquez sur `index.html` — tout fonctionne en `file://`.

## Technologies

- HTML5 / CSS3 (custom properties, grid, flexbox)
- JavaScript ES5+ (pas de modules, compatibilité maximale)
- Canvas 2D pour les graphiques
- Google Fonts (DM Sans + DM Serif Display)
- localStorage pour la persistance
