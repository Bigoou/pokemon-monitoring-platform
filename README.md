# Architecture Microservices de Monitoring

Ce repository contient une architecture microservices complète pour le monitoring de services web.

## Architecture

Le projet est composé de quatre services principaux :

1. **API Pokémon Cards** (`./pokemon-api`) - Service métier à surveiller
2. **Service de Monitoring** (`./service-monitoring`) - Service de surveillance des APIs
3. **Service d'Authentification** (`./auth-service`) - Microservice dédié à l'authentification
4. **Dashboard** (`./dashboard`) - Interface utilisateur pour visualiser les données de monitoring

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

## 2. Service de Monitoring (./service-monitoring)
Service de surveillance des APIs avec notifications Discord et WebSockets.

### Fonctionnalités
- Surveillance périodique des endpoints
- Notifications Discord pour les changements d'état
- Communication en temps réel via WebSockets
- Mesure des temps de réponse
- Logging détaillé
- Authentification JWT

### Technologies
- Node.js
- Express
- Socket.IO
- Discord Webhooks
- Winston (logging)
- Node-cron
- MongoDB
- JWT

## 3. Service d'Authentification (./auth-service)
Microservice dédié à l'authentification des utilisateurs.

### Fonctionnalités
- Authentification via Google OAuth 2.0 et GitHub OAuth
- Gestion des sessions utilisateur
- Génération et validation de JWT
- Stockage des utilisateurs dans MongoDB
- Journalisation des événements d'authentification

### Technologies
- Node.js
- Express
- Passport.js (Google OAuth et GitHub OAuth)
- JWT
- MongoDB
- Winston (logging)

## 4. Dashboard (./dashboard)
Interface utilisateur pour visualiser les données de monitoring en temps réel.

### Fonctionnalités
- Affichage en temps réel de l'état des services
- Graphiques de temps de réponse
- Historique des alertes
- Interface d'administration pour la configuration
- Authentification sécurisée (Google et GitHub)

### Technologies
- React
- TypeScript
- Tailwind CSS
- Socket.IO Client
- React Router
- Recharts

## Installation

```bash
# Installation des dépendances pour tous les services
cd pokemon-api && npm install
cd ../service-monitoring && npm install
cd ../auth-service && npm install
cd ../dashboard && npm install
```

## Configuration

Chaque service possède son propre fichier `.env.example` qui doit être copié en `.env` et configuré :

1. API Pokémon
```bash
cd pokemon-api
cp .env.example .env
# Configurer le port dans .env
```

2. Service de Monitoring
```bash
cd service-monitoring
cp .env.example .env
# Configurer les URLs, MongoDB et le webhook Discord
```

3. Service d'Authentification
```bash
cd auth-service
cp .env.example .env
# Configurer les clés Google OAuth, GitHub OAuth, MongoDB et JWT
```

4. Dashboard
```bash
cd dashboard
cp .env.example .env
# Configurer les URLs des services
```

## Démarrage des services

```bash
# Dans des terminaux séparés
cd pokemon-api && npm run dev
cd service-monitoring && npm run dev
cd auth-service && npm run dev
cd dashboard && npm run dev
```

## Développement

Chaque service utilise les outils suivants :
- ESLint pour le linting
- Prettier pour le formatage

### Scripts disponibles

Dans chaque service :
```bash
npm run dev         # Démarrer en mode développement
npm run lint        # Vérifier le code
npm run lint:fix    # Corriger automatiquement les erreurs
npm run format      # Formater le code
```

## Architecture de communication

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  Dashboard  │◄────┤  Monitoring │◄────┤  Pokémon    │
│  (React)    │     │  Service    │     │  API        │
│             │     │             │     │             │
└──────┬──────┘     └──────┬──────┘     └─────────────┘
       │                   │
       │                   │
       │            ┌──────▼──────┐
       └───────────►│  Auth       │
                    │  Service    │
                    │             │
                    └─────────────┘
```

- Le Dashboard communique avec le Service de Monitoring via WebSockets pour les mises à jour en temps réel
- Le Service de Monitoring surveille l'API Pokémon
- Le Service d'Authentification fournit des JWT pour sécuriser les communications entre les services
- Tous les services utilisent MongoDB pour le stockage persistant
