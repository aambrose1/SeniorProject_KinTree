/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .createTable('users', (table) => {
            table.increments('id').primary();
            table.string('username').unique().notNullable();
            table.string('password').notNullable();
            table.string('email').unique().notNullable();
            table.timestamps(true,true);
        })
        .createTable('treeMembers',(table) => {
            table.increments('id').primary();
            table.string('firstName').notNullable();
            table.string('lastName').notNullable();
            table.date('birthDate');
            table.date('deathDate');
            table.string('location');
            table.string('phoneNumber');
            table.timestamps(true,true);
        })
        .createTable('relationships', (table) => {
            table.increments('id').primary();
            table
                .integer('person1_id')
                .unsigned()
                .notNullable
                .referencer('id')
                .inTable('treeMembers')
                .onDelete('CASCADE');
            table
                .integer('person2_id')
                .unsigned()
                .notNullable
                .referencer('id')
                .inTable('treeMembers')
                .onDelete('CASCADE');
            table.enu('relationshipType', ['parent', 'child', 'sibling', 'spouse', 'stepparent', 'stepchild', 'ex-spouse']).notNullable();
            table.enu('relationshipStatus', ['active', 'inactive']);
            table.timestamps(true,true);
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists('treeMembers')
        .dropTableIfExists('users')
        .dropTableIfExists('relationships');
};

//changes have not been migrated since MySQL was not connected on my local machine (drm528 11/6/2024)