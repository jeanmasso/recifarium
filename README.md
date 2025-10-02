# Récifarium — Starter (dépendances + préparation GitHub)

Ce pack te donne **les commandes et fichiers de configuration** pour démarrer vite le projet *front-only*.

## 1) Prérequis
- **Node.js 20+** (LTS recommandé)
- **npm 9+** (ou pnpm/yarn si tu préfères)
- (Optionnel) **GitHub CLI**: `gh`

## 2) Création du projet (Vite + React + TS)
```bash
# 1) Génère le squelette Vite
npm create vite@latest recifarium -- --template react-ts
cd recifarium

# 2) Installe les dépendances runtime (3D + state)
npm i three @react-three/fiber @react-three/drei zustand

# 3) Dépendances de dev (qualité + tests)
npm i -D typescript @types/node eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier eslint-config-prettier        vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom        husky lint-staged

# 4) Initialisation Husky (hooks git)
npx husky init
# puis remplace le contenu de .husky/pre-commit par:  npx lint-staged
echo "npx lint-staged" > .husky/pre-commit
chmod +x .husky/pre-commit

# 5) Copie les fichiers de ce pack à la racine du projet
#   (README, .gitignore, .prettierrc, .eslintrc.cjs, netlify.toml, etc.)
#   -> Voir plus bas : section 'Installation du pack'
```

## 3) Scripts npm à ajouter dans `package.json`
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint . --ext .ts,.tsx --cache",
    "format": "prettier . --write"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix --cache", "prettier --write"],
    "*.{css,md,json}": ["prettier --write"]
  }
}
```

## 4) Préparation du repo Git
```bash
# À la racine du projet 'recifarium'
git init -b main
git add .
git commit -m "chore: bootstrap Vite React TS + tooling"

# Option A) Créer le dépôt avec GitHub CLI
gh repo create recifarium --public --source=. --remote=origin --push

# Option B) Manuellement
# 1) Crée un repo vide sur GitHub nommé 'recifarium'
# 2) Associe-le localement et pousse :
git remote add origin https://github.com/<ton-user>/recifarium.git
git push -u origin main
```

## 5) Netlify (déploiement)
- **Build command** : `npm run build`
- **Publish directory** : `dist`
- Ajoute `netlify.toml` (fourni) pour la redirection SPA.

## 6) Installation du pack
Télécharge l’archive **recifarium-starter-config.zip** (liens ci-dessous) puis **décompresse** son contenu dans le dossier du projet `recifarium/`.  
Tu peux remplacer/compléter les fichiers existants si Vite en a créés.
