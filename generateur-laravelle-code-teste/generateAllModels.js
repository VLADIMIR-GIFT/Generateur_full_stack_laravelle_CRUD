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

function toPascalCase(str) {
  return str.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

function toCamelCase(str) {
  return str.charAt(0).toLowerCase() + str.slice(1).replace(/_([a-z])/g, (match, p1) => p1.toUpperCase());
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

async function generateLaravelModel(tableName, hasManyMap, hasOneMap, manyToManyMap) {
  const columns = await getTableStructure(tableName);
  const className = toPascalCase(singularize(tableName));
  const modelPath = path.join(__dirname, 'output', 'app', 'Models');
  if (!fs.existsSync(modelPath)) fs.mkdirSync(modelPath, { recursive: true });

  const fillable = columns
    .filter(col => col.extra !== 'auto_increment' && col.name !== 'created_at' && col.name !== 'updated_at')
    .map(col => `'${col.name}'`)
    .join(',\n        ');

  const foreignKeys = columns.filter(col => /^id[A-Z]/.test(col.name) && col.key === 'MUL');

  let relationships = '';
  const importSet = new Set();

  // belongsTo
  for (const fk of foreignKeys) {
    const rawRelation = fk.name.startsWith('id') ? fk.name.slice(2) : fk.name;
    const relation = toCamelCase(singularize(rawRelation));
    const relatedModel = toPascalCase(singularize(rawRelation));
    relationships += `\n    public function ${relation}() {\n        return \$this->belongsTo(${relatedModel}::class, '${fk.name}');\n    }\n`;
    importSet.add(`use App\\Models\\${relatedModel};`);
  }

  // hasMany
  const hasManyRelations = hasManyMap[tableName] || [];
  for (const related of hasManyRelations) {
    const methodName = toCamelCase(related.table);
    const relatedModel = toPascalCase(singularize(related.table));
    relationships += `\n    public function ${methodName}() {\n        return \$this->hasMany(${relatedModel}::class);\n    }\n`;
    importSet.add(`use App\\Models\\${relatedModel};`);
  }

  // hasOne
  const hasOneRelations = hasOneMap[tableName] || [];
  for (const related of hasOneRelations) {
    const methodName = toCamelCase(related.table);
    const relatedModel = toPascalCase(singularize(related.table));
    relationships += `\n    public function ${methodName}() {\n        return \$this->hasOne(${relatedModel}::class);\n    }\n`;
    importSet.add(`use App\\Models\\${relatedModel};`);
  }

  // manyToMany
  const manyToManyRelations = manyToManyMap[tableName] || [];
  for (const related of manyToManyRelations) {
    const methodName = toCamelCase(related.table);
    const relatedModel = toPascalCase(singularize(related.table));
    relationships += `\n    public function ${methodName}() {\n        return \$this->belongsToMany(${relatedModel}::class);\n    }\n`;
    importSet.add(`use App\\Models\\${relatedModel};`);
  }

  const imports = Array.from(importSet).join('\n');

  const modelContent = `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;
${imports}

class ${className} extends Model
{
    use HasFactory;

    protected \$fillable = [
        ${fillable}
    ];${relationships}
}
`;

  fs.writeFileSync(path.join(modelPath, `${className}.php`), modelContent);
  console.log(`✔️ Modèle généré pour ${tableName}`);
}

async function generateAllModels() {
  const tables = await getTables();
  const hasManyMap = {};
  const hasOneMap = {};
  const manyToManyMap = {};

  for (const table of tables) {
    const columns = await getTableStructure(table);
    const foreignKeys = columns.filter(col => /^id[A-Z]/.test(col.name) && col.key === 'MUL');

    for (const fk of foreignKeys) {
      const parentTable = singularize(fk.name.slice(2)); // remove "id"
      const parent = tables.find(t => singularize(t) === singularize(parentTable));
      if (parent) {
        if (!hasManyMap[parent]) hasManyMap[parent] = [];
        hasManyMap[parent].push({ table });
      }
    }

    const uniqueKeys = columns.filter(col => col.Key === 'UNI');
    for (const unique of uniqueKeys) {
      const parentTable = singularize(table);
      const relatedTable = singularize(unique.name?.slice(2));
      if (relatedTable && parentTable !== relatedTable) {
        if (!hasOneMap[table]) hasOneMap[table] = [];
        hasOneMap[table].push({ table: relatedTable });
      }
    }

    const manyToManyTables = tables.filter(t => t.includes(table) && t !== table);
    for (const joinTable of manyToManyTables) {
      if (!manyToManyMap[table]) manyToManyMap[table] = [];
      manyToManyMap[table].push({ table: joinTable });
    }
  }

  for (const table of tables) {
    await generateLaravelModel(table, hasManyMap, hasOneMap, manyToManyMap);
  }

  console.log('\n🎉 Tous les modèles ont été générés avec succès !');
}

if (require.main === module) {
  generateAllModels().catch(console.error);
}

module.exports = { generateLaravelModel };
