'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import axiosClient, { imageUrl } from '../../../lib/axios';

type Dish = {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: string | number;
  is_available: boolean;
  image: string | null;
};

type Category = {
  id: number;
  name: string;
  dishes: Dish[];
};

const emptyForm = { name: '', description: '', price: '', category_id: '' };

const extractError = (err: unknown): string => {
  const res = (
    err as {
      response?: {
        status?: number;
        data?: { message?: string; errors?: Record<string, string[]> };
      };
    }
  ).response;
  if (res?.status === 401) return 'Session expirée : reconnectez-vous.';
  if (res?.status === 403) return "Action réservée à l'administrateur.";
  const first = res?.data?.errors
    ? Object.values(res.data.errors)[0]?.[0]
    : undefined;
  return first ?? res?.data?.message ?? 'Une erreur est survenue.';
};

export default function AdminDishesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    () =>
      axiosClient
        .get('/api/categories')
        .then((res) => setCategories(res.data))
        .catch(() => setError('Impossible de charger les plats.'))
        .finally(() => setLoading(false)),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  const run = async (action: () => Promise<unknown>, success: string) => {
    setMessage('');
    setError('');
    setBusy(true);
    try {
      await action();
      setMessage(success);
      await load();
    } catch (err) {
      setError(extractError(err));
    } finally {
      setBusy(false);
    }
  };

  const dishes = categories.flatMap((c) =>
    c.dishes.map((d) => ({ ...d, categoryName: c.name }))
  );

  const submit = () =>
    run(
      async () => {
        const payload = {
          name: form.name.trim(),
          description: form.description.trim() || null,
          price: form.price,
          category_id: Number(form.category_id),
        };
        if (editingId) {
          await axiosClient.put('/api/dishes/' + editingId, payload);
        } else {
          await axiosClient.post('/api/dishes', { ...payload, is_available: true });
        }
        setForm(emptyForm);
        setEditingId(null);
      },
      editingId ? 'Plat modifié.' : 'Plat ajouté.'
    );

  const startEdit = (dish: Dish) => {
    setEditingId(dish.id);
    setForm({
      name: dish.name,
      description: dish.description ?? '',
      price: String(dish.price),
      category_id: String(dish.category_id),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const toggleAvailability = (dish: Dish) =>
    run(
      () =>
        axiosClient.put('/api/dishes/' + dish.id, {
          is_available: !dish.is_available,
        }),
      dish.is_available ? 'Plat rendu indisponible.' : 'Plat de nouveau disponible.'
    );

  const removeDish = (dish: Dish) => {
    if (!window.confirm('Supprimer « ' + dish.name + ' » ?')) return;
    run(() => axiosClient.delete('/api/dishes/' + dish.id), 'Plat supprimé.');
  };

  const uploadImage = (dish: Dish, file: File) =>
    run(async () => {
      const data = new FormData();
      data.append('image', file);
     await axiosClient.post('/api/dishes/' + dish.id + '/image', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
        });
        
    }, 'Image enregistrée.');

  if (loading) return <p className="p-8">Chargement...</p>;

  const canSubmit = form.name.trim() && form.price && form.category_id;

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Plats</h1>
        <Link href="/admin" className="rounded-full border px-4 py-1 text-sm">
          Retour
        </Link>
      </div>

      <div className="mb-6 rounded-lg border p-4">
        <h2 className="mb-3 font-semibold">
          {editingId ? 'Modifier le plat' : 'Nouveau plat'}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nom du plat"
            className="rounded border bg-white p-2 text-black"
          />
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="rounded border bg-white p-2 text-black"
          >
            <option value="">Catégorie...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="Prix (€)"
            className="rounded border bg-white p-2 text-black"
          />
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description (facultatif)"
            className="rounded border bg-white p-2 text-black"
          />
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={submit}
            disabled={busy || !canSubmit}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {editingId ? 'Enregistrer' : 'Ajouter'}
          </button>
          {editingId && (
            <button onClick={cancelEdit} className="rounded border px-4 py-2">
              Annuler
            </button>
          )}
        </div>
      </div>

      {message && <p className="mb-4 text-green-700">{message}</p>}
      {error && <p className="mb-4 text-red-600">{error}</p>}

      {dishes.length === 0 && <p className="text-gray-500">Aucun plat.</p>}

      {dishes.map((dish) => (
        <div
          key={dish.id}
          className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
        >
          <div className="flex items-center gap-3">
            {dish.image ? (
              <img
                src={imageUrl(dish.image)}
                alt={dish.name}
                className="h-12 w-12 rounded object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                Photo
              </div>
            )}
            <div>
              <span className="font-medium">{dish.name}</span>
              <span className="ml-2 text-sm text-gray-500">
                {dish.categoryName} · {Number(dish.price).toFixed(2)} €
              </span>
              {!dish.is_available && (
                <span className="ml-2 rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
                  Indisponible
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <label
              className={
                'cursor-pointer rounded border px-3 py-1 text-sm ' +
                (busy ? 'opacity-50' : '')
              }
            >
              {dish.image ? "Changer l'image" : 'Ajouter une image'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={busy}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) uploadImage(dish, file);
                }}
              />
            </label>
            <button
              onClick={() => toggleAvailability(dish)}
              disabled={busy}
              className="rounded border px-3 py-1 text-sm disabled:opacity-50"
            >
              {dish.is_available ? 'Rendre indisponible' : 'Rendre disponible'}
            </button>
            <button
              onClick={() => startEdit(dish)}
              className="rounded border px-3 py-1 text-sm"
            >
              Modifier
            </button>
            <button
              onClick={() => removeDish(dish)}
              disabled={busy}
              className="rounded border border-red-300 px-3 py-1 text-sm text-red-600 disabled:opacity-50"
            >
              Supprimer
            </button>
          </div>
        </div>
      ))}
    </main>
  );
}