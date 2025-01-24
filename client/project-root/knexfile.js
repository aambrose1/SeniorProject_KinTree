// knexfile.js

require('dotenv').config(); // Load environment variables

module.exports = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  },
  migrations: {
    directory: './migrations', // Directory where migration files will be saved
  },
};

  
