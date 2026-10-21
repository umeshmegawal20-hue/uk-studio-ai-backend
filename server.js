const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "100kb" }));

app.get("/", (req, res) => {
  res.send("UK STUDIO AI Backend is Running!");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// UK STUDIO AI chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, mode } = req.body || {};
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error: "OPENROUTER_API_KEY is missing in Render Environment"
      });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Messages are required"
      });
    }

    const safeMessages = messages
      .filter(
        (m) =>
          m &&
          ["user", "assistant"].includes(m.role) &&
          typeof m.content === "string"
      )
      .slice(-12)
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, 20000)
      }));

    if (
      safeMessages.length === 0 ||
      !safeMessages.some((m) => m.role === "user")
    ) {
      return res.status(400).json({
        error: "Please send a valid user message"
      });
    }

    const systemPrompt =
      mode === "game"
        ? "You are UK STUDIO AI, a helpful game coding assistant. Help users create complete working games. When asked for a single HTML game, provide complete HTML, CSS, and JavaScript in one file. Explain simply in Hindi when appropriate."
        : "You are UK STUDIO AI, a helpful AI assistant. Reply clearly and naturally, using Hindi when the user uses Hindi.";

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Title": "UK STUDIO AI"
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...safeMessages
          ]
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error(
        "OpenRouter error:",
        response.status,
        result.error?.message || "Request failed"
      );

      return res.status(502).json({
        error:
          result.error?.message ||
          "OpenRouter request failed. Check API key, model and account credits."
      });
    }

    const answer = result.choices?.[0]?.message?.content;

    if (typeof answer !== "string" || !answer.trim()) {
      return res.status(502).json({
        error: "OpenRouter returned an empty response"
      });
    }

    return res.json({ answer });

  } catch (error) {
    console.error("Chat server error:", error.message);

    return res.status(500).json({
      error: "Server error while contacting the AI"
    });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("UK STUDIO AI running on port " + PORT);
});
