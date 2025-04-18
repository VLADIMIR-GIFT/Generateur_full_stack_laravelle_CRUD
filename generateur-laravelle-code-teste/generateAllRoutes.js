const fs = require('fs');
const path = require('path');
require('dotenv').config();
const mysql = require('mysql2/promise');

// Connexion MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Conversion vers PascalCase
function toPascalCase(str) {
  return str.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}

// Fonction pour mettre les noms au singulier
function singularize(str) {
  return str.endsWith('ies') ? str.slice(0, -3) + 'y' : (str.endsWith('s') ? str.slice(0, -1) : str);
}

// Génère une seule ligne de route pour une table
function generateLaravelRoute(tableName, lines) {
  const singularName = singularize(tableName); // On prend le nom singulier
  const className = toPascalCase(singularName) + 'Controller'; // Nom du contrôleur en PascalCase
  const importLine = `use App\\Http\\Controllers\\${className};`;
  const routeLine = `Route::resource('${tableName}', ${className}::class);`;

  // Ajoute les lignes d'import et de route si elles n'existent pas déjà
  if (!lines.includes(importLine)) lines.push(importLine);
  if (!lines.includes(routeLine)) lines.push(routeLine);
}

// Fonction principale : génère toutes les routes
async function generateAllViews() {
  const [tables] = await pool.query("SHOW TABLES");
  const tableNames = tables.map(row => Object.values(row)[0]);

  const outputDir = path.join(__dirname, 'output', 'routes');
  const routesPath = path.join(outputDir, 'web.php');

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  let lines = [];

  // Si le fichier existe, on le lit, sinon on initialise avec les bases
  if (fs.existsSync(routesPath)) {
    lines = fs.readFileSync(routesPath, 'utf8').split('\n');
  } else {
    lines.push('<?php', '', 'use Illuminate\\Support\\Facades\\Route;', '');
  }

  // Génère les routes pour chaque table
  for (const table of tableNames) {
    generateLaravelRoute(table, lines);
  }

  // Sauvegarde les routes dans le fichier
  fs.writeFileSync(routesPath, lines.join('\n'));
  console.log('\n✅ Toutes les routes ont été générées dans output/routes/web.php');
}

generateAllViews().catch(console.error);
