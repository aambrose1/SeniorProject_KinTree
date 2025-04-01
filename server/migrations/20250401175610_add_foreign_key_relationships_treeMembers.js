/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .table('relationships',function(table) {
            table.integer('userId').unsigned().notNullable().references('id').inTable('users');
        })
        .table('treeMembers',function(table) {
            table.integer('userId').unsigned().notNullable().references('id').inTable('users');
        });

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
  .table('relationships', function(table){
    table.dropColumn('userId');
  })
  .table('treeMembers', function(table) {
    table.dropColumn('userId');
  })
};