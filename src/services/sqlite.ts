import Database, { Database as DatabaseType, RunResult } from 'better-sqlite3';

/**
 * Interface untuk hasil insert agar mirip Knex (mengembalikan array of ID)
 */
type InsertResult = number[];

/**
 * Kelas QueryBuilder dengan Generic <T>
 * T merepresentasikan interface dari Tabel (misal: User)
 */
class QueryBuilder<T = any> {
  private db: DatabaseType;
  private tableName: string;
  private conditions: string[];
  private bindings: any[];
  private limitValue: string | null;
  private orderByValue: string | null;

  constructor(db: DatabaseType, tableName: string) {
    this.db = db;
    this.tableName = tableName;
    this.conditions = [];
    this.bindings = [];
    this.limitValue = null;
    this.orderByValue = null;
  }

  // --- Building Blocks ---

  // Overload signatures untuk .where
  where(column: keyof T, value: any): this;
  where(column: keyof T, operator: string, value: any): this;

  // Implementasi .where
  where(column: keyof T, operatorOrValue: any, value?: any): this {
    let operator = '=';
    let finalValue = operatorOrValue;

    if (value !== undefined) {
      operator = operatorOrValue;
      finalValue = value;
    }

    this.conditions.push(`${String(column)} ${operator} ?`);
    this.bindings.push(finalValue);
    return this;
  }

  orderBy(column: keyof T, direction: 'asc' | 'desc' | 'ASC' | 'DESC' = 'ASC'): this {
    this.orderByValue = `ORDER BY ${String(column)} ${direction.toUpperCase()}`;
    return this;
  }

  limit(num: number): this {
    this.limitValue = `LIMIT ${num}`;
    return this;
  }

  // --- Eksekusi Query (DML) ---

  // SELECT
  select(columns: (keyof T)[] | '*'): T[] {
    const cols = Array.isArray(columns) ? columns.join(', ') : columns;
    let sql = `SELECT ${cols} FROM ${this.tableName}`;

    if (this.conditions.length > 0) {
      sql += ` WHERE ${this.conditions.join(' AND ')}`;
    }

    if (this.orderByValue) sql += ` ${this.orderByValue}`;
    if (this.limitValue) sql += ` ${this.limitValue}`;

    return this.db.prepare(sql).all(...this.bindings) as T[];
  }

  // FIRST (Ambil satu baris)
  first(columns: (keyof T)[] | '*' = '*'): T | undefined {
    this.limit(1);
    const result = this.select(columns);
    return result.length > 0 ? result[0] : undefined;
  }

  // INSERT
  insert(data: Partial<T>): InsertResult {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');

    const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;

    const info: RunResult = this.db.prepare(sql).run(...values);
    // Kembalikan array berisi ID (style Knex)
    return [Number(info.lastInsertRowid)];
  }

  // RETURNING
  insertReturning(data: Partial<T>, returning: (keyof T)[] | '*'): T | undefined {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');

    // Tentukan kolom apa yang mau dikembalikan
    const returningClause = Array.isArray(returning)
      ? returning.join(', ')
      : '*';

    // Syntax Native SQLite: INSERT ... RETURNING ...
    const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING ${returningClause}`;

    // Gunakan .get() karena kita mengharapkan 1 baris hasil
    return this.db.prepare(sql).get(...values) as T;
  }

  // UPDATE
  update(data: Partial<T>): number {
    const keys = Object.keys(data);
    const values = Object.values(data);

    if (keys.length === 0) return 0;

    const setClause = keys.map(key => `${key} = ?`).join(', ');
    let sql = `UPDATE ${this.tableName} SET ${setClause}`;

    if (this.conditions.length > 0) {
      sql += ` WHERE ${this.conditions.join(' AND ')}`;
    } else {
      throw new Error('Update tanpa Where sangat berbahaya! Tambahkan .where()');
    }

    const finalBindings = [...values, ...this.bindings];
    const info: RunResult = this.db.prepare(sql).run(...finalBindings);
    return info.changes;
  }

  // DELETE
  delete(): number {
    let sql = `DELETE FROM ${this.tableName}`;

    if (this.conditions.length > 0) {
      sql += ` WHERE ${this.conditions.join(' AND ')}`;
    }

    const info: RunResult = this.db.prepare(sql).run(...this.bindings);
    return info.changes;
  }

  raw(): T[] {
    let sql = `SELECT * FROM ${this.tableName}`;
    if (this.conditions.length > 0) {
      sql += ` WHERE ${this.conditions.join(' AND ')}`;
    }
    if (this.orderByValue) sql += ` ${this.orderByValue}`;
    if (this.limitValue) sql += ` ${this.limitValue}`;
    return this.db.prepare(sql).all(...this.bindings) as T[];
  }
}

/**
 * Driver Utama
 */
export default class SqliteDriver {
  private db: DatabaseType;

  constructor(filePath: string) {
    this.db = new Database(filePath);

    // Aktifkan WAL Mode
    this.db.pragma('journal_mode = WAL');
    console.log('🚀 Native Driver: WAL Mode Activated');
    // Set synchronous ke NORMAL untuk performa lebih baik
    this.db.pragma("synchronous = NORMAL");
    console.log('🚀 Native Driver: Synchronous Mode Set to NORMAL');
    // Aktifkan foreign keys
    this.db.pragma("foreign_keys = ON");
    console.log('🚀 Native Driver: Foreign Keys Enabled');

    // set timeout untuk menghindari "database is locked" error
    this.db.pragma("busy_timeout = 5000");
    console.log('🚀 Native Driver: Busy Timeout Set to 5000ms');

  }

  // Factory method dengan Generic
  query<T = any>(tableName: string): QueryBuilder<T> {
    return new QueryBuilder<T>(this.db, tableName);
  }

  // Method untuk query mentah jika diperlukan
  raw<T = any>(sql: string, params: any[] = []): T[] {
    return this.db.prepare(sql).all(...params) as T[];
  }

  close(): void {
    this.db.close();
  }
}