<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DishController;
use App\Http\Controllers\Api\OrderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Routes pour les catégories (CRUD complet)
Route::apiResource('categories', CategoryController::class);

// Routes pour les plats (CRUD complet)
Route::apiResource('dishes', DishController::class);

// Routes pour les commandes
Route::apiResource('orders', OrderController::class);

// Route spécifique pour permettre au cuisinier/admin de changer le statut d'une commande
Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus']);
// Route spécifique pour permettre a mon front de voir le back
Route::post('/login', [AuthController::class, 'login']);