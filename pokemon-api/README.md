# API de Cartes Pokémon

Une API RESTful simple pour gérer une collection de cartes Pokémon.

## Installation

```bash
npm install
```

## Démarrage

```bash
node index.js
```

Le serveur démarrera sur `http://localhost:3000`.

## Points d'Accès (Endpoints)

### GET /cards
Récupère toutes les cartes de la collection.

### GET /cards/:id
Récupère une carte spécifique par son ID.

### POST /cards
Ajoute une nouvelle carte.

Corps de la requête :
```json
{
    "nom": "Pikachu",
    "photo": "url_de_la_photo",
    "degats": 60,
    "pv": 100
}
```

### PUT /cards/:id
Met à jour une carte existante.

Corps de la requête :
```json
{
    "nom": "Pikachu",
    "photo": "url_de_la_photo",
    "degats": 60,
    "pv": 100
}
```

### DELETE /cards/:id
Supprime une carte par son ID.

## Codes de Statut

- 200 : Succès
- 201 : Création réussie
- 204 : Suppression réussie
- 400 : Requête mal formée
- 404 : Ressource non trouvée 