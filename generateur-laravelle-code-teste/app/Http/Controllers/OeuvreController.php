<?php

namespace App\Http\Controllers;

use App\Models\Oeuvre;
use Illuminate\Http\Request;

class OeuvreController extends Controller
{
    public function index()
    {
        $oeuvres = Oeuvre::all();
        return view('oeuvre.index', compact('oeuvres'));
    }

    public function create()
    {
        return view('oeuvre.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'nullable',
            'description' => 'nullable',
            'annee' => 'nullable',
            'idArtiste' => 'nullable',
            'idCategorie' => 'nullable'
        ]);

        Oeuvre::create($validated);

        return redirect()->route('oeuvre.index')->with('success', 'Ajout effectué avec succès.');
    }

    public function show($id)
    {
        $oeuvre = Oeuvre::findOrFail($id);
        return view('oeuvre.show', compact('oeuvre'));
    }

    public function edit($id)
    {
        $oeuvre = Oeuvre::findOrFail($id);
        return view('oeuvre.edit', compact('oeuvre'));
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nom' => 'nullable',
            'description' => 'nullable',
            'annee' => 'nullable',
            'idArtiste' => 'nullable',
            'idCategorie' => 'nullable'
        ]);

        $oeuvre = Oeuvre::findOrFail($id);
        $oeuvre->update($validated);

        return redirect()->route('oeuvre.index')->with('success', 'Mise à jour réussie.');
    }

    public function destroy($id)
    {
        $oeuvre = Oeuvre::findOrFail($id);
        $oeuvre->delete();

        return redirect()->route('oeuvre.index')->with('success', 'Suppression réussie.');
    }
}
