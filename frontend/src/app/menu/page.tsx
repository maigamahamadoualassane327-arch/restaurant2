'use client';

import { useEffect, useState } from 'react';
import axiosClient from '../../lib/axios';

type Dish = {
  id: number;
  name: string;
  description: string | null;
  price: string | number;
};

type Category = {
  id: number;
  name: string;
  dishes: Dish[];
};

type CartItem = {
  dish: Dish;
  quantity: number;
};

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<Record<number, CartItem>>({});
  const [notes, setNotes] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [orderMessage, setOrderMessage] = useState('');
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    axiosClient
      .get('/api/categories')
      .then((res) => setCategories(res.data))
      .catch(() => setError('Impossible de charger le menu.'))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (dish: Dish) =>
    setCart((prev) => ({
      ...prev,
      [dish.id]: { dish, quantity: (prev[dish.id]?.quantity ?? 0) + 1 },
    }));

  const removeFromCart = (dishId: number) =>
    setCart((prev) => {
      const item = prev[dishId];
      if (!item) return prev;
      const next = { ...prev };
      if (item.quantity <= 1) {
        delete next[dishId];
      } else {
        next[dishId] = { ...item, quantity: item.quantity - 1 };
      }
      return next;
    });

  const cartItems = Object.values(cart);
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const total = cartItems.reduce(
    (sum, i) => sum + Number(i.dish.price) * i.quantity,
    0
  );

  const placeOrder = async () => {
    setOrderMessage('');
    setOrderError('');
    setOrdering(true);

    try {
      await axiosClient.post('/api/orders', {
        notes: notes.trim() || null,
        items: cartItems.map((i) => ({
          dish_id: i.dish.id,
          quantity: i.quantity,
        })),
      });
      setCart({});
      setNotes('');
      setOrderMessage('Commande envoyée ! Merci.');
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      setOrderError(
        status === 401
          ? 'Vous devez être connecté pour commander (page /login).'
          : "Impossible d'envoyer la commande."
      );
    } finally {
      setOrdering(false);
    }
  };

  const visibleCategories = categories
    .filter((c) => selectedCategory === null || c.id === selectedCategory)
    .map((c) => ({
      ...c,
      dishes: c.dishes.filter((d) =>
        d.name.toLowerCase().includes(search.trim().toLowerCase())
      ),
    }))
    .filter((c) => c.dishes.length > 0);

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-1 text-sm ${
      active ? 'bg-black text-white' : 'bg-white text-black'
    }`;

  if (loading) return <p className="p-8">Chargement du menu...</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Carte du restaurant</h1>
        <span className="rounded-full bg-black px-4 py-1 text-sm text-white">
          Panier : {itemCount} · {total.toFixed(2)} €
        </span>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher un plat..."
        className="mb-4 w-full rounded-lg border bg-white p-3 text-black"
      />

      <div className="mb-8 flex flex-wrap gap-2">
        <button onClick={() => setSelectedCategory(null)} className={chip(selectedCategory === null)}>
          Tout
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={chip(selectedCategory === c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {visibleCategories.length === 0 && (
        <p className="text-gray-500">Aucun plat trouvé.</p>
      )}

      {visibleCategories.map((category) => (
        <section key={category.id} className="mb-10">
          <h2 className="mb-4 text-xl font-semibold">{category.name}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {category.dishes.map((dish) => (
              <div key={dish.id} className="rounded-lg border p-4 shadow-sm">
                <div className="flex justify-between">
                  <h3 className="font-medium">{dish.name}</h3>
                  <span className="font-semibold">
                    {Number(dish.price).toFixed(2)} €
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{dish.description}</p>
                <button
                  onClick={() => addToCart(dish)}
                  className="mt-3 rounded bg-black px-3 py-1 text-sm text-white"
                >
                  Ajouter
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-12 border-t pt-6">
        <h2 className="mb-4 text-xl font-semibold">Mon panier</h2>

        {cartItems.length === 0 ? (
          <p className="text-gray-500">Votre panier est vide.</p>
        ) : (
          <>
            {cartItems.map(({ dish, quantity }) => (
              <div key={dish.id} className="mb-3 flex items-center justify-between">
                <span>{dish.name}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => removeFromCart(dish.id)} className="rounded border px-3">
                    −
                  </button>
                  <span>{quantity}</span>
                  <button onClick={() => addToCart(dish)} className="rounded border px-3">
                    +
                  </button>
                  <span className="w-20 text-right font-medium">
                    {(Number(dish.price) * quantity).toFixed(2)} €
                  </span>
                </div>
              </div>
            ))}
            <p className="mt-4 text-right text-lg font-bold">
              Total : {total.toFixed(2)} €
            </p>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Une remarque pour la cuisine ? (facultatif)"
              className="mt-4 w-full rounded-lg border bg-white p-3 text-black"
            />
            <button
              onClick={placeOrder}
              disabled={ordering}
              className="mt-4 w-full rounded-lg bg-black py-3 text-white disabled:opacity-50"
            >
              {ordering ? 'Envoi en cours...' : 'Commander'}
            </button>
          </>
        )}

        {orderMessage && <p className="mt-4 text-green-700">{orderMessage}</p>}
        {orderError && <p className="mt-4 text-red-600">{orderError}</p>}
      </section>
    </main>
  );
}