// server.js
const express = require('express');
const knex = require('knex');
const dotenv = require('dotenv');
const cors = require('cors');
const knexConfig = require('./knexfile');
const authRoutes = require('./routes/authRoutes');
const treeMemberRoutes = require('./routes/treeMemberRoute');  // Fixed typo
const relationshipRoutes = require('./routes/relationshipRoutes');  // Fixed typo

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
app.use(cors());
app.use('/api/family-members', treeMemberRoutes);
app.use('/api/relationships', relationshipRoutes);
app.use('/api/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


// Example route -- follow this template for other routes

/*
app.get('/api/items', async (req, res) => {
    try {
      const items = await db('items').select('*');
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred' });
    }
  });

*/


