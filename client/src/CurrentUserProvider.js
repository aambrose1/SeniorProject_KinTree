import { React, useState, createContext, useContext, useEffect } from "react"
import { set } from "react-hook-form";

export const currentContext = createContext();

export const CurrentUserProvider = ({ children }) => {
  const [currentUserID, setCurrentUserIDState] = useState('');
  const [currentAccountID, setCurrentAccountIDState] = useState(''); // TODO login will set this
  const [currentUserName, setCurrentUserNameState] = useState('');
  const [loading, setLoading] = useState(true);

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


  // init
  useEffect(() => {
    const initializeState = () => {
      const storedAccountID = localStorage.getItem("currentAccountID");
      const storedUserID = localStorage.getItem("currentUserID");
      const storedUserName = localStorage.getItem("currentUserName");

      if (storedAccountID) {
        setCurrentAccountIDState(storedAccountID);
      }
      if (storedUserID) {
        setCurrentUserIDState(storedUserID);
      }
      if (storedUserName) {
        setCurrentUserNameState(storedUserName);
      }
      setLoading(false);
    };
    initializeState();
  }, []);

  return (
    <currentContext.Provider value={{ loading, currentAccountID, setCurrentAccountIDState, currentUserID, setCurrentUserIDState, setCurrentAccountID, setCurrentUserID, fetchCurrentUserID, fetchCurrentAccountID, currentUserName }}>
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