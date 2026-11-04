<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // Afficher toutes les commandes (avec le client et les articles commandés)
    public function index()
    {
        $orders = Order::with(['user', 'orderItems.dish'])->latest()->get();
        return response()->json($orders);
    }

    // Créer une nouvelle commande
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.dish_id' => 'required|exists:dishes,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        // Utilisation d'une transaction pour s'assurer que tout s'enregistre bien
        $order = DB::transaction(function () use ($validated) {
            // Calculer le montant total
            $totalAmount = 0;
            foreach ($validated['items'] as $item) {
                $totalAmount += $item['quantity'] * $item['unit_price'];
            }

            // Créer la commande principale
            $order = Order::create([
                'user_id' => $validated['user_id'],
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'notes' => $validated['notes'] ?? null,
            ]);

            // Créer les lignes de commande (articles)
            foreach ($validated['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'dish_id' => $item['dish_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                ]);
            }

            return $order;
        });

        return response()->json([
            'message' => 'Commande passée avec succès !',
            'data' => $order->load('orderItems.dish')
        ], 201);
    }

    // Afficher une commande spécifique
    public function show(Order $order)
    {
        return response()->json($order->load(['user', 'orderItems.dish']));
    }

    // Mettre à jour le statut d'une commande (ex: le cuisinier passe de 'pending' à 'preparing' ou 'ready')
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,preparing,ready,completed,cancelled',
        ]);

        $order->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Statut de la commande mis à jour avec succès !',
            'data' => $order
        ]);
    }

    // Supprimer une commande
    public function destroy(Order $order)
    {
        $order->delete();

        return response()->json([
            'message' => 'Commande supprimée avec succès !'
        ]);
    }
}
