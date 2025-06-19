const serverBase = "https://chatbot-backend-production-a9a3.up.railway.app";
const serverURL = `${serverBase}/chat`;

const moodAvatars = {
  joy: "avatars/happy.png",
  sadness: "avatars/sad.png",
  anger: "avatars/angry.png",
  fear: "avatars/confused.png",
  surprise: "avatars/happy.png",
  disgust: "avatars/angry.png",
  neutral: "avatars/neutral.png",
  concern: "avatars/sad.png",
};

function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  addMessage("You", message);

  fetch(serverURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  })
    .then((res) => res.json())
    .then((data) => {
      addMessage("Babble", data.reply);
      updateExpression(data.botMood);
      console.log("User Mood:", data.userMood);
      console.log("Bot Mood:", data.botMood);
    })
    .catch((err) => {
      console.error("Error fetching reply:", err);
      addMessage("Babble", "Sorry, I couldn’t reach my brain right now 😞");
      updateExpression("neutral");
    });

  input.value = "";
}

function addMessage(sender, text) {
  const chatBox = document.getElementById("chat-box");
  const newMsg = document.createElement("div");
  newMsg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(newMsg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function updateExpression(mood) {
  const faceImg = document.getElementById("bot-face-img");
  const imagePath = moodAvatars[mood] || moodAvatars.neutral;
  if (faceImg) faceImg.src = imagePath;
}

document.getElementById("user-input").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

const input = document.getElementById("user-input");
window.addEventListener("load", () => input.focus());
document.addEventListener("click", () => input.focus());
