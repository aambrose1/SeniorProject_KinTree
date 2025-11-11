import { React, useState, createContext, useContext, useEffect } from "react"
import { supabase } from "./utils/supabaseClient";

export const currentContext = createContext();

export const CurrentUserProvider = ({ children }) => {
  const [currentUserID, setCurrentUserIDState] = useState('');
  const [currentAccountID, setCurrentAccountIDState] = useState(''); 
  const [currentUserName, setCurrentUserNameState] = useState('');
  const [loading, setLoading] = useState(true);
  const [supabaseUser, setSupabaseUser] = useState(null);

  const setCurrentAccountID = (accountID) => { // logging in will trigger this
    localStorage.setItem("currentAccountID", accountID);
    setCurrentAccountIDState(accountID);
  }

  const setCurrentUserID = (userID) => { // this then needs to be called to get the family member ID
    localStorage.setItem("currentUserID", userID);
    setCurrentUserIDState(userID);
  }

  const setCurrentUserName = (username) => {
    localStorage.setItem("currentUserName", username);
    setCurrentUserNameState(username);
  }

  const fetchCurrentAccountID = async () => {
    const storedAccountID = localStorage.getItem("currentAccountID");
    if (storedAccountID) {
      setCurrentAccountIDState(storedAccountID);
    }
  }

  const fetchCurrentUserID = async () => {
    // temp
    // setCurrentUserIDState('23');
    fetch(`http://localhost:5000/api/family-members/active/${currentAccountID}`)
      .then(async(response) => {
        if (response.ok) {
          const data = await response.json();
          // console.log('Current user ID:', data);
          setCurrentUserID(data.id);
          setCurrentUserName(data.firstName + " " + data.lastName);
        } 
        else {
          console.error('Error:', response);
        }
      })
      .catch(error => {
        console.error('Error fetching current user ID:', error);
      });
  }


  // Initialize Supabase auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setSupabaseUser(session.user);
          let response = await fetch(`http://localhost:5000/api/auth/user/${session.user.id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          response = await response.json();
          setCurrentAccountIDState(response.id);
          setCurrentUserNameState(session.user.email); // Use email as default username
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          let response = await fetch(`http://localhost:5000/api/auth/user/${session.user.id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          response = await response.json();
          setCurrentAccountIDState(response.id);
          setCurrentUserNameState(session.user.email);
          // Auto-sync profile into public.users using auth metadata when available
          try {
            const m = session.user.user_metadata || {};
            await fetch('http://localhost:5000/api/auth/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                auth_uid: session.user.id,
                email: session.user.email,
                username: session.user.email,
                firstName: m.firstName || m.first_name || null,
                lastName: m.lastName || m.last_name || null,
                phoneNumber: m.phoneNumber || m.phone_number || m.phonenum || null,
                birthDate: m.birthDate || m.birthdate || null,
              })
            });
          } catch (e) {
            console.warn('Auth sync failed:', e?.message || e);
          }
        } else {
          setSupabaseUser(null);
          setCurrentAccountIDState('');
          setCurrentUserNameState('');
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <currentContext.Provider value={{ 
      loading, 
      currentAccountID, 
      setCurrentAccountIDState, 
      currentUserID, 
      setCurrentUserIDState, 
      setCurrentAccountID, 
      setCurrentUserID, 
      fetchCurrentUserID, 
      fetchCurrentAccountID, 
      currentUserName,
      supabaseUser 
    }}>
      {children}
    </currentContext.Provider>
  )
}

export const useCurrentUser = () => {
  const context = useContext(currentContext);
  // console.log('CurrentUserContext:', context);
  if (!context) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }
  return context;
}