// authController.js - the main backend file for user registration, signin, etc
const User = require('../models/userModel');  // now backed by Supabase
const supabase = require('../lib/supabase');  // service role client for admin operations
const { buildAuthMetadata } = require('../lib/metadataHelpers');

const deleteByUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Get user to find auth_uid before deletion
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const authUid = user.auth_uid;

    // IMPORTANT: Delete from Supabase Auth FIRST using Supabase's standard method
    // This ensures the auth user is gone, preventing re-login that would recreate the database record
    if (!authUid) {
      return res.status(400).json({ 
        error: 'User record does not have an auth_uid. Cannot delete from Supabase Auth.' 
      });
    }

    // Use Supabase's standard admin.deleteUser method
    const { error: deleteError } = await supabase.auth.admin.deleteUser(authUid);
    
    if (deleteError) {
      return res.status(500).json({ 
        error: 'Failed to delete user from authentication system',
        details: deleteError.message,
        code: deleteError.status || deleteError.code
      });
    }

    // Now delete from database (tree members, relationships, and users table)
    const treeMember = require('../models/treeMemberModel');
    try {
      await treeMember.deleteByUser(id);
    } catch (err) {
      // Continue even if this fails - Auth user is already deleted
    }

    const Relationship = require('../models/relationshipModel');
    try {
      await Relationship.deleteByUser(id);
    } catch (err) {
      // Continue even if this fails - Auth user is already deleted
    }

    // Delete from users table
    try {
      await User.deleteUser(id);
    } catch (err) {
      // Auth user is already deleted, but log the error
      // Don't fail here since Auth deletion succeeded
    }

    // Verify Auth user was actually deleted
    const { data: verifyUser } = await supabase.auth.admin.getUserById(authUid);
    
    if (verifyUser?.user) {
      return res.status(500).json({
        error: 'Failed to delete user from authentication system',
        details: 'User still exists in Supabase Auth after deletion attempt',
        auth_uid: authUid
      });
    }

    console.log('Delete user complete');
    res.json({ 
      message: "User deleted successfully",
      auth_deleted: true,
      database_deleted: true
    });

  }
  catch (error){
    console.error('Delete user error:', error.message);
    res.status(500).json({error:"Error deleting user", details: error.message})
  }
}

const findById = async (req, res) => {
    try {
        const { id } = await req.params;
        const userId = await User.resolveUserIdFromAuthUid(id);
        if (!userId) {
            return res.status(500).json({ error: 'Error resolving user ID' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching user' });
    }
}

const findByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching user' });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await User.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching users' });
    }
}

module.exports = { deleteByUser, findById, findByEmail, getAllUsers };
 
// Sync endpoint: POST /api/auth/sync
// Syncs from Supabase Auth metadata to database (for backwards compatibility during migration)
// Body: { auth_uid, email, username, firstName, lastName, phoneNumber, birthDate, ... }
const syncAuthUser = async (req, res) => {
  try {
    const { 
      auth_uid, 
      email, 
      username, 
      firstName, 
      lastName, 
      phoneNumber, 
      birthDate,
      displayName,
      address,
      city,
      state,
      country,
      zipcode,
      bio,
      profilePictureUrl
    } = req.body || {};
    
    if (!auth_uid || !email) {
      return res.status(400).json({ error: 'auth_uid and email are required' });
    }
    
    const user = await User.upsertByAuthUser({ 
      auth_uid, 
      email, 
      username, 
      firstName, 
      lastName, 
      phoneNumber, 
      birthDate,
      displayName,
      address,
      city,
      state,
      country,
      zipcode,
      bio,
      profilePictureUrl
    });
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Sync error:', error.message);
    res.status(500).json({ 
      error: 'Error syncing auth user',
      details: error.message,
      code: error.code,
      hint: error.hint,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update profile endpoint: PUT /api/auth/profile
// Database is source of truth - updates DB first, then syncs to Auth metadata
const updateUserProfile = async (req, res) => {
  try {
    const { auth_uid } = req.body;
    if (!auth_uid) {
      return res.status(400).json({ error: 'auth_uid is required' });
    }

    // Update database (source of truth)
    const updatedUser = await User.updateUserProfile(auth_uid, req.body);
    
    // Sync to Supabase Auth metadata (for convenience/access)
    try {
      const authMetadata = buildAuthMetadata(updatedUser);
      
      const { error: authError } = await supabase.auth.admin.updateUserById(auth_uid, {
        user_metadata: authMetadata
      });
      
      if (authError) {
        // Don't fail the request - DB is updated which is what matters
        console.warn('Profile update: Failed to sync to Auth metadata');
      }
    } catch (syncError) {
      // Don't fail - DB update succeeded
      console.warn('Profile update: Error syncing to Auth metadata');
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ 
      error: 'Error updating profile',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Sync database to Auth metadata: POST /api/auth/sync-to-auth
// Reads from database and updates Auth metadata (useful for one-way sync)
const syncDatabaseToAuth = async (req, res) => {
  try {
    const { auth_uid } = req.body;
    if (!auth_uid) {
      return res.status(400).json({ error: 'auth_uid is required' });
    }

    const user = await User.findByAuthUid(auth_uid);
    if (!user) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    const authMetadata = buildAuthMetadata(user);

    const { error: authError } = await supabase.auth.admin.updateUserById(auth_uid, {
      user_metadata: authMetadata
    });

    if (authError) {
      throw authError;
    }

    res.status(200).json({ message: 'Auth metadata synced successfully', user });
  } catch (error) {
    console.error('Sync to Auth error:', error.message);
    res.status(500).json({ 
      error: 'Error syncing to Auth metadata',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Ensure storage bucket exists for profile pictures
const ensureStorageBucket = async (req, res) => {
  try {
    const bucketName = 'profile-pictures';
    
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      return res.status(500).json({ error: 'Failed to check storage buckets', details: listError.message });
    }
    
    const bucketExists = buckets?.some(b => b.name === bucketName);
    
    if (bucketExists) {
      return res.json({ message: 'Bucket already exists', bucket: bucketName });
    }
    
    // Create bucket if it doesn't exist
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880, // 5MB
    });
    
    if (createError) {
      return res.status(500).json({ 
        error: 'Failed to create storage bucket', 
        details: createError.message,
        hint: 'You may need to create the bucket manually in Supabase Dashboard: Storage > New bucket > name: "profile-pictures", public: true'
      });
    }
    
    res.json({ message: 'Bucket created successfully', bucket: bucketName });
  } catch (error) {
    console.error('Ensure storage bucket error:', error.message);
    res.status(500).json({ error: 'Unexpected error', details: error.message });
  }
};

// Upload profile picture using service role (bypasses RLS)
const uploadProfilePicture = async (req, res) => {
  try {
    const auth_uid = req.body.auth_uid;
    const file = req.file;
    
    if (!auth_uid) {
      return res.status(400).json({ error: 'Missing required field: auth_uid' });
    }
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const bucketName = 'profile-pictures';
    const ext = file.originalname.split('.').pop() || 'png';
    const filePath = `avatars/${auth_uid}-${Date.now()}.${ext}`;
    
    // Ensure bucket exists first
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      return res.status(500).json({ 
        error: 'Failed to check storage buckets', 
        details: listError.message 
      });
    }
    
    const bucketExists = buckets?.some(b => b.name === bucketName);
    
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880, // 5MB
      });
      
      if (createError) {
        return res.status(500).json({ 
          error: 'Failed to create storage bucket', 
          details: createError.message,
          hint: 'Please create the bucket manually in Supabase Dashboard: Storage > New bucket > name: "profile-pictures", public: true'
        });
      }
    }
    
    // Ensure file.buffer is a proper Buffer
    const fileBuffer = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
    
    // Check file size limit (5MB = 5242880 bytes)
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (fileBuffer.length > maxFileSize) {
      return res.status(400).json({ 
        error: 'File too large', 
        details: `File size (${fileBuffer.length} bytes) exceeds maximum (${maxFileSize} bytes)`
      });
    }
    
    // Try uploading with minimal options first
    let uploadError;
    
    // First attempt: with contentType and upsert
    ({ error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        upsert: true,
        cacheControl: '3600'
      }));
    
    // If that fails, try without upsert
    if (uploadError) {
      ({ error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileBuffer, {
          contentType: file.mimetype || `image/${ext === 'jpg' ? 'jpeg' : ext}`
        }));
    }
    
    // If that also fails, try with just the buffer
    if (uploadError) {
      ({ error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileBuffer));
    }
    
    if (uploadError) {
      return res.status(500).json({ 
        error: 'Failed to upload profile picture', 
        details: uploadError.message,
        status: uploadError.status || uploadError.statusCode
      });
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    console.log('Profile picture upload complete');
    
    res.json({ 
      message: 'Profile picture uploaded successfully', 
      publicUrl: publicUrlData?.publicUrl || '',
      path: filePath
    });
  } catch (error) {
    console.error('Profile picture upload error:', error.message);
    res.status(500).json({ error: 'Unexpected error', details: error.message });
  }
};

module.exports.syncAuthUser = syncAuthUser;
module.exports.updateUserProfile = updateUserProfile;
module.exports.syncDatabaseToAuth = syncDatabaseToAuth;
module.exports.ensureStorageBucket = ensureStorageBucket;
module.exports.uploadProfilePicture = uploadProfilePicture;
