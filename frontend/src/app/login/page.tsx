'use client';

import { useState } from 'react';
import axiosClient from '../../lib/axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Récupérer le cookie CSRF avec axiosClient
      await axiosClient.get('/sanctum/csrf-cookie');

      // 2. Envoyer la requête de connexion
      await axiosClient.post('/api/login', { email, password });
      
      // 3. Récupérer le profil pour connaître le rôle
      const response = await axiosClient.get('/api/user');
      const role = response.data.role; // ('admin', 'chef', 'client')

      if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'chef') {
        router.push('/kitchen');
      } else {
        router.push('/menu');
      }
    } catch (err: any) {
      setError('Identifiants invalides ou erreur de connexion.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800">Connexion - Restaurant</h1>
        
        {error && <div className="p-3 text-sm text-red-600 bg-red-100 rounded">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}