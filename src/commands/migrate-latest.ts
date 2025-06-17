import { Command } from '@oclif/core';
import knex from 'knex';
import config from '../knexfile';

export default class MigrateLatest extends Command {
  static description = 'Run latest database migrations';
  static aliases = ['migrate:latest'];

  async run() {
    const environment = process.env.NODE_ENV || 'development';
    const knexInstance = knex(config[environment]);

    try {
      await knexInstance.migrate.latest();
      this.log('Successfully ran latest migrations');
    } catch (error) {
      this.error('Failed to run migrations: ' + error);
    } finally {
      await knexInstance.destroy();
    }
  }
}
