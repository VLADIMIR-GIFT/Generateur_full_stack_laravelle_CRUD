
@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Détail de Categorie</h1>
    <ul class="list-group">
        <li class="list-group-item"><strong>IdCategorie :</strong> {{ $categorie->idCategorie }}</li>
        <li class="list-group-item"><strong>NomCategorie :</strong> {{ $categorie->nomCategorie }}</li>
    </ul>
    <a href="{{ route('categorie.index') }}" class="btn btn-secondary mt-3">Retour</a>
</div>
@endsection