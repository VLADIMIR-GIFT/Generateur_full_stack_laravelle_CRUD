const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Récupérer toutes les tables
app.get('/database/tables', async (req, res) => {
  try {
    const [tables] = await pool.query("SHOW TABLES");
    res.json(tables.map(row => Object.values(row)[0])); // Extraire les noms des tables
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des tables." });
  }
});

// Récupérer la structure complète d'une table
app.get('/database/structure/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const [columns] = await pool.query('SHOW COLUMNS FROM ??', [table]);

    if (!columns || columns.length === 0) {
      return res.status(400).json({ error: `La table ${table} n'existe pas.` });
    }

    const tableStructure = columns.map(column => ({
      name: column.Field,
      type: column.Type,
      nullable: column.Null === 'YES',
      key: column.Key,
      default: column.Default,
      extra: column.Extra
    }));

    res.json(tableStructure);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
