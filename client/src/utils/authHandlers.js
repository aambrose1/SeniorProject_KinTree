// src/handlers/authHandlers.js
import { loginUser, registerUser, logoutUser } from '../utils/auth';

// This page is used to handle authentication and includes redirects and error handling.

export async function handleLogin(email, password) {
  try {
    const data = await loginUser(email, password); // call the pure login function
    console.log("Logged in user:", data.user);
    window.location.href = '/home'; // redirect after login to home
  } catch (error) {
    console.error('Login error:', error.message);
    alert(error.message);
    throw error; // so form onSubmit can catch it
  }
}

export async function handleRegister(email, password) {
  try {
    const data = await registerUser(email, password);
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
