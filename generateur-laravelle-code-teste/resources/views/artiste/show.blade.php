
@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Détail de Artiste</h1>
    <ul class="list-group">
        <li class="list-group-item"><strong>IdArtiste :</strong> {{ $artiste->idArtiste }}</li>
        <li class="list-group-item"><strong>Nom :</strong> {{ $artiste->nom }}</li>
        <li class="list-group-item"><strong>Prenom :</strong> {{ $artiste->prenom }}</li>
        <li class="list-group-item"><strong>Telephone :</strong> {{ $artiste->telephone }}</li>
    </ul>
    <a href="{{ route('artiste.index') }}" class="btn btn-secondary mt-3">Retour</a>
</div>
@endsection