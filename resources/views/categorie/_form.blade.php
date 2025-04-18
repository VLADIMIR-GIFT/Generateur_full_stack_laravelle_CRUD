
@if(session('success'))
    <div class="alert alert-success">{{ session('success') }}</div>
@endif

@if($errors->any())
    <div class="alert alert-danger">
        <ul>@foreach ($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul>
    </div>
@endif

<div class="mb-3">
    <label class="form-label">IdCategorie</label>
    <input type="number" name="idCategorie" class="form-control" value="{{ old('idCategorie', $categorie->idCategorie ?? '') }}" required>
    @error('idCategorie') <div class="text-danger">{{ $message }}</div> @enderror
</div>
<div class="mb-3">
    <label class="form-label">NomCategorie</label>
    <input type="text" name="nomCategorie" class="form-control" value="{{ old('nomCategorie', $categorie->nomCategorie ?? '') }}" >
    @error('nomCategorie') <div class="text-danger">{{ $message }}</div> @enderror
</div>
<button class="btn btn-success">Enregistrer</button>