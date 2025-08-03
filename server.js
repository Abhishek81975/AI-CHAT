const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("user message", async (msg) => {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: msg }]
              }
            ]
          })
        }
      );

      const data = await res.json();
      console.log("🔎 Gemini raw response:", JSON.stringify(data, null, 2));

      let reply = "⚠️ Gemini didn't respond properly.";

      if (data?.candidates?.length > 0) {
        const part = data.candidates[0].content?.parts?.[0]?.text;
        if (part) {
          reply = part;
        }
      } else if (data.error?.message) {
        reply = `❌ Error: ${data.error.message}`;
      }

      socket.emit("bot reply", reply);
    } catch (error) {
      console.error("❌ Gemini API error:", error);
      socket.emit("bot reply", "⚠️ Error connecting to Gemini API.");
    }
  });
});

server.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
