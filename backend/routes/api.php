<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DishController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Lecture publique du menu
Route::get('categories', [CategoryController::class, 'index']);
Route::get('dishes', [DishController::class, 'index']);

// Modifications : admin seulement
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::apiResource('categories', CategoryController::class)->except(['index']);
    Route::apiResource('dishes', DishController::class)->except(['index']);
    Route::post('dishes/{dish}/image', [DishController::class, 'uploadImage']);
});

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
// Route pour la connection ou la deconnection

Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
