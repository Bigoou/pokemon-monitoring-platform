# Service de Monitoring et API Pokémon

Ce repository contient deux services :

## 1. API Pokémon Cards (./pokemon-api)
API REST pour la gestion des cartes Pokémon.

### Fonctionnalités
- CRUD des cartes Pokémon
- Stockage persistant en JSON
- Validation des données

### Technologies
- Node.js
- Express
- JSON Storage

## 2. Service de Monitoring (./monitoring-service)
Service de surveillance des APIs avec notifications Discord.

### Fonctionnalités
- Surveillance périodique des endpoints
- Notifications Discord pour les changements d'état
- Mesure des temps de réponse
- Logging détaillé

### Technologies
- Node.js
- Discord Webhooks
- Winston (logging)
- Node-cron

## Installation

```bash
# Installation des dépendances pour les deux services
cd pokemon-api && npm install
cd ../monitoring-service && npm install
```

## Configuration

1. API Pokémon
```bash
cd pokemon-api
cp .env.example .env
# Configurer le port dans .env
```

2. Service de Monitoring
```bash
cd monitoring-service
cp .env.example .env
# Configurer l'URL du webhook Discord et les services à monitorer dans .env
```

## Développement

Chaque service utilise les outils suivants :
- ESLint pour le linting
- Prettier pour le formatage
- Husky pour les hooks Git
- Commitlint pour la validation des messages de commit

### Scripts disponibles

Dans chaque service :
```bash
npm run lint        # Vérifier le code
npm run lint:fix    # Corriger automatiquement les erreurs
npm run format      # Formater le code
```

### Convention de Commit

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
- revert: annulation
- ci: intégration continue
