# KomRest

KomRest adalah aplikasi manajemen restoran berbasis Next.js (App Router) dengan backend API route internal.

## Stack

- Next.js + React + TypeScript
- Tailwind CSS
- HeroUI component system
- Auth.js (credentials)
- Prisma ORM + PostgreSQL

## Menjalankan Project

1. Copy env:

```bash
cp .env.example .env.local
```

2. Jalankan PostgreSQL lokal:

```bash
docker compose up -d
```

3. Install dependency:

```bash
npm install
```

4. Generate Prisma client dan sync schema:

```bash
npm run prisma:generate
npm run prisma:push
```

5. (Opsional) Migrasi data dari backup Supabase:

```bash
npm run migrate:backup -- ./db_cluster-24-02-2025@04-16-17.backup.gz
```

Script migrasi akan:

- Import data tabel `public.*` dari dump backup
- Mengambil email dari `auth.users`
- Mengisi semua `users.password_hash` dengan hash default dari `MIGRATION_DEFAULT_PASSWORD` (default: `password123`)
- Set `users.must_reset_password = false`
- Menjalankan bootstrap manager jika belum ada manager

6. Jalankan development server:

```bash
npm run dev
```

## Auth Default

- User hasil migrasi bisa login dengan password default `password123` (atau nilai `MIGRATION_DEFAULT_PASSWORD`).
- Flow ganti password tidak diwajibkan saat login pertama.
