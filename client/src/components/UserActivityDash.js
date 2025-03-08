import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Calendar } from "lucide-react";
import { motion } from "framer-motion";

//temporary events
const mockEvents = [
  { id: 1, title: "Family member added", date: "2025-03-10", new: true },
  { id: 2, title: "Family member deleted", date: "2025-03-15", new: false },
  { id: 3, title: "Family event created", date: "2025-03-12", new: true },
];

const Dashboard = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Simulating fetching events from an API
    setEvents(mockEvents);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Activity Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event) => (
          <motion.div key={event.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-4 border shadow-md flex justify-between items-center">
              <CardContent>
                <h2 className="text-lg font-semibold">{event.title}</h2>
                <p className="text-sm text-gray-500">{event.date}</p>
              </CardContent>
              {event.new && <Bell className="text-red-500" />}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;