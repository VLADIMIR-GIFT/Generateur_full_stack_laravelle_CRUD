<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Artiste;
use App\Models\Categorie;

class Oeuvre extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'description',
        'annee',
        'idArtiste',
        'idCategorie'
    ];
    public function artiste() {
        return $this->belongsTo(Artiste::class, 'idArtiste');
    }

    public function categorie() {
        return $this->belongsTo(Categorie::class, 'idCategorie');
    }

}
