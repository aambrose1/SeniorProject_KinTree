import { useState, createContext, useContext, useEffect } from "react"

const currentContext = createContext();

export const useCurrentUser = () => {
  const context = useContext(currentContext);
  if (!context) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }
  return context;
}

export const CurrentUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentMember, setCurrentMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    try {
      fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
        .then(async(response) => {
          if (!response.ok) {
            throw new Error(response.error);
          }

          const userData = await response.json();
          setCurrentUser(userData);
          window.location.href = `/tree/`;
      });
    } catch (error) {
        setError(error.message);
        throw error;
      }
    }
  

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      setCurrentUser(null);
      setCurrentMember(null);
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  // const fetchCurrentUser = async () => {
  //   fetch(`http://localhost:5000/api/family-members/active/${currentAccountID}`)
  //     .then(async(response) => {
  //       if (response.ok) {
  //         const data = await response.json();
  //         setCurrentUser(data);
  //       } 
  //       else {
  //         console.error('Error:', response);
  //       }
  //     })
  //     .catch(error => {
  //       console.error('Error fetching current user ID:', error);
  //     });
  // }


  // // init
  // useEffect(() => {
  //   const initializeState = () => {
  //     const storedAccountID = localStorage.getItem("currentAccountID");
  //     const storedUserID = localStorage.getItem("currentUserID");
  //     const storedUserName = localStorage.getItem("currentUserName");

  //     if (storedAccountID) {
  //       setCurrentAccountIDState(storedAccountID);
  //     }
  //     if (storedUserID) {
  //       setCurrentUserIDState(storedUserID);
  //     }
  //     if (storedUserName) {
  //       setCurrentUserNameState(storedUserName);
  //     }
  //     setLoading(false);
  //   };
  //   initializeState();
  // }, []);

  const value = {
    // currentUser,
    // currentMember,
    // loading,
    // error,
    login,
    logout,
  };

  return (
    <currentContext.Provider value={value}>
      {children}
    </currentContext.Provider>
  );
};

