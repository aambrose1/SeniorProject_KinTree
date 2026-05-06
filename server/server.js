// server.js
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const treeMemberRoutes = require('./routes/treeMemberRoute');
const relationshipRoutes = require('./routes/relationshipRoutes');
const sharedTreeRoutes = require('./routes/sharedTreeRoutes');
const backupRoutes = require('./routes/backupRoutes');
const treeInfoRoutes = require('./routes/treeInfoRoutes');
const eventRoutes = require('./routes/eventRoutes');
const memoryRoutes = require('./routes/memoryRoutes');

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config(); 
}

const app = express();
const port = process.env.PORT || 5000;
const clientBuildPath = path.join(__dirname, '../client/build');

app.use(express.json());
app.use(cors());

// Serve the built frontend from the backend so the app can run through one tunnel.
app.use(express.static(clientBuildPath));

app.use('/api/share-trees', sharedTreeRoutes)
app.use('/api/family-members', treeMemberRoutes);
app.use('/api/relationships', relationshipRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/tree-info', treeInfoRoutes);
app.use('/api/events', eventRoutes); 
app.use('/api/memories', memoryRoutes);

// Let React Router handle all non-API routes.
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
