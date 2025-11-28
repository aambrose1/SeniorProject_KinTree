// authRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');

const { deleteByUser, findByEmail, findById, getAllUsers, syncAuthUser, updateUserProfile, syncDatabaseToAuth, ensureStorageBucket, uploadProfilePicture } = require('../controllers/authController'); 

// Configure multer for file uploads (store in memory for Supabase)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

router.delete('/remove/:id', deleteByUser);
router.get('/user/:id', findById);
router.get('/user/email/:email', findByEmail);
router.get('/users', getAllUsers);
router.post('/sync', syncAuthUser);
router.put('/profile', updateUserProfile);
router.post('/sync-to-auth', syncDatabaseToAuth);
router.post('/ensure-storage-bucket', ensureStorageBucket);
router.post('/upload-profile-picture', upload.single('file'), uploadProfilePicture);

// Error handler for multer (Express error middleware - 4 parameters)
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large', details: 'Maximum file size is 5MB' });
    }
    return res.status(400).json({ error: 'File upload error', details: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message || 'File upload failed' });
  }
  next(err);
});


module.exports = router;
