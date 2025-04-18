<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use Illuminate\Http\Request;

class CategorieController extends Controller
{
    public function index()
    {
        $categories = Categorie::all();
        return view('categorie.index', compact('categories'));
    }

    public function create()
    {
        return view('categorie.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nomCategorie' => 'nullable'
        ]);

        Categorie::create($validated);

        return redirect()->route('categorie.index')->with('success', 'Ajout effectué avec succès.');
    }

    public function show($id)
    {
        $categorie = Categorie::findOrFail($id);
        return view('categorie.show', compact('categorie'));
    }

    public function edit($id)
    {
        $categorie = Categorie::findOrFail($id);
        return view('categorie.edit', compact('categorie'));
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nomCategorie' => 'nullable'
        ]);

        $categorie = Categorie::findOrFail($id);
        $categorie->update($validated);

        return redirect()->route('categorie.index')->with('success', 'Mise à jour réussie.');
    }

    public function destroy($id)
    {
        $categorie = Categorie::findOrFail($id);
        $categorie->delete();

        return redirect()->route('categorie.index')->with('success', 'Suppression réussie.');
    }
}
