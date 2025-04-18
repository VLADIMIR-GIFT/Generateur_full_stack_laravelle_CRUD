const path = require('path');
require('dotenv').config();

const mysql = require('mysql2/promise');
const fs = require('fs');

// Conversion vers PascalCase
function toPascalCase(str) {
  return str.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}

// Conversion vers camelCase
function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

// Singularisation basique
function singularize(str) {
  return str.endsWith('ies') ? str.slice(0, -3) + 'y' : (str.endsWith('s') ? str.slice(0, -1) : str);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function getTables() {
  const [rows] = await pool.query("SHOW TABLES");
  return rows.map(row => Object.values(row)[0]);
}

async function getTableStructure(tableName) {
  const [columns] = await pool.query(`SHOW COLUMNS FROM \`${tableName}\``);
  return columns.map(column => ({
    name: column.Field,
    type: column.Type,
    nullable: column.Null === 'YES',
    key: column.Key,
    default: column.Default,
    extra: column.Extra
  }));
}

async function generateLaravelController(tableName) {
  const singularName = singularize(tableName);
  const className = toPascalCase(singularName);
  const variableName = toCamelCase(singularName);
  const controllerFolder = path.join(__dirname,  'app', 'Http', 'Controllers');
  const controllerPath = path.join(controllerFolder, `${className}Controller.php`);
  fs.mkdirSync(path.dirname(controllerPath), { recursive: true });

  const columns = await getTableStructure(tableName);

  const validationRules = columns
    .filter(col => col.name !== 'id' && col.extra !== 'auto_increment')
    .map(col => {
      let rule = `'${col.name}' => 'required'`;
      if (col.name.includes('email')) rule = `'${col.name}' => 'required|email'`;
      if (col.nullable) rule = `'${col.name}' => 'nullable'`;
      return rule;
    }).join(',\n            ');

  const content = `<?php

namespace App\\Http\\Controllers;

use App\\Models\\${className};
use Illuminate\\Http\\Request;

class ${className}Controller extends Controller
{
    public function index()
    {
        \$${variableName}s = ${className}::all();
        return view('${tableName}.index', compact('${variableName}s'));
    }

    public function create()
    {
        return view('${tableName}.create');
    }

    public function store(Request \$request)
    {
        \$validated = \$request->validate([
            ${validationRules}
        ]);

        ${className}::create(\$validated);

        return redirect()->route('${tableName}.index')->with('success', 'Ajout effectué avec succès.');
    }

    public function show(\$id)
    {
        \$${variableName} = ${className}::findOrFail(\$id);
        return view('${tableName}.show', compact('${variableName}'));
    }

    public function edit(\$id)
    {
        \$${variableName} = ${className}::findOrFail(\$id);
        return view('${tableName}.edit', compact('${variableName}'));
    }

    public function update(Request \$request, \$id)
    {
        \$validated = \$request->validate([
            ${validationRules}
        ]);

        \$${variableName} = ${className}::findOrFail(\$id);
        \$${variableName}->update(\$validated);

        return redirect()->route('${tableName}.index')->with('success', 'Mise à jour réussie.');
    }

    public function destroy(\$id)
    {
        \$${variableName} = ${className}::findOrFail(\$id);
        \$${variableName}->delete();

        return redirect()->route('${tableName}.index')->with('success', 'Suppression réussie.');
    }
}
`;

  fs.writeFileSync(controllerPath, content);
  console.log(`✔️ ${className}Controller généré avec succès.`);
}

async function generateAllControllers() {
  const tables = await getTables();
  for (const table of tables) {
    await generateLaravelController(table);
  }
  console.log('\n🎉 Tous les contrôleurs ont été générés avec succès !');
}

generateAllControllers().catch(console.error);
