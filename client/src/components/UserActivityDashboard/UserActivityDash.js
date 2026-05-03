import React, { useState, useEffect, useCallback } from "react";
import { ReactComponent as DropDown } from "../../assets/dropdown-arrow.svg";
import NavBar from "../NavBar/NavBar";
import * as styles from "./styles";

import CreateEventPopup from "../UserEvents/CreateEvent";
import { EventCard } from "../UserEvents/EventCard"; 

import CreateMemoryPopup from "../UserMemory/CreateMemory";
import MemoryCard from "../UserMemory/MemoryCard"; 
import { AiOutlinePlus } from "react-icons/ai";
import { useCurrentUser } from "../../CurrentUserProvider";
import { supabase } from "../../utils/supabaseClient"; 
import { SERVER_URL } from "../../config/urls";

function Dashboard() {
  document.body.style.width = "100%";

  // State for Events

  const [allEvents, setAllEvents] = useState([]);
  const [searchItem, setSearchItem] = useState("");
  const [sortDate, setSortDate] = useState("newest");
  const [searchResults, setSearchResults] = useState([]); 
  
  // State for Memories
  const [allMemories, setAllMemories] = useState([]); 
  
  // Pulling the Tree Member integer ID from your context
  const { currentUserID, currentAccountID, loading } = useCurrentUser();
  const [isHovering, setIsHovering] = useState(false);

  // --- FETCH EVENTS ---
  // Sort and filter events
  const fetchEvents = useCallback(async () => {
    // 1. Grab the real Auth UUID from the active session
    const { data: { session } } = await supabase.auth.getSession();
    const trueUuid = session?.user?.id;

    if (!trueUuid) return;

    try {
      // 2. Send the GET request to your backend route
      const response = await fetch(`${SERVER_URL}/api/events/${trueUuid}`);
      
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

  // --- FETCH MEMORIES ---
  const fetchMemories = useCallback(async () => {
    // Wait for the integer ID to be available
    if (!currentUserID || isNaN(currentUserID)) return;

    try {
      const response = await fetch(`${SERVER_URL}/api/memories/${currentUserID}`);
      if (!response.ok) throw new Error("Failed to fetch memories");
      
      const data = await response.json();
      console.log("FRONTEND: Fetched memories ->", data);
      setAllMemories(data || []);
    } catch (error) {
      console.error("Error fetching memories:", error);
    }
  }, [currentUserID]);

  // Initial Data Fetch
  useEffect(() => {
    if (!loading) {
      fetchEvents();
      fetchMemories();
    }
  }, [loading, fetchEvents, fetchMemories]);

  // --- EVENT HANDLERS ---
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

  // --- MEMORY HANDLERS ---
  const handleMemoryCreated = (newMemory) => {
    setAllMemories((prev) => [newMemory, ...prev]);
  };

  const handleMemoryDeleted = (id) => {
    setAllMemories((prev) => prev.filter(m => m.id !== id));
  };

  const handleMemoryUpdated = (updatedMemory) => {
    setAllMemories((prev) => prev.map(m => 
      m.id === updatedMemory.id ? updatedMemory : m
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


  // --- DEBUG LOG ADDED HERE ---
  console.log("DEBUG: currentUserID inside Dashboard is:", currentUserID);



  if (loading) return <div style={styles.DefaultStyle}><NavBar /><p>Loading...</p></div>;

  return (
    <div style={styles.DefaultStyle}>
      <NavBar />
      <div style={styles.RightSide}>
        <div style={styles.Container}>
          
          {/* --- EVENTS SECTION --- */}
          <h1 style={styles.Header}>Family Events</h1>
          
          <input 
            style={styles.SearchBar} 
            type="text" 
            placeholder="Search events..." 
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

          {/* --- MEMORIES SECTION --- */}
          <h1 style={{ ...styles.Header, marginTop: '50px' }}>Family Memories</h1>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', paddingBottom: '80px' }}>
            {allMemories.length > 0 ? (
              allMemories.map((memory) => (
                <MemoryCard 
                  key={memory.id} 
                  memory={memory} 
                  onDeleted={handleMemoryDeleted} 
                  onUpdated={handleMemoryUpdated}
                />
              ))
            ) : (
              <p style={{ textAlign: 'center', width: '100%' }}>No memories yet!</p>
            )}
          </div>
        <CreateMemoryPopup 
          trigger={
            <div className="fab-hover" style={styles.PlusButton}>
              <AiOutlinePlus size={30} color="white" />
            </div>
          } 
          onMemoryCreated={handleMemoryCreated} 
          profileID={currentUserID} 
        />
      </div>
    </div>
  );
}

export default Dashboard;