
@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Modifier une Categorie</h1>
    <form action="{{ route('categorie.update', $categorie->id) }}" method="POST">
        @csrf
        @method('PUT')
        @include('categorie._form')
    </form>
</div>
@endsection