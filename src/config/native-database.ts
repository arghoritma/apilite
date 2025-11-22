import SqliteDriver from '../services/sqlite'; // Import driver yang kita buat tadi
import 'dotenv/config';
// Path database (sesuaikan dengan struktur folder Anda)
// Pastikan path ini benar relatif terhadap root project
const NativeDB = new SqliteDriver(`${process.env.NODE_ENV === 'production' ? `./db/${process.env.DB_NAME}.sqlite3` : './db/dev.sqlite3'}`);

// Helper function dengan Generic Type <T>
// Ini kuncinya agar di controller kita bisa ketik db<User>('users')
export const db = <T = any>(tableName: string) => NativeDB.query<T>(tableName);

export default NativeDB;