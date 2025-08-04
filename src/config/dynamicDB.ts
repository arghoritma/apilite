
import config from "../knexfile";
import dotenv from 'dotenv';
import DBInstance from "knex";
import { Knex } from "knex";
import path from 'path';

dotenv.config();

class DynamicDB {
  private static dbInstances: { [key: string]: Knex } = {};
  private static baseDB: Knex = DBInstance(config[process.env.NODE_ENV!]);
  static connection(DB_FILE: string): Knex {
    if (this.dbInstances[DB_FILE]) {
      return this.dbInstances[DB_FILE];
    } else {
      // Gunakan path.join agar cross-platform
      const dbPath = process.env.NODE_ENV === "development"
        ? path.join(__dirname, '../../db', `${DB_FILE}.sqlite3`)
        : path.join(__dirname, '../../../db', `${DB_FILE}.sqlite3`);

      this.dbInstances[DB_FILE] = DBInstance({
        client: "better-sqlite3",
        connection: {
          filename: dbPath,
        },
        useNullAsDefault: true,
      });

      return this.dbInstances[DB_FILE];
    }
  }
}

export default DynamicDB;
