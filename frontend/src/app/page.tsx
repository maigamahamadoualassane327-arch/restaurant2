'use client';

import { useEffect, useState } from 'react';
import axiosClient from '../lib/axios';

export default function Home() {
  const [message, setMessage] = useState('Chargement...');

  useEffect(() => {
    axiosClient.get('/api/user')
      .then(res => {
        setMessage('Connexion avec Laravel réussie !');
      })
      .catch(err => {
        setMessage('Backend joint, en attente de authentification.');
      });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-3xl font-bold mb-4">Restaurant Full-Stack</h1>
      <p className="text-xl text-gray-600">{message}</p>
    </main>
  );
}