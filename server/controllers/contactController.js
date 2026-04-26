const Contact = require("../models/Contacts");


exports.syncContacts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contacts } = req.body;

    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({
        message: "Contacts must be an array"
      });
    }

    // Attach user_id to each contact before saving
    const formattedContacts = contacts.map((c) => ({
      user_id: userId,
      name: c.name,
      phone: c.phone,
      email: c.email || null,
      relationship: c.relationship || null
    }));

    const result = await Contact.create(formattedContacts);

    res.status(200).json({
      message: "Contacts synced successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      message: "Error syncing contacts",
      error: error.message
    });
  }
};