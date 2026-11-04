<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dish;
use Illuminate\Http\Request;

class DishController extends Controller
{
    // Afficher la liste de tous les plats avec leur catégorie
    public function index()
    {
        $dishes = Dish::with('category')->get();
        return response()->json($dishes);
    }

    // Enregistrer un nouveau plat
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|string',
            'is_available' => 'boolean',
        ]);

        $dish = Dish::create($validated);

        return response()->json([
            'message' => 'Plat créé avec succès !',
            'data' => $dish
        ], 201);
    }

    // Afficher un plat spécifique
    public function show(Dish $dish)
    {
        return response()->json($dish->load('category'));
    }

    // Mettre à jour un plat
    public function update(Request $request, Dish $dish)
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'image' => 'nullable|string',
            'is_available' => 'boolean',
        ]);

        $dish->update($validated);

        return response()->json([
            'message' => 'Plat mis à jour avec succès !',
            'data' => $dish
        ]);
    }

    // Supprimer un plat
    public function destroy(Dish $dish)
    {
        $dish->delete();

        return response()->json([
            'message' => 'Plat supprimé avec succès !'
        ]);
    }
}