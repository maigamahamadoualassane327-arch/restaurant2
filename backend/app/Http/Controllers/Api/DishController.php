<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dish;
use Illuminate\Support\Facades\Storage;
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
           'image' => 'nullable|image|max:2048',
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
            'image' => 'nullable|image|max:2048',
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

    if ($dish->orderItems()->exists()) {
        return response()->json([
            'message' => 'Ce plat figure dans des commandes : rendez-le indisponible plutôt que de le supprimer.',
        ], 422);
    }

   if ($dish->image) {
    Storage::disk('public')->delete($dish->image);
    }
    
    $dish->delete();

    return response()->json(['message' => 'Plat supprimé avec succès !']);
  }

  // Envoyer ou remplacer la photo d'un plat
public function uploadImage(Request $request, Dish $dish)
{
    $request->validate([
        'image' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
    ]);

    // On supprime l'ancienne photo pour ne pas garder de fichiers inutiles
    if ($dish->image) {
        Storage::disk('public')->delete($dish->image);
    }

    $path = $request->file('image')->store('dishes', 'public');
    $dish->update(['image' => $path]);

    return response()->json([
        'message' => 'Image enregistrée avec succès !',
        'data' => $dish,
    ]);
}
}