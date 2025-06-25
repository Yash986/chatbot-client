// DOM refs 
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const typingIndicator = document.getElementById("typing-indicator");
const loader = document.getElementById("loader");
const faceImg = document.getElementById("bot-face-img"); // ⬅️ Using image now

// Mood → avatar image map
const moods = {
  joy: "avatars/happy.png",
  sadness: "avatars/sad.png",
  anger: "avatars/angry.png",
  fear: "avatars/confused.png",
  surprise: "avatars/happy.png",
  disgust: "avatars/angry.png",
  neutral: "avatars/neutral.png",
  concern: "avatars/sad.png" // ✅ concern uses sad face
};

// 🔐 Persistent User ID using localStorage
let userId = localStorage.getItem("babble_user_id");
if (!userId) {
  userId = crypto.randomUUID(); // Requires HTTPS
  localStorage.setItem("babble_user_id", userId);
}

// Fade out loader
window.addEventListener("load", () => {
  if (loader) {
    loader.style.opacity = 0;
    setTimeout(() => loader.remove(), 1000);
  }
});

// Show/hide typing indicator
function showTyping(on) {
  typingIndicator.style.display = on ? "flex" : "none";
  if (on) {
    chatBox.scrollTop = chatBox.scrollHeight; // ✅ Keep it at the bottom
  }
}

// Add chat message
function addMessage(who, text) {
  const div = document.createElement("div");
  div.classList.add("message", who);
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Update face image
function updateExpression(mood) {
  const imagePath = moods[mood] || moods.neutral;
  if (faceImg) {
    faceImg.classList.add("animate");
    faceImg.src = imagePath;
    setTimeout(() => faceImg.classList.remove("animate"), 300);
  }
}

// Send and receive
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = input.value.trim();
  if (!msg) return;
  addMessage("user", msg);
  input.value = "";
  showTyping(true);

  fetch("https://chatbot-backend-production-a9a3.up.railway.app/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: msg, userId }) // ✅ Include userId
  })
    .then((r) => r.json())
    .then(({ reply, userMood, botMood }) => {
      showTyping(false);
      addMessage("bot", reply);

      // ✅ Debug logs
      console.log("User Mood:", userMood);
      console.log("Bot Mood:", botMood);

      updateExpression(botMood);
    })
    .catch(() => {
      showTyping(false);
      addMessage("bot", "Sorry, I couldn’t reach my brain right now 😞");
      updateExpression("neutral");
    });
});

// Focus input on any key
document.addEventListener("keydown", () => {
  if (document.activeElement !== input) input.focus();
});
