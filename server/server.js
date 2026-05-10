// server.js
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const fs = require('fs');
const authRoutes = require('./routes/authRoutes');
const treeMemberRoutes = require('./routes/treeMemberRoute');
const relationshipRoutes = require('./routes/relationshipRoutes');
const sharedTreeRoutes = require('./routes/sharedTreeRoutes');
const backupRoutes = require('./routes/backupRoutes');
const treeInfoRoutes = require('./routes/treeInfoRoutes');
const eventRoutes = require('./routes/eventRoutes');
const memoryRoutes = require('./routes/memoryRoutes');

const app = express();
const port = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';
const clientBuildPath = path.join(__dirname, '../client/build');

app.use(express.json());
app.use(cors());

// Load environment variables from .env.test in test environment, otherwise from .env
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config(); 
}

// Only serve built frontend in production
if (isProduction) {
  if (!fs.existsSync(clientBuildPath)) {
    console.error('ERROR: Client build directory not found at', clientBuildPath);
    console.error('Please run: `npm run build` in the /client/ directory. Then try again.');
    process.exit(1);
  }
  app.use(express.static(clientBuildPath));
}

// Status check  
app.get('/', (req, res) => {
  res.status(200).json();
});
app.use('/api/share-trees', sharedTreeRoutes)
app.use('/api/family-members', treeMemberRoutes);
app.use('/api/relationships', relationshipRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/tree-info', treeInfoRoutes);
app.use('/api/events', eventRoutes); 
app.use('/api/memories', memoryRoutes);

// Let React Router handle all non-API routes
if (isProduction) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
