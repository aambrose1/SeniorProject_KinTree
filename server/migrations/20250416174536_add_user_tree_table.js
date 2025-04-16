const { table } = require("../db/knex");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('userTreeSummaries', function(table) {
        table.increments('id').primary();
        table.integer('userId').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.json('currentTreeSummary').notNullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('userTreeSummaries')
  
};
