import React, { useState, useEffect, useCallback } from "react";
import { ReactComponent as DropDown } from "../../assets/dropdown-arrow.svg";
import NavBar from "../NavBar/NavBar";
import * as styles from "./styles";

import CreateEventPopup from "../UserEvents/CreateEvent";
import { EventCard } from "../UserEvents/EventCard"; 

import CreateMemoryPopup from "../CreateMemory/CreateMemory";
import { AiOutlinePlus } from "react-icons/ai";
import { useCurrentUser } from "../../CurrentUserProvider";
import { supabase } from "../../utils/supabaseClient"; 

function Dashboard() {
  document.body.style.width = "100%";

  const [allEvents, setAllEvents] = useState([]);
  const [searchItem, setSearchItem] = useState("");
  const [sortDate, setSortDate] = useState("newest");
  const [searchResults, setSearchResults] = useState([]); 
  const [isHovering, setIsHovering] = useState(false);

  const { currentAccountID, loading } = useCurrentUser();

  const fetchEvents = useCallback(async () => {
    // 1. Grab the real Auth UUID from the active session
    const { data: { session } } = await supabase.auth.getSession();
    const trueUuid = session?.user?.id;

    if (!trueUuid) return;

    try {
      // 2. Send the GET request to your backend route
      const response = await fetch(`http://localhost:5000/api/events/${trueUuid}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch events from server");
      }

      // 3. Parse the data
      const data = await response.json();
      
      // 🟢 THE NEW LOG: See the full list of events the server sent back
      console.log("FRONTEND: Dashboard successfully fetched events ->", data);

      // 4. Set the state
      setAllEvents(data || []);

    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }, []); 

  useEffect(() => {
    if (!loading) fetchEvents();
  }, [loading, fetchEvents]);

  const handleEventCreated = (newEvent) => {
    setAllEvents((prev) => [newEvent, ...prev]);
  };

  const handleEventDeleted = (id) => {
    setAllEvents((prev) => prev.filter(event => event.id !== id));
  };

  const handleEventUpdated = (updatedEvent) => {
    setAllEvents((prev) => prev.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ));
  };

  useEffect(() => {
    let sortedEvents = [...allEvents];
    sortedEvents.sort((a, b) =>
      sortDate === "newest" ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)
    );

    const searched = sortedEvents.filter(event =>
      (event.title && event.title.toLowerCase().includes(searchItem.toLowerCase())) ||
      (event.date && event.date.includes(searchItem))
    );
    setSearchResults(searched);
  }, [searchItem, sortDate, allEvents]);

  if (loading) return <div style={styles.DefaultStyle}><NavBar /><p>Loading...</p></div>;

  return (
    <div style={styles.DefaultStyle}>
      <NavBar />
      <div style={styles.RightSide}>
        <div style={styles.Container}>
          <h1 style={styles.Header}>Family Events</h1>
          
          <input 
            style={styles.SearchBar} 
            type="text" 
            placeholder="Search by title or date..." 
            value={searchItem} 
            onChange={(e) => setSearchItem(e.target.value)} 
          />

          <div className="animate-in" style={styles.ActionRow}>
            <CreateEventPopup
              onEventCreated={handleEventCreated} 
              trigger={
                <button className="kt-button kt-button-primary">
                   Create Event
                </button>
              }
            />
            <button
              style={styles.SortButton}
              onClick={() => setSortDate(sortDate === "newest" ? "oldest" : "newest")}
            >
              Sorted by {sortDate === "newest" ? "Newest" : "Oldest"}
              <DropDown style={{ width: "20px", height: "20px" }} />
            </button>
          </div>

          <div style={styles.ListStyle}>
            {searchResults.length > 0 ? (
              searchResults.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onDeleted={handleEventDeleted} 
                  onUpdated={handleEventUpdated}
                />
              ))
            ) : (
              <p style={{ textAlign: 'center', marginTop: '20px' }}>No events found.</p>
            )}
          </div>
        </div>
        <CreateMemoryPopup trigger={
          <div className="fab-hover" style={styles.PlusButton}>
            <AiOutlinePlus size={30} color="white" />
          </div>
        } />
      </div>
    </div>
  );
}

export default Dashboard;