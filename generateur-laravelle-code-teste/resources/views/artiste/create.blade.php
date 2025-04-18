@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Créer une Artiste</h1>
    <form action="{{ route('artiste.store') }}" method="POST">
        @csrf
        @include('artiste._form')
    </form>
</div>
@endsection