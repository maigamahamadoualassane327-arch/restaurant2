# 🍽️ Application Web de Gestion de Restaurant

Une application web full-stack moderne et sécurisée pour la gestion d'un restaurant, développée avec une architecture découplée (*Laravel 11 API + Next.js App Router*).

---

## 🚀 Fonctionnalités Principales

* *🔐 Authentification Sécurisée (Sanctum) :* Gestion des sessions stateful par cookies et redirection dynamique basée sur le rôle de l'utilisateur.
* *👤 Espace Client :*
  * Consultation du menu et de la carte du restaurant par catégories.
  * Ajout de plats au panier et passage de commande.
  * Suivi en temps réel de l'état des commandes (En attente, En préparation, Prête, Livrée).
* *👨‍🍳 Espace Cuisinier (Kitchen) :*
  * Tableau de bord en temps réel des commandes reçues.
  * Mise à jour instantanée des statuts de préparation des plats.

---

## 🛠️ Stack Technique

### *Backend (API REST)*
* *Framework :* Laravel 11 (PHP 8.3)
* *Base de données :* MySQL / MariaDB
* *Authentification :* Laravel Sanctum

### *Frontend (Client SPA/SSR)*
* *Framework :* Next.js (App Router, TypeScript)
* *Style :* Tailwind CSS
* *Client HTTP :* Axios (withCredentials: true)

---

## ⚙️ Installation et Lancement du Projet

### 1. Cloner le dépôt
```bash
git clone [https://github.com/maigamahamadoualassane327-arch/restaurant2.git](https://github.com/maigamahamadoualassane327-arch/restaurant2.git)
