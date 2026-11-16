'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axiosClient from '../lib/axios';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

// Page d'accueil de chaque rôle
const HOME_BY_ROLE: Record<string, string> = {
  admin: '/admin',
  cook: '/kitchen',
  client: '/menu',
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  cook: 'Cuisinier',
  client: 'Client',
};

export default function AuthGuard({
  roles,
  children,
}: {
  roles?: string[];
  children: ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    axiosClient
      .get('/api/user')
      .then((res) => {
        const current: User = res.data;
        if (roles && !roles.includes(current.role)) {
          router.replace(HOME_BY_ROLE[current.role] ?? '/login');
        } else {
          setUser(current);
        }
      })
      .catch(() => router.replace('/login'));
  }, [roles, router]);

  const logout = async () => {
    try {
      await axiosClient.post('/api/logout');
    } finally {
      router.replace('/login');
    }
  };

  if (!user) return <p className="p-8">Vérification de la session...</p>;

  return (
    <>
      <div className="flex items-center justify-end gap-3 border-b px-8 py-2 text-sm">
        <span>
          {user.name} · {ROLE_LABELS[user.role] ?? user.role}
        </span>
        <button onClick={logout} className="rounded border px-3 py-1">
          Déconnexion
        </button>
      </div>
      {children}
    </>
  );
}