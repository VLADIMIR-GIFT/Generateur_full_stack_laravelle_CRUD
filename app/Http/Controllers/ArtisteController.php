<?php

namespace App\Http\Controllers;

use App\Models\Artiste;
use Illuminate\Http\Request;

class ArtisteController extends Controller
{
    public function index()
    {
        $artistes = Artiste::all();
        return view('artiste.index', compact('artistes'));
    }

    public function create()
    {
        return view('artiste.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'nullable',
            'prenom' => 'nullable',
            'telephone' => 'nullable'
        ]);

        Artiste::create($validated);

        return redirect()->route('artiste.index')->with('success', 'Ajout effectué avec succès.');
    }

    public function show($id)
    {
        $artiste = Artiste::findOrFail($id);
        return view('artiste.show', compact('artiste'));
    }

    public function edit($id)
    {
        $artiste = Artiste::findOrFail($id);
        return view('artiste.edit', compact('artiste'));
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nom' => 'nullable',
            'prenom' => 'nullable',
            'telephone' => 'nullable'
        ]);

        $artiste = Artiste::findOrFail($id);
        $artiste->update($validated);

        return redirect()->route('artiste.index')->with('success', 'Mise à jour réussie.');
    }

    public function destroy($id)
    {
        $artiste = Artiste::findOrFail($id);
        $artiste->delete();

        return redirect()->route('artiste.index')->with('success', 'Suppression réussie.');
    }
}
