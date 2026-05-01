import { React, useState, createContext, useContext, useEffect } from "react"
import { supabase } from "./utils/supabaseClient";
import { buildSyncPayload } from "./utils/metadataHelpers";
import { SERVER_URL } from "./config/urls";

export const currentContext = createContext();

export const CurrentUserProvider = ({ children }) => {
  const [currentUserID, setCurrentUserIDState] = useState('');
  const [currentAccountID, setCurrentAccountIDState] = useState(''); 
  const [currentUserName, setCurrentUserNameState] = useState('');
  const [loading, setLoading] = useState(true);
  const [supabaseUser, setSupabaseUser] = useState(null);

  const setCurrentAccountID = (accountID) => { 
    localStorage.setItem("currentAccountID", accountID);
    setCurrentAccountIDState(accountID);
  }

  const setCurrentUserID = (userID) => { 
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
    if (!currentAccountID) return; // Prevent fetching if we don't have the auth UUID yet
    fetch(`${SERVER_URL}/api/family-members/active/${currentAccountID}`)
      .then(async(response) => {
        if (response.ok) {
          const data = await response.json();
          setCurrentUserID(data.id);
          setCurrentUserName(data.firstname + " " + data.lastname);
        } 
        else {
          console.error('Error fetching tree member:', response);
        }
      })
      .catch(error => {
        console.error('Error fetching current user ID:', error);
      });
  }

  // Automatically fetch the tree member ID whenever the Supabase Account ID is set
  useEffect(() => {
    if (currentAccountID) {
      fetchCurrentUserID();
    }
  }, [currentAccountID]);


  // Initialize Supabase auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setSupabaseUser(session.user);
          setCurrentAccountIDState(session.user.id);
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
          let response = await fetch(`${SERVER_URL}/api/auth/user/${session.user.id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          response = await response.json();
          setCurrentAccountIDState(response.id);
          setCurrentUserNameState(session.user.email);
          
          if (event === 'SIGNED_IN') {
            try {
              const m = session.user.user_metadata || {};
              const hasExtendedMetadata = m.address || m.city || m.state || m.country || m.zipcode || 
                                          m.firstName || m.first_name || m.lastName || m.last_name ||
                                          m.phoneNumber || m.phone_number;
              
              if (hasExtendedMetadata) {
                const syncPayload = buildSyncPayload(session.user.id, session.user.email, m);
                const syncResponse = await fetch(`${SERVER_URL}/api/auth/sync`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(syncPayload)
                });
                
                if (!syncResponse.ok) {
                  console.warn('Auth sync failed on login');
                }
              }
            } catch (e) {
              console.warn('Auth sync error on login:', e?.message || e);
            }
          }
        } else {
          setSupabaseUser(null);
          setCurrentAccountIDState('');
          setCurrentUserIDState(''); 
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
  if (!context) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }
  return context;
}