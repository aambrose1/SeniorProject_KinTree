require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',  // localhost
  user: process.env.DB_USER || '<Add-Username>',      // Make sure DB_USER is set
  password: process.env.DB_PASSWORD || '<Add-Password>',  // Ensure DB_PASSWORD is set
  database: process.env.DB_NAME || '<Add-DB-Name>',           // Ensure DB_NAME is set
  port: process.env.DB_PORT || 3306        // Port should be 3306
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);

  // Example query to check connection
  connection.query('SELECT DATABASE()', (err, results) => {
    if (err) {
      console.error('Error running query:', err.stack);
      return;
    }
    console.log('Connected to the database:', results[0]['DATABASE()']);
  });

  // Close the connection
  connection.end();
});
