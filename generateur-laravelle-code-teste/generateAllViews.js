const path = require('path');
require('dotenv').config();

const mysql = require('mysql2/promise');
const fs = require('fs');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

function toPascalCase(str) {
  return str.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}

function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function makeLabel(fieldName) {
  return fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getRelationVariableName(columnName) {
  return columnName.endsWith('_id')
    ? columnName.replace(/_id$/, 's').toLowerCase()
    : columnName.toLowerCase();
}

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

function singularize(str) {
  return str.endsWith('ies')
    ? str.slice(0, -3) + 'y'
    : str.endsWith('s')
    ? str.slice(0, -1)
    : str;
}

function detectInputType(type) {
  if (type.includes('int')) return 'number';
  if (type.includes('email')) return 'email';
  if (type.includes('password')) return 'password';
  if (type.includes('file')) return 'file';
  if (type.includes('text')) return 'textarea';
  if (type.includes('date')) return 'date';
  if (type.startsWith('tinyint(1)')) return 'checkbox';
  return 'text';
}

function getInputField(column, modelVar) {
  const inputType = detectInputType(column.type);

  if (column.name.endsWith('_id')) {
    const relatedTable = getRelationVariableName(column.name);
    return `<div class="mb-3">
    <label class="form-label">${makeLabel(column.name)}</label>
    <select name="${column.name}" class="form-control">
        @foreach ($${relatedTable} as $option)
            <option value="{{ $option->id }}" {{ old('${column.name}', $${modelVar}->${column.name} ?? '') == $option->id ? 'selected' : '' }}>
                {{ $option->nom ?? $option->name ?? $option->label ?? $option->id }}
            </option>
        @endforeach
    </select>
</div>`;
  }

  if (inputType === 'textarea') {
    return `<div class="mb-3">
    <label class="form-label">${makeLabel(column.name)}</label>
    <textarea name="${column.name}" class="form-control" ${column.nullable ? '' : 'required'}>{{ old('${column.name}', $${modelVar}->${column.name} ?? '') }}</textarea>
</div>`;
  }

  if (inputType === 'checkbox') {
    return `<div class="form-check mb-3">
    <input type="checkbox" class="form-check-input" name="${column.name}" value="1" {{ old('${column.name}', $${modelVar}->${column.name} ?? false) ? 'checked' : '' }}>
    <label class="form-check-label">${makeLabel(column.name)}</label>
</div>`;
  }

  return `<div class="mb-3">
    <label class="form-label">${makeLabel(column.name)}</label>
    <input type="${inputType}" name="${column.name}" class="form-control" value="{{ old('${column.name}', $${modelVar}->${column.name} ?? '') }}" ${column.nullable ? '' : 'required'}>
    @error('${column.name}') <div class="text-danger">{{ $message }}</div> @enderror
</div>`;
}

async function generateBladeViews(tableName) {
  const columns = await getTableStructure(tableName);
  const viewFolder = path.join(__dirname, 'resources', 'views', tableName);
  if (!fs.existsSync(viewFolder)) fs.mkdirSync(viewFolder, { recursive: true });

  const kebabName = tableName.toLowerCase();
  const camelName = toCamelCase(tableName);
  const singularName = singularize(camelName);
  const pluralName = camelName ;

  const indexTemplate = `
@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Liste des ${makeLabel(tableName)}</h1>
    <a href="{{ route('${kebabName}.create') }}" class="btn btn-primary mb-3">Ajouter</a>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    <table class="table table-bordered">
        <thead>
            <tr>
                ${columns.filter(col => !['id', 'created_at', 'updated_at'].includes(col.name)).map(col => `<th>${makeLabel(col.name)}</th>`).join('\n                ')}
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($${pluralName} as $item)
            <tr>
                ${columns.filter(col => !['id', 'created_at', 'updated_at'].includes(col.name)).map(col => `<td>{{ $item->${col.name} }}</td>`).join('\n                ')}
                <td>
                    <a href="{{ route('${kebabName}.show', $item->id) }}" class="btn btn-sm btn-info">Voir</a>
                    <a href="{{ route('${kebabName}.edit', $item->id) }}" class="btn btn-sm btn-warning">Modifier</a>
                    <form action="{{ route('${kebabName}.destroy', $item->id) }}" method="POST" style="display:inline-block;">
                        @csrf
                        @method('DELETE')
                        <button class="btn btn-sm btn-danger" onclick="return confirm('Supprimer ?')">Supprimer</button>
                    </form>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endsection`;

  const formFields = columns
    .filter(col => !['id', 'created_at', 'updated_at'].includes(col.name))
    .map(col => getInputField(col, singularName))
    .join('\n');

  const formPartial = `
@if(session('success'))
    <div class="alert alert-success">{{ session('success') }}</div>
@endif

@if($errors->any())
    <div class="alert alert-danger">
        <ul>@foreach ($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul>
    </div>
@endif

${formFields}
<button class="btn btn-success">Enregistrer</button>`;

  const createTemplate = `
@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Créer une ${makeLabel(tableName)}</h1>
    <form action="{{ route('${kebabName}.store') }}" method="POST">
        @csrf
        @include('${kebabName}._form')
    </form>
</div>
@endsection`;

  const editTemplate = `
@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Modifier une ${makeLabel(tableName)}</h1>
    <form action="{{ route('${kebabName}.update', $${singularName}->id) }}" method="POST">
        @csrf
        @method('PUT')
        @include('${kebabName}._form')
    </form>
</div>
@endsection`;

  const showTemplate = `
@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Détail de ${makeLabel(tableName)}</h1>
    <ul class="list-group">
        ${columns.filter(col => col.name !== 'id').map(col => `<li class="list-group-item"><strong>${makeLabel(col.name)} :</strong> {{ $${singularName}->${col.name} }}</li>`).join('\n        ')}
    </ul>
    <a href="{{ route('${kebabName}.index') }}" class="btn btn-secondary mt-3">Retour</a>
</div>
@endsection`;

  fs.writeFileSync(path.join(viewFolder, 'index.blade.php'), indexTemplate);
  fs.writeFileSync(path.join(viewFolder, 'create.blade.php'), createTemplate);
  fs.writeFileSync(path.join(viewFolder, 'edit.blade.php'), editTemplate);
  fs.writeFileSync(path.join(viewFolder, 'show.blade.php'), showTemplate);
  fs.writeFileSync(path.join(viewFolder, '_form.blade.php'), formPartial);

  console.log(`✔️ Vues Blade générées pour ${tableName}`);
}

async function generateAllViews() {
  const tables = await getTables();
  for (const table of tables) {
    await generateBladeViews(table);
  }
  console.log('\n🎉 Toutes les vues ont été générées !');
}

generateAllViews().catch(console.error);
