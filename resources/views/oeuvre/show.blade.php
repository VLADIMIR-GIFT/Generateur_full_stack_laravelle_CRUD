
@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Détail de Oeuvre</h1>
    <ul class="list-group">
        <li class="list-group-item"><strong>IdOeuvre :</strong> {{ $oeuvre->idOeuvre }}</li>
        <li class="list-group-item"><strong>Nom :</strong> {{ $oeuvre->nom }}</li>
        <li class="list-group-item"><strong>Description :</strong> {{ $oeuvre->description }}</li>
        <li class="list-group-item"><strong>Annee :</strong> {{ $oeuvre->annee }}</li>
        <li class="list-group-item"><strong>IdArtiste :</strong> {{ $oeuvre->idArtiste }}</li>
        <li class="list-group-item"><strong>IdCategorie :</strong> {{ $oeuvre->idCategorie }}</li>
    </ul>
    <a href="{{ route('oeuvre.index') }}" class="btn btn-secondary mt-3">Retour</a>
</div>
@endsection