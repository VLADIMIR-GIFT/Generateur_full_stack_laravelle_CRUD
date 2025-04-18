
@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Liste des Categorie</h1>
    <a href="{{ route('categorie.create') }}" class="btn btn-primary mb-3">Ajouter</a>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    <table class="table table-bordered">
        <thead>
            <tr>
                <th>IdCategorie</th>
                <th>NomCategorie</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($categorie as $item)
            <tr>
                <td>{{ $item->idCategorie }}</td>
                <td>{{ $item->nomCategorie }}</td>
                <td>
                    <a href="{{ route('categorie.show', $item->id) }}" class="btn btn-sm btn-info">Voir</a>
                    <a href="{{ route('categorie.edit', $item->id) }}" class="btn btn-sm btn-warning">Modifier</a>
                    <form action="{{ route('categorie.destroy', $item->id) }}" method="POST" style="display:inline-block;">
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
@endsection