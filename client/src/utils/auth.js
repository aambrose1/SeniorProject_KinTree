import { supabase } from './supabaseClient';

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
  if (error) throw error;

  // After successful signup, upsert the profile into public.users via backend
  try {
    const user = data?.user || (await supabase.auth.getUser()).data?.user;
    if (user) {
      await fetch('http://localhost:5000/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_uid: user.id,
          email: user.email,
          username: user.email,
          // Map possible metadata key variants
          firstName: metadata.firstName || metadata.first_name || null,
          lastName: metadata.lastName || metadata.last_name || null,
          phoneNumber: metadata.phoneNumber || metadata.phone_number || metadata.phonenum || null,
          birthDate: metadata.birthDate || metadata.birthdate || null,
          gender: metadata.gender || null,
        })
      });
    }
  } catch (e) {
    // Non-fatal: keep signup success even if sync fails
    console.warn('Profile sync skipped:', e?.message || e);
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