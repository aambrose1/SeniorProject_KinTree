import React, { useState, useEffect, useCallback } from "react";
import { ReactComponent as DropDown } from "../../assets/dropdown-arrow.svg";
import NavBar from "../NavBar/NavBar";
import * as styles from "./styles";
import CreateEventPopup from "../CreateEvent/CreateEvent";
import CreateMemoryPopup from "../CreateMemory/CreateMemory";
import { ReactComponent as PlusIcon } from "../../assets/plus-sign.svg";
import { useCurrentUser } from "../../CurrentUserProvider";
import supabase from "../../supabaseClient";

function Dashboard() {
  document.body.style.width = "100%";

  const [allEvents, setAllEvents] = useState([]);
  const [searchItem, setSearchItem] = useState("");
  const [sortDate, setSortDate] = useState("newest");
  const [searchResults, setSearchResults] = useState([]);
  const [isHovering, setIsHovering] = useState(false);

  // 1. FIXED: Destructure the correct variable from context
  const { currentAccountID, loading } = useCurrentUser();

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
    // 2. FIXED: Use currentAccountID (the UUID)
    if (!currentAccountID) return;

    const { data, error } = await supabase
      .from("event")
      .select("*")
      .eq("userid", currentAccountID) // Match the UUID in your database
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching events:", error);
    } else {
      setAllEvents(data || []);
    }
  }, [currentAccountID]);

  useEffect(() => {
    // 3. Only fetch if we aren't loading and have an ID
    if (!loading && currentAccountID) {
      fetchEvents();
    }
  }, [currentAccountID, loading, fetchEvents]);

  useEffect(() => {
    let sortedEvents = [...allEvents];

    sortedEvents.sort((a, b) =>
      sortDate === "newest"
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
    );

    const searched = sortedEvents.filter(event =>
      (event.title && event.title.toLowerCase().includes(searchItem.toLowerCase())) ||
      (event.date && event.date.includes(searchItem))
    );

    setSearchResults(searched);
  }, [searchItem, sortDate, allEvents]);

  // Handle Loading state
  if (loading) return <div style={styles.DefaultStyle}><NavBar /><p>Loading events...</p></div>;

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
              trigger={
                <button
                  style={ButtonStyle}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  Create Event
                </button>
              }
              onEventCreated={fetchEvents} // This will refresh the list after posting!
            />

            <button
              style={{ margin: "10px" }}
              onClick={() =>
                setSortDate(sortDate === "newest" ? "oldest" : "newest")
              }
            >
              Sort by: {sortDate === "newest" ? "Newest First" : "Oldest First"}
              <DropDown style={{ width: "23px", height: "25px" }} />
            </button>
          </div>

          <div style={styles.ListStyle}>
            {searchResults.length > 0 ? (
              searchResults.map((event) => (
                <div key={event.id}>
                  <div style={styles.CardContainer}>
                    <h2>{event.title}</h2>
                    <p style={styles.TextStyle}>
                      Date: {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p style={styles.TextStyle}>{event.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', marginTop: '20px' }}>No events found. Try creating one!</p>
            )}
          </div>
        </div>

        <CreateMemoryPopup trigger={<PlusIcon style={styles.PlusButton} />} />
      </div>
    </div>
  );
}

export default Dashboard;