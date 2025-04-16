/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('users', function(table){
        table.string('firstName');
        table.string('lastName');
        table.string('phoneNumber');
        table.date('birthDate');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('users', function(table){
        table.dropColumns(
            'firstName',
            'lastName',
            'phoneNumber',
            'birthDate'

        );
}
)};