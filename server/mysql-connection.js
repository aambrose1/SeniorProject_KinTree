require('dotenv').config();
const mysql = require('mysql2');

console.log('Database Config:', process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_DATABASE);

const connection = mysql.createConnection({
  host: process.env.DB_HOST,  // localhost
  user: process.env.DB_USER,      // Make sure DB_USER is set
  password: process.env.DB_PASSWORD,  // Ensure DB_PASSWORD is set
  database: process.env.DB_DATABASE,           // Ensure DB_DATABASE is set
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
  
  connection.query('SHOW DATABASES', (err, results) => {
    if (err) {
        console.error('Error fetching databases:', err);
    } else {
        console.log('Databases:', results.map(db => db.Database));
    }
    connection.end(); // Close the connection
  });

  // Close the connection
  connection.end();
});
