# Service de Monitoring

Service de surveillance des APIs avec notifications Discord.

## Fonctionnalités

- 🔍 Surveillance périodique des endpoints
- 📊 Mesure des temps de réponse
- 🚨 Notifications Discord pour les changements d'état
- 📝 Logging détaillé avec Winston

## Technologies

- Node.js
- Discord Webhooks
- Winston (logging)
- Node-cron
- Axios

## Installation

```bash
# Installation des dépendances
npm install

# Copier le fichier d'exemple de configuration
cp .env.example .env
```

## Configuration

Éditer le fichier `.env` avec vos paramètres :

```env
# Monitoring Configuration
MONITORING_INTERVAL="*/1 * * * *"  # Cron expression (toutes les minutes par défaut)
REQUEST_TIMEOUT=5000               # Timeout en ms

# Discord Configuration
DISCORD_WEBHOOK_URL=your_discord_webhook_url_here

# Service Configuration
SERVICE_URL=http://localhost:3000/cards
```

## Utilisation

```bash
# Démarrer le service
npm start

# Linting
npm run lint

# Correction automatique du linting
npm run lint:fix

# Formatage du code
npm run format
```

## Structure du Projet

```
.
├── src/
│   ├── alerts/        # Gestion des alertes (Discord)
│   ├── config/        # Configuration
│   ├── cron/          # Tâches planifiées
│   └── utils/         # Utilitaires (logging, etc.)
├── .env.example       # Example de configuration
├── .eslintrc.json    # Configuration ESLint
├── .prettierrc       # Configuration Prettier
└── index.js          # Point d'entrée
```

## Logs

Les logs sont stockés dans le dossier `logs/` avec :
- Rotation automatique des fichiers
- Niveaux de log (info, warn, error)
- Métadonnées structurées

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'feat: add amazing feature'`)
4. Push la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## Convention de Commit

Format : `type: description`

Types disponibles :
- feat: nouvelles fonctionnalités
- fix: corrections de bugs
- docs: documentation
- style: formatage
- refactor: refactoring
- perf: optimisations
- test: tests
- chore: maintenance 