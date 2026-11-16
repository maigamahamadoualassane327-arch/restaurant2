'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axiosClient from '../../lib/axios';

type OrderLine = {
  id: number;
  quantity: number;
  unit_price: string | number;
  dish: { name: string };
};

type Order = {
  id: number;
  total_amount: string | number;
  status: string;
  notes: string | null;
  created_at: string;
  order_items: OrderLine[];
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  preparing: 'En préparation',
  ready: 'Prête',
  completed: 'Livrée',
  cancelled: 'Annulée',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = () =>
      axiosClient
        .get('/api/orders')
        .then((res) => {
          setOrders(res.data);
          setError('');
        })
        .catch((err) =>
          setError(
            err.response?.status === 401
              ? 'Connectez-vous pour voir vos commandes.'
              : 'Impossible de charger vos commandes.'
          )
        )
        .finally(() => setLoading(false));

    load();
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return <p className="p-8">Chargement de vos commandes...</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes commandes</h1>
        <Link href="/menu" className="rounded-full border px-4 py-1 text-sm">
           Retour au menu
        </Link>
      </div>

      {orders.length === 0 && (
        <p className="text-gray-500">Vous n&apos;avez pas encore passé de commande.</p>
      )}

      {orders.map((order) => (
        <div key={order.id} className="mb-6 rounded-lg border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Commande n°{order.id}</span>
            <span className="rounded-full bg-black px-3 py-1 text-sm text-white">
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>
          <p className="mb-3 text-sm text-gray-500">
            {new Date(order.created_at).toLocaleString('fr-FR')}
          </p>

          {order.order_items.map((line) => (
            <div key={line.id} className="flex justify-between text-sm">
              <span>
                {line.quantity} × {line.dish.name}
              </span>
              <span>{(Number(line.unit_price) * line.quantity).toFixed(2)} €</span>
            </div>
          ))}

          {order.notes && (
            <p className="mt-2 text-sm italic text-gray-600">Remarque : {order.notes}</p>
          )}
          <p className="mt-3 text-right font-bold">
            Total : {Number(order.total_amount).toFixed(2)} €
          </p>
        </div>
      ))}
    </main>
  );
}