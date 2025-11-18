/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('relationships', function(table) {
        // First drop the existing column if it exists
        table.dropColumn('relationshipType');
    })
    .then(() => {
        return knex.schema.table('relationships', function(table) {
            // Add the new enum column
            table.enu('relationshipType', [
                'parent',
                'child',
                'sibling',
                'aunt',
                'uncle',
                'niece',
                'nephew',
                'spouse',
                'grandparent',
                'grandchild'
            ]).notNullable();
        });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('relationships', function(table) {
        // Drop the enum column
        table.dropColumn('relationshipType');
    })
    .then(() => {
        return knex.schema.table('relationships', function(table) {
            // Add back a simple string column
            table.string('relationshipType');
        });
    });
};
