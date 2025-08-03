const socket = io();

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("message-input");
const button = document.getElementById("send-btn");

button.addEventListener("click", sendMessage);
input.addEventListener("keypress", function (e) {
  if (e.key === "Enter") sendMessage();
});

function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

function sendMessage() {
  const msg = input.value.trim();
  if (!msg) return;

  if (document.getElementById("typing")) return;

  appendUserMessage(msg);
  socket.emit("user message", msg);
  input.value = "";
  input.focus();
  showTyping();
}

function appendUserMessage(message) {
  const template = document.getElementById("user-bubble-template");
  const clone = template.content.cloneNode(true);
  clone.querySelector(".query-text-line").textContent = message;
  chatBox.appendChild(clone);
  scrollToBottom();
}

function appendBotResponse(response) {
  removeTyping();

  const template = document.getElementById("bot-response-template");
  const clone = template.content.cloneNode(true);

  const cleaned = response
    .replace(/\*{1,2}(.+?)\*{1,2}/g, "$1")
    .replace(/[-•#]+\s*/g, "")
    .replace(/\d+\.\s+/g, "")
    .replace(/\n{2,}/g, "\n")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  clone.querySelector(".bot-text-line").textContent = cleaned;
  chatBox.appendChild(clone);
  scrollToBottom();
}

socket.on("bot reply", (reply) => {
  appendBotResponse(reply);
});

function showTyping() {
  removeTyping();

  const typingBubble = document.createElement("div");
  typingBubble.className = "message bot-message typing-indicator";
  typingBubble.innerHTML = `
    <div class="typing-dots">
      <span></span><span></span><span></span>
    </div>
  `;
  typingBubble.id = "typing";
  chatBox.appendChild(typingBubble);
  scrollToBottom();
}

function removeTyping() {
  const typing = document.getElementById("typing");
  if (typing) typing.remove();
}
