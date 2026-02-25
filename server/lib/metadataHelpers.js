// Helper functions for building auth metadata from user data

/**
 * Builds auth metadata object from user data for Supabase Auth user_metadata
 * @param {Object} user - User object from database
 * @returns {Object} Auth metadata object
 */
function buildAuthMetadata(user) {
  return {
    first_name: user.firstname || null,
    last_name: user.lastname || null,
    display_name: user.display_name || null,
    phone_number: user.phonenumber || null,
    birthdate: user.birthdate || null,
    address: user.address || null,
    city: user.city || null,
    state: user.state || null,
    country: user.country || null,
    zipcode: user.zipcode || null,
    bio: user.bio || null,
    profile_picture_url: user.profile_picture_url || null,
  };
}

module.exports = { buildAuthMetadata };

