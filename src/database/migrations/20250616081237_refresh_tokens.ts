import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('refresh_tokens', (table) => {
    table.uuid('id').primary();
    table.uuid('session_id').references('id').inTable('user_sessions').onDelete('CASCADE');
    table.text('token_hash').notNullable();
    table.boolean('revoked').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('expired_at');
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('refresh_tokens');
}
