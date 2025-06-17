import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('user_sessions', (table) => {
    table.string('id').primary();
    table.string('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('device_id').notNullable();
    table.string('ip_address', 45);
    table.text('user_agent');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('last_used_at');
    table.timestamp('expired_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('user_sessions');
}