
@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Créer une Categorie</h1>
    <form action="{{ route('categorie.store') }}" method="POST">
        @csrf
        @include('categorie._form')
    </form>
</div>
@endsection