import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
//import { Card, CardContent } from "@/components/ui/card";
//import { Button } from "@/components/ui/button";
//import { Bell, Calendar } from "lucide-react";
//import { motion } from "framer-motion";
import {ReactComponent as DropDown} from "../assets/dropdown-arrow.svg";
import {ReactComponent as Plus} from "../assets/plus-icon.svg";
import * as styles from "./styles";

//temporary events; need to replace with data retrieval through API
const mockEvents = [
  { id: 1, title: "Family member added", date: '2025-03-10', new: true },
  { id: 2, title: "Family member deleted", date: '2025-03-15', new: false },
  { id: 3, title: "Family event created", date: '2024-07-08', new: true },
];

//the filterDate value is false for filtering oldest first, and then true for filtering newest first
function Dashboard() {

  let data = mockEvents;
  const [events, setEvents] = useState(data);
  const [sortDate, setSortDate] = useState("newest");
  const [sortedEvents, setSortedEvents] = useState(data);
  const [isHovering, setIsHovering] = useState(false);

  const ButtonStyle = {
    fontFamily: 'Alata',
    backgroundColor: isHovering ? '#3a5a40' : '#a2d59f',
    color: isHovering ? 'white' : 'black',
    borderRadius: '10px',
    border: 'none',
    padding: '10px 20px',
    margin: '10px',
    cursor: 'pointer',
    width: '40%',
    height: '45px'
  };

  const handleSort = (sortSelection) => {
    // Simulating fetching events from an API
    setEvents(mockEvents);
    let sorted = events;

    if (sortSelection === 'newest') {
      sorted = sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      sorted = sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    setEvents(sorted);
    setSortDate(sortSelection);

  };

  return (
    <div>
      <h1 style={styles.Header}>Family Events</h1>
      <div style={styles.ButtonDivStyle}>
        {/*ToDo: need to add a link to the create event page here */}
        <button style={ButtonStyle} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>Create Event</button>
      </div>
      <div>
        <div style={styles.ListStyle}>
          <button style={{alignItems: "center", paddingBottom: "0px", paddingLeft: "3px", paddingRight: "30px"}}><DropDown style={{ width: "25px", height: "25px"}}/></button>
          {events.map((event) => (
            <div key={event.id}>
              <div style={styles.Container}>
                <h2 style={styles.ItemStyle}>{event.title}</h2>
                <p style={styles.TextStyle}>{event.date}</p>
              </div>
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
//{event.new && <h4 className="text-red-500">New!</h4>}