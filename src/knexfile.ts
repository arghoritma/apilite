import type { Knex } from 'knex';
import path from 'path';

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, '../db/dev.sqlite')
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'database/migrations'),
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: path.join(__dirname, 'database/seeds')
    },
    pool: {
      min: 2,
      max: 50,              // Tingkatkan dari default (biasanya 10)
      createTimeoutMillis: 3000,
      acquireTimeoutMillis: 60000,  // Tingkatkan timeout
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
      propagateCreateError: false
    }
  },

  production: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, '../db/prod.sqlite')
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'database/migrations'),
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: path.join(__dirname, 'database/seeds')
    },
    pool: {
      min: 2,
      max: 50,              // Tingkatkan dari default (biasanya 10)
      createTimeoutMillis: 3000,
      acquireTimeoutMillis: 60000,  // Tingkatkan timeout
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
      propagateCreateError: false
    }
  }
};

export default config;
