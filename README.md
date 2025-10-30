# PrintManage

Application web de gestion d'imprimantes: parc, mouvements, interventions, quotas, rapports PDF et analytics.

### Architecture
- **Backend**: Laravel 10 (PHP ≥ 8.1), Sanctum (auth API), Vite (assets), DOMPDF pour les rapports (`barryvdh/laravel-dompdf`), Log Viewer (`rap2hpoutre/laravel-log-viewer`).
- **Base de données**: MySQL par défaut (configurable via `DB_CONNECTION`).
- **Frontend**: Assets gérés par Vite dans `backend/resources/js` et `backend/resources/css`. Un dossier `frontend/build` contient des assets statiques (optionnels) d'une SPA déjà construite.

### Fonctionnalités principales
- Authentification (login, register, reset password) via API Sanctum.
- Gestion des imprimantes, modèles, marques, mouvements et quotas.
- Gestion des sociétés, départements, utilisateurs et interventions.
- Tableau de bord et analytics (statistiques, erreurs fréquentes, priorités).
- Génération de rapports PDF (quotas: groupé et individuel).
- Servir des fichiers depuis le stockage applicatif via API.

### Prérequis
- PHP 8.1+
- Composer
- Node.js 18+ et npm
- MySQL (ou autre SGBD supporté par Laravel)

### Installation et démarrage (développement)
1) Cloner le dépôt

```bash
git clone <votre-fork-ou-ssh> PrintManage
cd PrintManage/backend
```

2) Dépendances backend et clé d'application

```bash
composer install
cp .env.example .env   # sur Windows: copy .env.example .env
php artisan key:generate
```

3) Configurer la base de données dans `.env`

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=printmanage
DB_USERNAME=root
DB_PASSWORD=secret
```

4) Migrations, lien de stockage et jeux de données

```bash
php artisan migrate --seed
php artisan storage:link
```

5) Dépendances front (assets Laravel) et lancement Vite

```bash
npm install
npm start
```

6) Lancer le serveur Laravel

```bash
php artisan serve
```

Par défaut:
- API: `http://127.0.0.1:8000/api`
- Vite (HMR): se connecte automatiquement via le plugin Laravel Vite.

### Scripts utiles
Dans `backend/package.json`:
- `npm run dev` : Vite en mode développement
- `npm run build` : build de production des assets

### Points d'API (aperçu)
Base: `/api`
- Auth: `POST /login`, `POST /register`, `POST /forgot-password`, `POST /reset-password`
- Utilisateur courant: `GET /user` (protégé Sanctum)
- Imprimantes: `GET/POST/PUT/DELETE /printers`, recherche `GET /printers/search`, compteurs `GET /printers/counts`, mouvement `PUT /printers/{printer}/move`, historiques `GET /printer-movements`
- Modèles: `GET/POST /printer-models`, REST `apiResource printer-models`
- Marques: `GET/POST /brands`, REST `apiResource brands`
- Interventions: `apiResource interventions`, stats diverses et par périodes
- Entreprises/Départements/Utilisateurs: `apiResource companies/departments/users`
- Quotas: `apiResource quotas`, rapports: `GET /quotas/report` (groupe), `GET /quotas/{quota}/report` (individuel)
- Analytics: `/analytics/*` (overview, companies, frequent-errors, printers-attention, etc.)
- Fichiers stockage: `GET /storage/{filename}`

Note: La majorité des routes métier sont protégées par Sanctum (`auth:sanctum`). Voir `backend/routes/api.php` pour le détail complet.

### Génération de rapports PDF
Le projet utilise `barryvdh/laravel-dompdf` pour produire des rapports (quotas). Assurez-vous que les vues et polices nécessaires sont disponibles. Les endpoints de rapports sont listés ci-dessus.

### Dossier `frontend/build`
Ce dossier contient une build statique d'une SPA (par ex. React). Elle n'est pas requise pour le fonctionnement du backend Laravel. Vous pouvez la servir via un serveur statique si besoin. L'interface utilisée par défaut côté Laravel est gérée par Vite (`resources/js`, `resources/css`).

### Déploiement (aperçu)
- Construire les assets: `npm run build`
- Mettre à jour les dépendances backend: `composer install --no-dev --optimize-autoloader`
- Migrer: `php artisan migrate --force`
- Mettre en cache la config/routes: `php artisan config:cache && php artisan route:cache && php artisan view:cache`

### Dépannage
- Erreurs d'accès API: vérifier le token/état de Sanctum et `SESSION_DOMAIN`/`SANCTUM_STATEFUL_DOMAINS` si front séparé.
- 404 sur fichiers `storage`: vérifier `php artisan storage:link` et les chemins.
- Problèmes d'assets: relancer `npm run dev` ou refaire `npm run build`.

### Licence
MIT — voir `backend/composer.json` et inclure une licence si nécessaire dans la racine du projet.
