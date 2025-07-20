import type { Knex } from 'knex';
import path from 'path';

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'better-sqlite3',
    connection: {
      filename: path.join(__dirname, '../db/dev.sqlite3')
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'database/migrations'),
      tableName: 'knex_migrations'
    },
  },

  production: {
    client: 'better-sqlite3',
    connection: {
      filename: path.join(__dirname, '../../db/prod.sqlite3')
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'database/migrations'),
      tableName: 'knex_migrations'
    },
  }
};

export default config;
