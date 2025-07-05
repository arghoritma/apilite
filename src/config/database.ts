import knex from 'knex';
import config from "../knexfile";
import dotenv from 'dotenv';
import MigrateLatest from "../commands/migrate-latest";

dotenv.config();

const db = knex(config[process.env.NODE_ENV || 'development']);

const checkDatabaseConnection = async () => {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database connected successfully');
    await MigrateLatest.run();
    return true;
  } catch (error) {
    console.warn('⚠️ Database connection failed - continuing without database:', error);
    return false;
  }
};

export default db
export { checkDatabaseConnection }