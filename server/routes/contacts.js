const express = require("express");
const router = express.Router();

// temporary storage (replace with DB later)
let contacts = [];

// POST: save synced contacts
router.post("/", (req, res) => {
  const newContacts = req.body;

  if (!newContacts || newContacts.length === 0) {
    return res.status(400).json({ message: "No contacts provided" });
  }

  contacts = newContacts;

  res.status(200).json({
    message: "Contacts synced successfully",
    data: contacts
  });
});

// GET: retrieve contacts
router.get("/", (req, res) => {
  res.status(200).json(contacts);
});

module.exports = router;