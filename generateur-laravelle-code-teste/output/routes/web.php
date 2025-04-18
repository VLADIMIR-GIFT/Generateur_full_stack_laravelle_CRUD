<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ArtisteController;
Route::resource('artiste', ArtisteController::class);
use App\Http\Controllers\CategorieController;
Route::resource('categorie', CategorieController::class);
use App\Http\Controllers\OeuvreController;
Route::resource('oeuvre', OeuvreController::class);