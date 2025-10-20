import { supabase } from './supabaseClient';

// These functions are used to handle the authentication of the user, but only the pure login, logout, etc functionality. It should not include frontend logic like redirects.

// Register new user
export async function registerUser(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
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
