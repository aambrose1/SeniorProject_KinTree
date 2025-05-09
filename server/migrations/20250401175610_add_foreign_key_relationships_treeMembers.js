/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .alterTable('relationships',function(table) {
            table.integer('userId').unsigned().notNullable().references('id').inTable('users');
        })
        .alterTable('treeMembers',function(table) {
            table.integer('userId').unsigned().notNullable().references('id').inTable('users');
        });

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
  .alterTable('relationships', function(table){
    table.dropColumn('userId');
  })
  .alterTable('treeMembers', function(table) {
    table.dropColumn('userId');
  })
};