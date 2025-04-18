
@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Liste des Oeuvre</h1>
    <a href="{{ route('oeuvre.create') }}" class="btn btn-primary mb-3">Ajouter</a>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    <table class="table table-bordered">
        <thead>
            <tr>
                <th>IdOeuvre</th>
                <th>Nom</th>
                <th>Description</th>
                <th>Annee</th>
                <th>IdArtiste</th>
                <th>IdCategorie</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($oeuvre as $item)
            <tr>
                <td>{{ $item->idOeuvre }}</td>
                <td>{{ $item->nom }}</td>
                <td>{{ $item->description }}</td>
                <td>{{ $item->annee }}</td>
                <td>{{ $item->idArtiste }}</td>
                <td>{{ $item->idCategorie }}</td>
                <td>
                    <a href="{{ route('oeuvre.show', $item->id) }}" class="btn btn-sm btn-info">Voir</a>
                    <a href="{{ route('oeuvre.edit', $item->id) }}" class="btn btn-sm btn-warning">Modifier</a>
                    <form action="{{ route('oeuvre.destroy', $item->id) }}" method="POST" style="display:inline-block;">
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