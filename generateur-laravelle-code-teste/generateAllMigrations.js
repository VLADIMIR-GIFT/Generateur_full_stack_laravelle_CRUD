const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Chargement des variables d'environnement

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Fonction pour mapper les types MySQL vers Laravel
function mapColumnType(mysqlType) {
  mysqlType = mysqlType.toLowerCase();
  if (mysqlType.includes('int')) return 'integer';
  if (mysqlType.includes('varchar') || mysqlType.includes('char')) return 'string';
  if (mysqlType.includes('text')) return 'text';
  if (mysqlType.includes('date')) return 'date';
  if (mysqlType.includes('timestamp')) return 'timestamp';
  if (mysqlType.includes('float')) return 'float';
  if (mysqlType.includes('double')) return 'float';
  if (mysqlType.includes('decimal')) return 'decimal';
  return 'string';
}

// Obtenir la structure de la table et les clés étrangères
async function getTableStructure(tableName) {
  const [columns] = await pool.query(`SHOW COLUMNS FROM \`${tableName}\``);
  const [createTableResult] = await pool.query(`SHOW CREATE TABLE \`${tableName}\``);
  const createTableStatement = createTableResult[0]['Create Table'];

  const foreignKeys = [];
  const foreignKeyMatches = createTableStatement.match(/FOREIGN KEY \((.*?)\) REFERENCES (.*?) \((.*?)\)/g);
  if (foreignKeyMatches) {
    foreignKeyMatches.forEach(match => {
      const [, rawColumn, rawTable, rawRefColumn] = match.match(/FOREIGN KEY \((.*?)\) REFERENCES (.*?) \((.*?)\)/);
      const column = rawColumn.replace(/`/g, '').trim();
      const referencedTable = rawTable.replace(/`/g, '').trim();
      const referencedColumn = rawRefColumn.replace(/`/g, '').trim();
      foreignKeys.push({ column, referencedTable, referencedColumn });
    });
  }

  return { columns, foreignKeys };
}

// Générer un fichier de migration Laravel
async function generateLaravelMigration(tableName) {
  const { columns, foreignKeys } = await getTableStructure(tableName);
  const foreignKeyColumns = foreignKeys.map(fk => fk.column);

  const migrationFileName = `${Date.now()}_create_${tableName}_table.php`;
  const migrationDir = path.join(__dirname, '..', 'database', 'migrations');

  if (!fs.existsSync(migrationDir)) {
    fs.mkdirSync(migrationDir, { recursive: true });
  }

  const migrationFilePath = path.join(migrationDir, migrationFileName);

  // Colonnes hors foreign keys
  const upStatements = columns
    .filter(col => !foreignKeyColumns.includes(col.Field)) // éviter les doublons
    .map(col => {
      let definition = `$table->${mapColumnType(col.Type)}('${col.Field}')`;
      if (col.Null === 'YES') {
        definition += '->nullable()';
      }
      if (col.Default !== null) {
        definition += `->default('${col.Default}')`;
      }
      if (col.Extra.includes('auto_increment')) {
        definition = `$table->increments('${col.Field}')`;
      }
      return definition + ';';
    });

  // Ajout des foreign keys
  foreignKeys.forEach(fk => {
    upStatements.push(`$table->foreignId('${fk.column}')->constrained('${fk.referencedTable}');`);
  });

  const migrationContent = `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('${tableName}', function (Blueprint $table) {
            ${upStatements.join('\n            ')}
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('${tableName}');
    }
};
`;

  fs.writeFileSync(migrationFilePath, migrationContent);
  console.log(`✔️ Migration for table ${tableName} generated successfully.`);
}

// Générer toutes les migrations
async function generateAllMigrations() {
  const [tables] = await pool.query("SHOW TABLES");
  const tableNames = tables.map(row => Object.values(row)[0]);
  for (const table of tableNames) {
    await generateLaravelMigration(table);
  }
  console.log('🎉 All migrations have been generated!');
}

// Lancer la génération
generateAllMigrations().catch(console.error);
