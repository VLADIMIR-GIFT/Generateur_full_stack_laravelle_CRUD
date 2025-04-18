
@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Liste des Artiste</h1>
    <a href="{{ route('artiste.create') }}" class="btn btn-primary mb-3">Ajouter</a>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    <table class="table table-bordered">
        <thead>
            <tr>
                <th>IdArtiste</th>
                <th>Nom</th>
                <th>Prenom</th>
                <th>Telephone</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($artiste as $item)
            <tr>
                <td>{{ $item->idArtiste }}</td>
                <td>{{ $item->nom }}</td>
                <td>{{ $item->prenom }}</td>
                <td>{{ $item->telephone }}</td>
                <td>
                    <a href="{{ route('artiste.show', $item->id) }}" class="btn btn-sm btn-info">Voir</a>
                    <a href="{{ route('artiste.edit', $item->id) }}" class="btn btn-sm btn-warning">Modifier</a>
                    <form action="{{ route('artiste.destroy', $item->id) }}" method="POST" style="display:inline-block;">
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