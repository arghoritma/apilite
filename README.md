# Express TypeScript Template

Template backend RESTful API menggunakan ultimate-express dan TypeScript dengan fitur autentikasi dan manajemen database dan websocket.

## Teknologi yang Digunakan

- **Ultimate Express** - Framework web untuk Node.js, sangat cepat (berbasis µWebSockets)
- **TypeScript** - JavaScript dengan penambahan tipe data
- **SQLite3** - Database SQL ringan (Bisa di ganti dengan DBMS lain [MySQL, Postgres, dll])
- **Knex.js** - SQL query builder dan migration tool
- **JWT** - JSON Web Token untuk autentikasi
- **Bcrypt** - Untuk hashing password
- **Nodemon** - Development server dengan auto-reload

### Benchmark Ultimate Express

| Test                                       | Express req/sec | Ultimate Express req/sec |
| ------------------------------------------ | --------------- | ------------------------ |
| routing/simple-routes (/)                  | 11.16k          | 75.14k                   |
| routing/lot-of-routes (/999)               | 4.63k           | 54.57k                   |
| routing/some-middlewares (/90)             | 10.12k          | 61.92k                   |
| routers/nested-routers (/abccc/nested/ddd) | 10.18k          | 51.15k                   |
| static file (/static/index.js)             | 6.58k           | 32.45k                   |
| ejs engine (/test)                         | 5.50k           | 40.82k                   |
| body-urlencoded (/abc)                     | 8.07k           | 50.52k                   |
| compression-file (/small-file)             | 4.81k           | 14.92k                   |

> Ultimate Express rata-rata 5-10x lebih cepat dari Express.js pada berbagai skenario routing dan middleware.

### Perbandingan Kecepatan Ultimate Express dengan Framework Lain

| Framework          | Req/sec (64) | Req/sec (256) | Req/sec (512) |
| ------------------ | ------------ | ------------- | ------------- |
| ultimate-express   | 167,079      | 183,107       | 184,765       |
| uwebsockets        | 152,524      | 173,217       | 176,365       |
| elysia             | 150,267      | 167,667       | 167,665       |
| sifrr              | 150,016      | 168,058       | 172,702       |
| mesh               | 143,917      | 159,453       | 166,114       |
| routejs-uwebsocket | 137,966      | 149,189       | 155,895       |
| hyper-express      | 131,791      | 144,777       | 147,443       |

> Sumber: [Web Frameworks Benchmark](https://web-frameworks-benchmark.netlify.app/result?l=javascript) & TechEmpower. Ultimate Express menempati posisi teratas untuk framework Node.js/JavaScript tercepat dalam benchmark ini.

## Fitur

- Sistem autentikasi lengkap (register, login)
- Manajemen pengguna
- Database migrations dan seeding
- Middleware validasi input
- JWT middleware untuk proteksi route
- Development server dengan hot-reload
- Konfigurasi database yang fleksibel
- **WebSocket realtime** (broadcast ke semua client, contoh client disediakan)

## WebSocket

Fitur WebSocket menggunakan [ultimate-ws](https://www.npmjs.com/package/ultimate-ws) dan sudah terintegrasi dengan ultimate-express.

- Endpoint WebSocket: `ws://localhost:3000/ws`
- Endpoint HTTP broadcast: `POST /api/ws/broadcast`

### Contoh Client WebSocket

Buka file `public/ws-client.html` di browser, klik "Connect WebSocket" lalu klik "Send Test Broadcast" untuk mengirim pesan ke semua client yang terhubung.

### Contoh Broadcast via HTTP

Request:

```http
POST /api/ws/broadcast
Content-Type: application/json

{
  "type": "test",
  "payload": { "msg": "Hello from HTTP!" }
}
```

Semua client yang terhubung ke WebSocket akan menerima pesan broadcast ini.

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

- `POST /api/auth/register` - Registrasi pengguna baru

  Request:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
  ```
  Response:
  ```json
  {
    "code": "REGISTER_SUCCESS",
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "string",
        "name": "string",
        "email": "string",
        "createdAt": "2024-06-10T12:00:00.000Z"
      }
    }
  }
  ```

- `POST /api/auth/login` - Login pengguna

  Request:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
  Response:
  ```json
  {
    "code": "LOGIN_SUCCESS",
    "message": "Login successful",
    "data": {
      "accessToken": "string",
      "refreshToken": "string",
      "user": {
        "id": "string",
        "name": "string",
        "email": "string",
        "createdAt": "2024-06-10T12:00:00.000Z"
      },
      "session": {
        "sessionId": "string",
        "deviceId": "string",
        "userAgent": "string",
        "ip": "string",
        "createdAt": "2024-06-10T12:00:00.000Z",
        "expiredAt": "2024-06-11T12:00:00.000Z"
      }
    }
  }
  ```

- `POST /api/auth/logout` - Logout dari device saat ini (memerlukan autentikasi)

  Response:
  ```json
  {
    "code": "LOGOUT_SUCCESS",
    "message": "Logout successful"
  }
  ```

- `POST /api/auth/logout-all` - Logout dari semua device (memerlukan autentikasi)

  Response:
  ```json
  {
    "code": "LOGOUT_ALL_SUCCESS",
    "message": "Logged out from all devices successfully"
  }
  ```

### Pengguna

- `GET /api/users/profile` - Mendapatkan profil pengguna (memerlukan autentikasi)

> Untuk mengakses protected route ini, Anda harus menggunakan access token yang didapatkan saat login dan memasukkannya ke dalam header autentikasi Bearer.

Contoh penggunaan dengan curl:

```bash
curl -H "Authorization: Bearer <access_token_anda>" http://localhost:3000/api/users/profile
```

### Refresh Token

- `POST /api/auth/refresh-token` - Mendapatkan access token baru menggunakan refresh token

  ```json
  {
    "refreshToken": "string"
  }
  ```

  Response:
  ```json
  {
    "code": "REFRESH_SUCCESS",
    "message": "Token refreshed successfully",
    "data": {
      "accessToken": "string",
      "refreshToken": "string"
    }
  }
  ```

> Kirim refresh token yang didapat saat login untuk memperoleh access token baru. Refresh token biasanya dikirim saat access token sudah kadaluarsa.


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
