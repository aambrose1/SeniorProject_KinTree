/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
    .createTable('sharedTrees', (table) =>{
        table.increments('sharedTreeID').primary();
        table.integer('senderID').unsigned().notNullable().references('id').inTable('users');
        table.integer('recieverID');
        table.enu('perms', ['view', 'edit']);
        table.enu('parentalSide', ['paternal', 'maternal', 'both']);
        table.dateTime('sahreDate');
        table.json("treeInfo");
    } )

};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists('sharedTrees')
};
