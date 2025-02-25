# Microservice d'Authentification

Ce microservice gère l'authentification des utilisateurs via Google OAuth 2.0 et fournit des JWT pour l'authentification entre services.

## Fonctionnalités

- Authentification via Google OAuth 2.0
- Gestion des sessions utilisateur
- Génération et validation de JWT
- Stockage des utilisateurs dans MongoDB
- Journalisation des événements d'authentification

## Installation

1. Cloner le dépôt
2. Installer les dépendances : `npm install`
3. Configurer les variables d'environnement (voir `.env.example`)
4. Démarrer le service : `npm start`

## Configuration

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```
# Server Configuration
PORT=3001
MONITORING_SERVICE_URL=http://localhost:8080
DASHBOARD_URL=http://localhost:5173

# Authentication
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CALLBACK_URL=http://localhost:3001/auth/google/callback

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h

# Database
MONGODB_URI=mongodb://localhost:27017/auth-service
```

## API Endpoints

### Authentification

- `GET /auth/google` - Démarrer l'authentification Google
- `GET /auth/google/callback` - Callback pour l'authentification Google
- `GET /auth/user` - Obtenir les informations de l'utilisateur connecté
- `GET /auth/token` - Obtenir un JWT pour l'utilisateur connecté
- `POST /auth/validate` - Valider un JWT
- `GET /auth/logout` - Déconnecter l'utilisateur

## Développement

- `npm run dev` - Démarrer le service en mode développement avec nodemon
- `npm run lint` - Exécuter ESLint
- `npm run lint:fix` - Corriger les erreurs ESLint
- `npm run format` - Formater le code avec Prettier 