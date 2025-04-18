
@if(session('success'))
    <div class="alert alert-success">{{ session('success') }}</div>
@endif

@if($errors->any())
    <div class="alert alert-danger">
        <ul>@foreach ($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul>
    </div>
@endif

<div class="mb-3">
    <label class="form-label">IdOeuvre</label>
    <input type="number" name="idOeuvre" class="form-control" value="{{ old('idOeuvre', $oeuvre->idOeuvre ?? '') }}" required>
    @error('idOeuvre') <div class="text-danger">{{ $message }}</div> @enderror
</div>
<div class="mb-3">
    <label class="form-label">Nom</label>
    <input type="text" name="nom" class="form-control" value="{{ old('nom', $oeuvre->nom ?? '') }}" >
    @error('nom') <div class="text-danger">{{ $message }}</div> @enderror
</div>
<div class="mb-3">
    <label class="form-label">Description</label>
    <input type="text" name="description" class="form-control" value="{{ old('description', $oeuvre->description ?? '') }}" >
    @error('description') <div class="text-danger">{{ $message }}</div> @enderror
</div>
<div class="mb-3">
    <label class="form-label">Annee</label>
    <input type="text" name="annee" class="form-control" value="{{ old('annee', $oeuvre->annee ?? '') }}" >
    @error('annee') <div class="text-danger">{{ $message }}</div> @enderror
</div>
<div class="mb-3">
    <label class="form-label">IdArtiste</label>
    <input type="number" name="idArtiste" class="form-control" value="{{ old('idArtiste', $oeuvre->idArtiste ?? '') }}" >
    @error('idArtiste') <div class="text-danger">{{ $message }}</div> @enderror
</div>
<div class="mb-3">
    <label class="form-label">IdCategorie</label>
    <input type="number" name="idCategorie" class="form-control" value="{{ old('idCategorie', $oeuvre->idCategorie ?? '') }}" >
    @error('idCategorie') <div class="text-danger">{{ $message }}</div> @enderror
</div>
<button class="btn btn-success">Enregistrer</button>