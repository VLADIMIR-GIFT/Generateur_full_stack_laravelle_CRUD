<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('oeuvre', function (Blueprint $table) {
            $table->increments('idOeuvre');
            $table->string('nom')->nullable();
            $table->string('description')->nullable();
            $table->string('annee')->nullable();
            $table->foreignId('idArtiste')->constrained('artiste');
            $table->foreignId('idCategorie')->constrained('categorie');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('oeuvre');
    }
};
