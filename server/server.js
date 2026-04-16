// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const treeMemberRoutes = require('./routes/treeMemberRoute');
const relationshipRoutes = require('./routes/relationshipRoutes');
const sharedTreeRoutes = require('./routes/sharedTreeRoutes');
const backupRoutes = require('./routes/backupRoutes');
const treeInfoRoutes = require('./routes/treeInfoRoutes');
const eventRoutes = require('./routes/eventRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use('/api/share-trees', sharedTreeRoutes)
app.use('/api/family-members', treeMemberRoutes);
app.use('/api/relationships', relationshipRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/tree-info', treeInfoRoutes);
app.use('/api/events', eventRoutes); 

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
