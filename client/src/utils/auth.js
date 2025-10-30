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