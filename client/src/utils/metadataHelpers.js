// Helper functions for normalizing and mapping user metadata fields

/**
 * Normalizes metadata fields from various possible key names to standard format
 * @param {Object} metadata - Metadata object from Supabase Auth or form data
 * @returns {Object} Normalized metadata with standard field names
 */
export function normalizeMetadata(metadata = {}) {
  return {
    firstName: metadata.firstName || metadata.first_name || null,
    lastName: metadata.lastName || metadata.last_name || null,
    phoneNumber: metadata.phoneNumber || metadata.phone_number || metadata.phonenum || null,
    birthDate: metadata.birthDate || metadata.birthdate || null,
    displayName: metadata.displayName || metadata.display_name || null,
    address: metadata.address || null,
    city: metadata.city || null,
    state: metadata.state || null,
    country: metadata.country || null,
    zipcode: metadata.zipcode || null,
    bio: metadata.bio || null,
    profilePictureUrl: metadata.profilePictureUrl || metadata.profile_picture_url || null,
  };
}

/**
 * Builds sync payload for backend /api/auth/sync endpoint
 * @param {string} authUid - Supabase Auth user ID
 * @param {string} email - User email
 * @param {Object} metadata - Normalized or raw metadata
 * @returns {Object} Sync payload for backend
 */
export function buildSyncPayload(authUid, email, metadata = {}) {
  const normalized = normalizeMetadata(metadata);
  
  // Auto-generate display name from first + last name if not provided
  const displayName = normalized.displayName || 
    (normalized.firstName && normalized.lastName 
      ? `${normalized.firstName} ${normalized.lastName}`.trim() 
      : null);

  return {
    auth_uid: authUid,
    email: email,
    username: email,
    firstName: normalized.firstName,
    lastName: normalized.lastName,
    phoneNumber: normalized.phoneNumber,
    birthDate: normalized.birthDate,
    displayName: displayName,
    address: normalized.address,
    city: normalized.city,
    state: normalized.state,
    country: normalized.country,
    zipcode: normalized.zipcode,
    bio: normalized.bio,
    profilePictureUrl: normalized.profilePictureUrl,
  };
}

