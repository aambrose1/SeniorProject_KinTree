// src/handlers/authHandlers.js
import { loginUser, registerUser, logoutUser, resetPassword, updatePassword, signInWithGoogle } from '../utils/auth';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

// This page is used to handle authentication and includes redirects and error handling.

export async function handleLogin(email, password) {
  try {
    const data = await loginUser(email, password); // call the pure login function
    console.log("Logged in user:", data.user);
    // Do not redirect here; caller will handle MFA step and navigation
    return data;
  } catch (error) {
    console.error('Login error:', error.message);
    throw error; // so form onSubmit can catch it (error displayed in red text on login page)
  }
}

export async function handleRegister(email, password, metadata = {}) {
  try {
    const data = await registerUser(email, password, metadata);
    console.log("Registered user:", data.user);
    return data; // Return the data so the calling function can use it
  } catch (error) {
    console.error('Registration error:', error.message);
    alert(error.message);
    throw error; // so form onSubmit can catch it
  }
}

// Logout handler
export async function handleLogout() {
  try {
    await logoutUser();
    window.location.href = '/login'; // redirect after logout
  } catch (error) {
    console.error('Logout error:', error.message);
    alert(error.message);
  }
}

export async function handleResetPassword(email) {
  try {
    const url = `${BASE_URL}/update-password`;
    await resetPassword(email, url);
  } catch (error) {
    console.error('Reset Password error:', error.message);
    alert(error.message);
    throw error; // so form onSubmit can catch it
  }
}

export async function handleUpdatePassword(password) {
  try {
    await updatePassword(password);
    window.location.href = '/login';
  } catch (error) {
    console.error('Update Password error:', error.message);
    alert(error.message);
    throw error; // so form onSubmit can catch it
  }
}

// Google OAuth handler
export async function handleSignInWithGoogle() {
  try {
    await signInWithGoogle(); // redirects to Google, then back to our site
  } catch (error) {
    console.error('Google sign-in error:', error.message);
    alert(error.message);
    throw error;
  }
}