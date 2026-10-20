
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("UK STUDIO AI Backend is Running!");
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const apiKey = process.env.AI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error: "AI_API_KEY is not configured on the server"
      });
    }

    // AI provider integration will be added next.
    return res.status(501).json({
      error: "AI connection setup is pending"
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("UK STUDIO AI running on port " + PORT);
});
        
