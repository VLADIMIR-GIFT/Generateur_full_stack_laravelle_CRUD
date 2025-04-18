
@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Créer une Oeuvre</h1>
    <form action="{{ route('oeuvre.store') }}" method="POST">
        @csrf
        @include('oeuvre._form')
    </form>
</div>
@endsection