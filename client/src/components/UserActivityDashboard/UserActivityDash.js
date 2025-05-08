import React, { useState, useEffect } from "react";
//import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {ReactComponent as DropDown} from "../../assets/dropdown-arrow.svg";
import {ReactComponent as Plus} from "../../assets/plus-icon.svg";
import {ReactComponent as MemberAdd} from "../../assets/person-crop-circle-fill-badge-plus-svgrepo-com.svg";
import {ReactComponent as MemberRm} from "../../assets/person-crop-circle-fill-badge-xmark-svgrepo-com.svg";
import {ReactComponent as EventAdd} from "../../assets/calendar-new-svgrepo-com.svg";
import NavBar from "../NavBar/NavBar";
import * as styles from "./styles";

import CreateEventPopup from "../CreateEvent/CreateEvent";
import CreateMemoryPopup from "../CreateMemory/CreateMemory";
import { ReactComponent as CalendarIcon } from "../../assets/calendar.svg";
import { ReactComponent as PlusIcon } from "../../assets/plus-sign.svg";

//temporary events; need to replace with data retrieval through API
const mockEvents = [
  { id: 1, title: "Family member added", date: '2025-03-10', description: "You added Squilliam Fancyson to your family tree!", new: true, event: false},
  { id: 2, title: "Family member deleted", date: '2025-03-15', description: "You removed Eugene Krabs from your family tree.", new: false, event: false},
  { id: 3, title: "Family event created", date: '2024-07-08', description: "Martin and Katie's wedding date has been scheduled!", new: true, event: true},
];

//the filterDate value is false for filtering oldest first, and then true for filtering newest first
function Dashboard() {

  // document.body.style.overflow = 'hidden';
  document.body.style.width = '100%'; 

  let data = mockEvents;
  const [events, setEvents] = useState(data);
  const [searchItem, setSearchItem] = useState("");
  const [sortDate, setSortDate] = useState("newest");
  //const [sortedEvents, setSortedEvents] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isHovering, setIsHovering] = useState(false);

  const ButtonStyle = {
    fontFamily: 'Alata',
    backgroundColor: isHovering ? '#3a5a40' : '#ccdecc',
    color: isHovering ? 'white' : 'black',
    borderRadius: '10px',
    border: 'none',
    padding: '10px 20px',
    margin: '10px',
    cursor: 'pointer',
    width: '45%',
    minWidth: '150px',
    marginLeft: '30%',
    marginRight: '30%',
    height: '45px'
  };

  const FilterButtonStyle = {
    alignItems: 'center',
    margin: '10px'
  };

  useEffect(() => {
      // Simulating fetching events from an API
      /* setEvents(mockEvents);
      let sorted = events;

      if (sortSelection === 'newest') {
        sorted = sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else {
        sorted = sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
      }

      setEvents(sorted);
      setSortDate(sortSelection);
 */
    let sortedEvents = data;
    sortedEvents.sort((a, b) =>
      sortDate === "newest" ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)
    );

    const searched = sortedEvents.filter((event) => 
      event.title.toLowerCase().includes(searchItem.toLowerCase()) || event.date.includes(searchItem)
    );
    setSearchResults(searched);


  }, [searchItem, sortDate]);

  return (
    <div style={styles.DefaultStyle}>
      <NavBar />
      <div style={{width: '150px'}}></div>
      <div style={styles.RightSide}>
      <div style={styles.Container}>
        <h1 style={styles.Header}>Family Events</h1>
        <input style={styles.SearchBar} type="text" placeholder="Search by title or date..." value={searchItem} onChange={(e) => setSearchItem(e.target.value)} />
        <div style={styles.ButtonDivStyle}>
          {/*ToDo: need to add a link to the create event page here */}
          <button style={ButtonStyle} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>Create Event</button>
          <button style={FilterButtonStyle} onClick={() => setSortDate(sortDate === "newest" ? "oldest" : "newest")}>
            Sort by: {sortDate === "newest" ? "Newest First" : "Oldest First"}
            <DropDown style={{ width: "23px", height: "25px"}}/>
          </button>
        </div>
        <div style={styles.ListStyle}>
            {searchResults.map((event) => ( //was events.map
              <div key={event.id}>
                <div style={styles.CardContainer}>
                  <h2>{event.title}</h2>
                  <p style={styles.TextStyle}>created on: {event.date}</p>
                </div>
                
              </div>
            ))}
        </div>
      </div>
      <CreateEventPopup trigger={<CalendarIcon style={styles.CalendarButton} />} />
      <CreateMemoryPopup trigger={<PlusIcon style={styles.PlusButton} />} />
      </div>
    </div>
  );
};

export default Dashboard;
//{event.new && <h4 className="text-red-500">New!</h4>}