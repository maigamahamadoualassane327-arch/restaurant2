<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DishController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Routes pour les catégories (CRUD complet)
Route::apiResource('categories', CategoryController::class);

// Routes pour les plats (CRUD complet)
Route::apiResource('dishes', DishController::class);

// Routes pour les commandes
// Route spécifique pour changer le statut d'une commande
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('orders', OrderController::class);
    Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus']);
});

// Route de connexion pour le frontend
Route::post('/login', [AuthController::class, 'login']);

// Route pour récupérer l'utilisateur connecté via Sanctum
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});