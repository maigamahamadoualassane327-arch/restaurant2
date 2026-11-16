'use client';

import { useCallback, useEffect, useState } from 'react';
import axiosClient from '../../lib/axios';

type OrderLine = {
  id: number;
  quantity: number;
  dish: { name: string };
};

type Order = {
  id: number;
  status: string;
  notes: string | null;
  created_at: string;
  user: { name: string } | null;
  order_items: OrderLine[];
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  preparing: 'En préparation',
  ready: 'Prête',
};

// Pour chaque statut : le texte du bouton et le statut suivant
const NEXT_STEP: Record<string, { label: string; next: string }> = {
  pending: { label: 'Commencer la préparation', next: 'preparing' },
  preparing: { label: 'Marquer prête', next: 'ready' },
  ready: { label: 'Marquer livrée', next: 'completed' },
};

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadOrders = useCallback(
    () =>
      axiosClient
        .get('/api/orders')
        .then((res) => {
          setOrders(res.data);
          setError('');
        })
        .catch((err) =>
          setError(
            err.response?.status === 401
              ? 'Connectez-vous pour accéder à la cuisine.'
              : 'Impossible de charger les commandes.'
          )
        )
        .finally(() => setLoading(false)),
    []
  );

  useEffect(() => {
    loadOrders();
    const timer = setInterval(loadOrders, 5000);
    return () => clearInterval(timer);
  }, [loadOrders]);

  const changeStatus = async (orderId: number, status: string) => {
    setActionError('');
    setBusyId(orderId);
    try {
      await axiosClient.patch('/api/orders/' + orderId + '/status', { status });
      await loadOrders();
    } catch (err) {
      const code = (err as { response?: { status?: number } }).response?.status;
      setActionError(
        code === 403
          ? 'Action réservée au personnel de la cuisine.'
          : 'Impossible de modifier la commande.'
      );
    } finally {
      setBusyId(null);
    }
  };

  // Commandes à traiter, les plus anciennes d'abord
  const activeOrders = orders
    .filter((o) => o.status in NEXT_STEP)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  if (loading) return <p className="p-8">Chargement des commandes...</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-2 text-2xl font-bold">Cuisine</h1>
      <p className="mb-6 text-sm text-gray-500">
        {activeOrders.length} commande(s) à traiter · mise à jour automatique
      </p>

      {actionError && <p className="mb-4 text-red-600">{actionError}</p>}

      {activeOrders.length === 0 && (
        <p className="text-gray-500">Aucune commande en cours.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {activeOrders.map((order) => {
          const step = NEXT_STEP[order.status];
          return (
            <div key={order.id} className="rounded-lg border p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Commande n°{order.id}</span>
                <span className="rounded-full bg-black px-3 py-1 text-sm text-white">
                  {STATUS_LABELS[order.status]}
                </span>
              </div>
              <p className="mb-3 text-sm text-gray-500">
                {order.user?.name ?? 'Client'} ·{' '}
                {new Date(order.created_at).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>

              {order.order_items.map((line) => (
                <p key={line.id}>
                  {line.quantity} × {line.dish.name}
                </p>
              ))}

              {order.notes && (
                <p className="mt-2 text-sm italic text-gray-600">
                  Remarque : {order.notes}
                </p>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => changeStatus(order.id, step.next)}
                  disabled={busyId === order.id}
                  className="flex-1 rounded bg-black py-2 text-white disabled:opacity-50"
                >
                  {step.label}
                </button>
                {order.status === 'pending' && (
                  <button
                    onClick={() => changeStatus(order.id, 'cancelled')}
                    disabled={busyId === order.id}
                    className="rounded border px-3 py-2 disabled:opacity-50"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}