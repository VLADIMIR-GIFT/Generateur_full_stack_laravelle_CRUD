const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Utility functions
function toPascalCase(str) {
  return str.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (match, p1) => p1.toUpperCase());
}

function singularize(str) {
  return str.endsWith('ies')
    ? str.slice(0, -3) + 'y'
    : str.endsWith('s')
      ? str.slice(0, -1)
      : str;
}

async function getTables() {
  const [rows] = await pool.query("SHOW TABLES");
  return rows.map(row => Object.values(row)[0]);
}

async function getTableStructure(tableName) {
  const [columns] = await pool.query('SHOW COLUMNS FROM ??', [tableName]);
  return columns.map(col => ({
    name: col.Field,
    type: col.Type,
    nullable: col.Null === 'YES',
    key: col.Key,
    default: col.Default,
    extra: col.Extra,
  }));
}

async function generateLaravelModel(tableName) {
  const columns = await getTableStructure(tableName);
  const className = toPascalCase(singularize(tableName));
  const modelPath = path.join(__dirname, '..', 'output', 'app', 'Models');
  if (!fs.existsSync(modelPath)) fs.mkdirSync(modelPath, { recursive: true });

  const fillable = columns
    .filter(col => col.extra !== 'auto_increment' && col.name !== 'created_at' && col.name !== 'updated_at')
    .map(col => `'${col.name}'`)
    .join(',\n        ');

  const foreignKeys = columns.filter(col => col.name.endsWith('_id') && col.key === 'MUL');

  let relationships = '';
  for (const fk of foreignKeys) {
    const rawRelation = fk.name.replace('_id', '');
    const relation = toCamelCase(singularize(rawRelation));
    const relatedModel = toPascalCase(singularize(rawRelation));
    relationships += `\n    public function ${relation}() {\n        return $this->belongsTo(${relatedModel}::class);\n    }\n`;
  }

  const modelContent = `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;

class ${className} extends Model
{
    use HasFactory;

    protected $fillable = [
        ${fillable}
    ];
${relationships}
}
`;

  fs.writeFileSync(path.join(modelPath, `${className}.php`), modelContent);
  console.log(`✔️ Modèle généré pour ${tableName}`);
}

async function generateAllModels() {
  const tables = await getTables();
  for (const table of tables) {
    await generateLaravelModel(table);
  }
  console.log('\n🎉 Tous les modèles ont été générés avec succès !');
}

// Lancement automatique si appelé directement
if (require.main === module) {
  generateAllModels().catch(console.error);
}

module.exports = { generateLaravelModel };
