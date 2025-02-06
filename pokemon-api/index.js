/**
 * Main entry point for the Pokemon Card API
 * @module index
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data file path
const DATA_FILE = path.join(__dirname, 'data', 'cards.json');

// Ensure data directory and file exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

/**
 * Read cards from JSON file
 * @returns {Array} Array of cards
 */
const readCards = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

/**
 * Write cards to JSON file
 * @param {Array} cards - Array of cards to write
 */
const writeCards = (cards) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(cards, null, 2));
};

// Routes

/**
 * GET /cards - Get all cards
 */
app.get('/cards', (req, res) => {
    const cards = readCards();
    res.json(cards);
});

/**
 * GET /cards/:id - Get a specific card
 */
app.get('/cards/:id', (req, res) => {
    const cards = readCards();
    const card = cards.find(c => c.id === req.params.id);
    
    if (!card) {
        return res.status(404).json({ message: 'Carte non trouvée' });
    }
    
    res.json(card);
});

/**
 * POST /cards - Create a new card
 */
app.post('/cards', (req, res) => {
    const { nom, photo, degats, pv } = req.body;

    if (!nom || !photo || !degats || !pv) {
        return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    const cards = readCards();
    const newCard = {
        id: Date.now().toString(),
        nom,
        photo,
        degats,
        pv
    };

    cards.push(newCard);
    writeCards(cards);

    res.status(201).json(newCard);
});

/**
 * PUT /cards/:id - Update a card
 */
app.put('/cards/:id', (req, res) => {
    const { nom, photo, degats, pv } = req.body;
    const cards = readCards();
    const index = cards.findIndex(c => c.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ message: 'Carte non trouvée' });
    }

    cards[index] = {
        ...cards[index],
        nom: nom || cards[index].nom,
        photo: photo || cards[index].photo,
        degats: degats || cards[index].degats,
        pv: pv || cards[index].pv
    };

    writeCards(cards);
    res.json(cards[index]);
});

/**
 * DELETE /cards/:id - Delete a card
 */
app.delete('/cards/:id', (req, res) => {
    const cards = readCards();
    const index = cards.findIndex(c => c.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ message: 'Carte non trouvée' });
    }

    cards.splice(index, 1);
    writeCards(cards);
    res.status(204).send();
});

// Start server
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
}); 