import React, { useState, useEffect, useCallback } from "react";
import { ReactComponent as DropDown } from "../../assets/dropdown-arrow.svg";
import NavBar from "../NavBar/NavBar";
import * as styles from "./styles";

import CreateEventPopup from "../UserEvents/CreateEvent";
import { EventCard } from "../UserEvents/EventCard"; 

import CreateMemoryPopup from "../CreateMemory/CreateMemory";
import { ReactComponent as PlusIcon } from "../../assets/plus-sign.svg";
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

  // Defined locally to support the hover state
  const ButtonStyle = {
    fontFamily: 'Alata',
    backgroundColor: isHovering ? '#3a5a40' : '#ccdecc',
    color: isHovering ? 'white' : 'black',
    borderRadius: '10px',
    border: 'none',
    padding: '10px 20px',
    cursor: 'pointer',
    width: '45%',
    marginLeft: '30%',
    marginRight: '30%',
    height: '45px'
  };

const fetchEvents = useCallback(async () => {
    // 1. Grab the real Auth UUID from the active session
    const { data: { session } } = await supabase.auth.getSession();
    const trueUuid = session?.user?.id;

    if (!trueUuid) return;

    // 2. Pass that true UUID to Supabase instead of currentAccountID
    const { data, error } = await supabase
      .from("event")
      .select("*")
      .eq("userid", trueUuid) 
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching events:", error);
    } else {
      setAllEvents(data || []);
    }
  }, []); // We can remove currentAccountID from the dependencies here

// 3. Update the useEffect to just run fetchEvents on load
  useEffect(() => {
    if (!loading) fetchEvents();
  }, [loading, fetchEvents]);

  // NEW: Logic to update UI without a full page refresh
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

          <div style={styles.ButtonDivStyle}>
            <CreateEventPopup
              onEventCreated={handleEventCreated} 
              trigger={
                <button
                  style={ButtonStyle}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  Create Event
                </button>
              }
            />
            <button
              style={{ margin: "10px" }}
              onClick={() => setSortDate(sortDate === "newest" ? "oldest" : "newest")}
            >
              Sort by: {sortDate === "newest" ? "Newest First" : "Oldest First"}
              <DropDown style={{ width: "23px", height: "25px" }} />
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
        <CreateMemoryPopup trigger={<PlusIcon style={styles.PlusButton} />} />
      </div>
    </div>
  );
}

export default Dashboard;