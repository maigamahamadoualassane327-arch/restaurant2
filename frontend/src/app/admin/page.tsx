import Link from 'next/link';

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Administration</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/categories"
          className="rounded-lg border p-6 shadow-sm"
        >
          <h2 className="font-semibold">Catégories</h2>
          <p className="text-sm text-gray-600">
            Ajouter, renommer ou supprimer des catégories.
          </p>
      </Link>

        <Link href="/admin/dishes" className="rounded-lg border p-6 shadow-sm">
        <h2 className="font-semibold">Plats</h2>
        <p className="text-sm text-gray-600">
           Ajouter, modifier ou retirer des plats de la carte.
        </p>
        
      </Link>

      </div>
    </main>
  );
}