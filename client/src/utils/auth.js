import { supabase } from './supabaseClient';
import { buildSyncPayload } from './metadataHelpers';

// These functions are used to handle the authentication of the user, but only the pure login, logout, etc functionality. 
// It should not include frontend logic like redirects.

// Register new user
export async function registerUser(email, password, metadata = {}) {
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${window.location.origin}/login`
    }
  });
  
  if (error) {
    throw error;
  }

  // Check if user was created (some Supabase configs require email confirmation)
  if (!data?.user) {
    throw new Error('User registration failed: No user was created');
  }

  // After successful signup, upsert the profile into public.users via backend
  try {
    const user = data.user;
    if (!user || !user.id) {
      throw new Error('User object is missing or invalid');
    }

    const syncPayload = buildSyncPayload(user.id, user.email, metadata);
    
    const syncResponse = await fetch('http://localhost:5000/api/auth/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(syncPayload)
    });
    
    if (!syncResponse.ok) {
      // Don't throw here - Auth user is created, database sync can be retried
      console.warn('Registration: Database sync failed, but user can still log in');
    }
  } catch (e) {
    // Non-fatal: keep signup success even if sync fails
    console.warn('Registration: Profile sync error (non-fatal):', e?.message || e);
  }

  return data;
}

// Login existing user
export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// Logout current user
export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email, url) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: url });
  if (error) throw error;
}

export async function updatePassword(password) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

// OAuth: Google sign-in
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/` },
  });
  if (error) throw error;
  return data;
}