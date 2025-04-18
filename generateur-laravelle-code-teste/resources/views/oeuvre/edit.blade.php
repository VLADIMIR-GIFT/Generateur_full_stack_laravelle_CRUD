
@extends('layouts.app')

@section('content')
<div class="container">
    <h1>Modifier une Oeuvre</h1>
    <form action="{{ route('oeuvre.update', $oeuvre->id) }}" method="POST">
        @csrf
        @method('PUT')
        @include('oeuvre._form')
    </form>
</div>
@endsection