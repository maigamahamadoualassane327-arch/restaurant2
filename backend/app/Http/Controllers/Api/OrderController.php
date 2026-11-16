<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use App\Models\Dish;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // Afficher toutes les commandes (avec le client et les articles commandés)
    public function index(Request $request)
{
    $user = $request->user();

    $query = Order::with(['user', 'orderItems.dish'])->latest();

    // Un client ne voit que ses propres commandes
    if ($user->role === 'client') {
        $query->where('user_id', $user->id);
    }

    return response()->json($query->get());
}

    // Créer une nouvelle commande
    public function store(Request $request)
{
    $validated = $request->validate([
        'notes' => 'nullable|string',
        'items' => 'required|array|min:1',
        'items.*.dish_id' => 'required|exists:dishes,id',
        'items.*.quantity' => 'required|integer|min:1',
    ]);

    $order = DB::transaction(function () use ($validated, $request) {
        // Les vrais prix viennent de la base, pas du navigateur
        $dishes = Dish::whereIn('id', collect($validated['items'])->pluck('dish_id'))
            ->get()
            ->keyBy('id');

        $totalAmount = 0;
        foreach ($validated['items'] as $item) {
            $totalAmount += $item['quantity'] * $dishes[$item['dish_id']]->price;
        }

        $order = Order::create([
            'user_id' => $request->user()->id,
            'total_amount' => $totalAmount,
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);

        foreach ($validated['items'] as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'dish_id' => $item['dish_id'],
                'quantity' => $item['quantity'],
                'unit_price' => $dishes[$item['dish_id']]->price,
            ]);
        }

        return $order;
    });

    return response()->json([
        'message' => 'Commande passée avec succès !',
        'data' => $order->load('orderItems.dish'),
    ], 201);
}

    // Afficher une commande spécifique
    public function show(Request $request, Order $order)
{
    $user = $request->user();

    if ($user->role === 'client' && $order->user_id !== $user->id) {
        abort(403);
    }

    return response()->json($order->load(['user', 'orderItems.dish']));
} 

    // Mettre à jour le statut d'une commande (ex: le cuisinier passe de 'pending' à 'preparing' ou 'ready')
    public function updateStatus(Request $request, Order $order)
{
    if (! in_array($request->user()->role, ['cook', 'admin'])) {
        abort(403);
    }

    $validated = $request->validate([
        'status' => 'required|in:pending,preparing,ready,completed,cancelled',
    ]);

    $order->update(['status' => $validated['status']]);

    return response()->json([
        'message' => 'Statut de la commande mis à jour avec succès !',
        'data' => $order,
    ]);
}

    // Supprimer une commande
    public function destroy(Request $request, Order $order)
  {
    if ($request->user()->role !== 'admin') {
        abort(403);
    }

    $order->delete();

    return response()->json(['message' => 'Commande supprimée avec succès !']);
  }
}

