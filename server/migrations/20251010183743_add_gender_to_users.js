/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return Promise.all([
        knex.schema.table('users', function(table) {
            table.string('gender').notNullable().defaultTo('unknown');
        }),
        knex.schema.table('treeMembers', function(table) {
            table.string('gender').notNullable().defaultTo('unknown');
        })
    ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return Promise.all([
        knex.schema.table('users', function(table) {
            table.dropColumn('gender');
        }),
        knex.schema.table('treeMembers', function(table) {
            table.dropColumn('gender');
        })
    ]);
};
