import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import {ReactComponent as DropDown} from "../assets/"
import * as styles from "./styles"

//temporary events; need to replace with data retrieval through API
const mockEvents = [
  { id: 1, title: "Family member added", date: 3102025, new: true },
  { id: 2, title: "Family member deleted", date: 3152025, new: false },
  { id: 3, title: "Family event created", date: 7082025, new: true },
];

//the filterDate value is false for filtering oldest first, and then true for filtering newest first
function Dashboard() {
  const [events, setEvents] = useState([]);
  const [sortDate, setSortDate] = useState("newest");
  const [sortedEvents, setSortedEvents] = useState(data);

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
      <h1 style={styles.Header}>User Activity Dashboard</h1>
      <button ></button>
      <div style={styles.Container}>
        <div style={styles.ListStyle}>
          {events.map((event) => (
            <motion.div key={event.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card style={styles.Card}>
                <CardContent style={styles.CardContent}>
                  <h2 style={styles.ItemStyle}>{event.title}</h2>
                  <p style={styles.TextStyle}>{event.date}</p>
                </CardContent>
                {event.new && <Bell className="text-red-500" />}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;