import { React, useState, createContext, useContext } from "react"

export const currentContext = createContext();

export const CurrentUserProvider = ({ children }) => {
  const [currentUserID, setCurrentUserIDState] = useState(null);

  const setCurrentUserID = (userID) => {
    localStorage.setItem("currentUserID", userID);
    setCurrentUserIDState(userID);
  }

  const fetchCurrentUser = async () => {
    let currentUserID = localStorage.getItem("currentUserID");
    setCurrentUserIDState(currentUserID);
  }

  return (
    <currentContext.Provider value={{ currentUserID, setCurrentUserID, fetchCurrentUser }}>
      {children}
    </currentContext.Provider>
  )
}

export const useCurrentUser = () => useContext(currentContext)