/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
    .createTable('backups', (table) =>{
        table.increments('backupId').primary();
        table.integer('userId').unsigned().notNullable().references('id').inTable('users');
        table.json('backupData');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
    });

};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists('backups')
};