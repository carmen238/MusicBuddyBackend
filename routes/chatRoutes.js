const express = require('express');
const router = express.Router();

const { getMessages, insertMessage } = require('../models/userModel');

// GET MESSAGES
router.get("/messages/:chatId", async (req, res) => {
  try {
    console.log("GET MESSAGES FOR CHAT ID:", req.params.chatId);
    const { chatId } = req.params;

    const messages = await getMessages(chatId);

    if (!messages || messages.length === 0) {
      return res.status(404).json({
        success: false,
        messages: [],
        message: "No messages found"
      });
    }

    res.status(200).json({
      success: true,
      messages,
      message: "Messages retrieved successfully"
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching messages"
    });
  }
});

// INSERT MESSAGE
router.post("/messages", async (req, res) => {
  try {
        console.log("INSERT MESSAGE FOR CHAT ID:", req.params.chatId);

    const message = req.body;

    await insertMessage(message);

    res.status(200).json({
      success: true,
      message: "Message saved"
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Error saving message"
    });
  }
});

module.exports = router;