/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("treeInfo", (table) => {
    table.increments("id").primary();
    table.json("object").notNullable();
    table.integer("userId").unsigned().notNullable();
    table.foreign("userId").references("users.id").onDelete("CASCADE");
    table.timestamps(true, true);
  });
}


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists("treeInfo");
};
