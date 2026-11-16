'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import axiosClient from '../../../lib/axios';

type Category = {
  id: number;
  name: string;
  dishes: { id: number }[];
};

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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    () =>
      axiosClient
        .get('/api/categories')
        .then((res) => setCategories(res.data))
        .catch(() => setError('Impossible de charger les catégories.'))
        .finally(() => setLoading(false)),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  // Exécute une action, affiche le résultat, puis recharge la liste
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

  const addCategory = () =>
    run(async () => {
      await axiosClient.post('/api/categories', { name: newName.trim() });
      setNewName('');
    }, 'Catégorie ajoutée.');

  const saveCategory = (id: number) =>
    run(async () => {
      await axiosClient.put('/api/categories/' + id, {
        name: editingName.trim(),
      });
      setEditingId(null);
    }, 'Catégorie modifiée.');

  const deleteCategory = (category: Category) => {
    if (!window.confirm('Supprimer la catégorie « ' + category.name + ' » ?')) {
      return;
    }
    run(
      () => axiosClient.delete('/api/categories/' + category.id),
      'Catégorie supprimée.'
    );
  };

  if (loading) return <p className="p-8">Chargement...</p>;

  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Catégories</h1>
        <Link href="/admin" className="rounded-full border px-4 py-1 text-sm">
          Retour
        </Link>
      </div>

      <div className="mb-6 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nouvelle catégorie..."
          className="flex-1 rounded-lg border bg-white p-3 text-black"
        />
        <button
          onClick={addCategory}
          disabled={busy || !newName.trim()}
          className="rounded-lg bg-black px-4 text-white disabled:opacity-50"
        >
          Ajouter
        </button>
      </div>

      {message && <p className="mb-4 text-green-700">{message}</p>}
      {error && <p className="mb-4 text-red-600">{error}</p>}

      {categories.length === 0 && (
        <p className="text-gray-500">Aucune catégorie.</p>
      )}

      {categories.map((category) => (
        <div
          key={category.id}
          className="mb-3 flex items-center justify-between rounded-lg border p-3"
        >
          {editingId === category.id ? (
            <input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className="mr-3 flex-1 rounded border bg-white p-2 text-black"
            />
          ) : (
            <div>
              <span className="font-medium">{category.name}</span>
              <span className="ml-2 text-sm text-gray-500">
                {category.dishes.length} plat(s)
              </span>
            </div>
          )}

          <div className="flex gap-2">
            {editingId === category.id ? (
              <>
                <button
                  onClick={() => saveCategory(category.id)}
                  disabled={busy || !editingName.trim()}
                  className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-50"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="rounded border px-3 py-1 text-sm"
                >
                  Annuler
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditingId(category.id);
                    setEditingName(category.name);
                  }}
                  className="rounded border px-3 py-1 text-sm"
                >
                  Modifier
                </button>
                <button
                  onClick={() => deleteCategory(category)}
                  disabled={busy}
                  className="rounded border border-red-300 px-3 py-1 text-sm text-red-600 disabled:opacity-50"
                >
                  Supprimer
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </main>
  );
}