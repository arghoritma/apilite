# Express TypeScript Template

Template backend RESTful API menggunakan ultimate-express dan TypeScript dengan fitur autentikasi dan manajemen database.

## Teknologi yang Digunakan

- **Ultimate Express** - Framework web untuk Node.js
- **TypeScript** - JavaScript dengan penambahan tipe data
- **SQLite3** - Database SQL ringan
- **Knex.js** - SQL query builder dan migration tool
- **JWT** - JSON Web Token untuk autentikasi
- **Bcrypt** - Untuk hashing password
- **Nodemon** - Development server dengan auto-reload

## Fitur

- Sistem autentikasi lengkap (register, login)
- Manajemen pengguna
- Database migrations dan seeding
- Middleware validasi input
- JWT middleware untuk proteksi route
- Development server dengan hot-reload
- Konfigurasi database yang fleksibel

## Struktur Proyek

```
src/
├── config/         # Konfigurasi aplikasi
├── controllers/    # Logic bisnis
├── database/       # Migrations dan seeds
├── middlewares/    # Express middlewares
├── routes/         # Definisi route API
└── index.ts        # Entry point aplikasi
```

## Persyaratan

- Node.js (versi 14 atau lebih baru)
- npm atau yarn

## Instalasi

1. Clone repository:

```bash
git clone https://github.com/arghoritma/apilite.git
cd apilite
```

2. Install dependencies:

```bash
npm install
```

3. Setup environment variables:
   Buat file `.env` di root proyek dan isi dengan:

```env
PORT=3000
JWT_SECRET=your-secret-key
```

## Penggunaan

### Development

Jalankan server development dengan hot-reload:

```bash
npm run dev
```

### Database Management

Menjalankan migrasi:

```bash
npm run migrate
```

Membatalkan migrasi terakhir:

```bash
npm run migrate:rollback
```

Menjalankan seeder:

```bash
npm run seed
```

## API Endpoints

### Autentikasi

- `POST /api/users/register` - Registrasi pengguna baru

  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```

- `POST /api/users/login` - Login pengguna
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```

### Pengguna

- `GET /api/users/profile` - Mendapatkan profil pengguna (memerlukan autentikasi)

## Validasi

Validasi input menggunakan middleware custom dengan aturan:

- Username: minimal 3 karakter
- Email: format email valid
- Password: minimal 6 karakter

## Keamanan

- Password di-hash menggunakan bcrypt
- Autentikasi menggunakan JWT
- Validasi input untuk mencegah injeksi
- Environment variables untuk konfigurasi sensitif

## Pengembangan

### Menambahkan Route Baru

1. Buat controller baru di `src/controllers/`
2. Tambahkan route di `src/routes/`
3. Daftarkan route di `src/index.ts`

### Menambahkan Tabel Baru

1. Buat file migrasi baru:

```bash
knex migrate:make nama_migrasi
```

2. Edit file migrasi di `src/database/migrations/`
3. Jalankan migrasi

## Lisensi

ISC
