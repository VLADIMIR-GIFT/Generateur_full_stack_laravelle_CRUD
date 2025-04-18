
@if(session('success'))
    <div class="alert alert-success">{{ session('success') }}</div>
@endif

@if($errors->any())
    <div class="alert alert-danger">
        <ul>@foreach ($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul>
    </div>
@endif

<div class="mb-3">
    <label class="form-label">IdArtiste</label>
    <input type="number" name="idArtiste" class="form-control" value="{{ old('idArtiste', $artiste->idArtiste ?? '') }}" required>
    @error('idArtiste') <div class="text-danger">{{ $message }}</div> @enderror
</div>
<div class="mb-3">
    <label class="form-label">Nom</label>
    <input type="text" name="nom" class="form-control" value="{{ old('nom', $artiste->nom ?? '') }}" >
    @error('nom') <div class="text-danger">{{ $message }}</div> @enderror
</div>
<div class="mb-3">
    <label class="form-label">Prenom</label>
    <input type="text" name="prenom" class="form-control" value="{{ old('prenom', $artiste->prenom ?? '') }}" >
    @error('prenom') <div class="text-danger">{{ $message }}</div> @enderror
</div>
<div class="mb-3">
    <label class="form-label">Telephone</label>
    <input type="text" name="telephone" class="form-control" value="{{ old('telephone', $artiste->telephone ?? '') }}" >
    @error('telephone') <div class="text-danger">{{ $message }}</div> @enderror
</div>
<button class="btn btn-success">Enregistrer</button>