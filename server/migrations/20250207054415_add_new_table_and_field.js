/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    // Only create the 'relationships' table
    return knex.schema.createTable('relationships', function(table) {
      table.increments('id').primary();
      table
        .integer('person1_id')
        .unsigned()
        .notNullable() // Corrected: Added parentheses
        .references('id')
        .inTable('treeMembers')
        .onDelete('CASCADE');
      table
        .integer('person2_id')
        .unsigned()
        .notNullable() // Corrected: Added parentheses
        .references('id')
        .inTable('treeMembers')
        .onDelete('CASCADE');
      table.enu('relationshipType', ['parent', 'child', 'sibling', 'spouse', 'stepparent', 'stepchild', 'ex-spouse']).notNullable();
      table.enu('relationshipStatus', ['active', 'inactive']);
      table.timestamps(true, true);
    });
  };
  
  exports.down = function(knex) {
    // Drop the 'relationships' table
    return knex.schema.dropTableIfExists('relationships');
  };
  