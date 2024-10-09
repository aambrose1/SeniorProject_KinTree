// server.js
const express = require('express');
const knex = require('knex');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  }
});

app.use(express.json());

// Define your routes here

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Example route -- follow this template for other routes
app.get('/api/items', async (req, res) => {
    try {
      const items = await db('items').select('*');
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred' });
    }
  });