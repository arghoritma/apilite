import { Command } from '@oclif/core';
import knex from 'knex';
import config from '../knexfile';
import dotenv from 'dotenv';
dotenv.config();

export default class MigrateLatest extends Command {
  static description = 'Run latest database migrations';
  static aliases = ['migrate:latest'];

  async run() {
    const environment = process.env.NODE_ENV!;
    const knexInstance = knex(config[environment]);

    try {
      await knexInstance.migrate.latest();
      this.log(`✅ Successfully ran latest ${environment} migrations`);
    } catch (error) {
      this.error('❌ Failed to run migrations: ' + error);
    } finally {
      await knexInstance.destroy();
    }
  }
}
