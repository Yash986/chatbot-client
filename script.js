const serverBase = "https://chatbot-backend-production-a9a3.up.railway.app";
const serverURL = `${serverBase}/chat`;

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
    .then(res => res.json())
    .then(data => {
      addMessage("Babble", data.reply);
      console.log("Mood detected:", data.mood); // ✅ Debug log
      updateExpression(data.mood);
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
  console.log("Changing face to mood:", mood);
  if (!faceImg) return;

  const moods = {
  joy: "avatars/happy.png",
  sadness: "avatars/sad.png",
  anger: "avatars/angry.png",
  fear: "avatars/confused.png",
  surprise: "avatars/happy.png",
  disgust: "avatars/angry.png",
  neutral: "avatars/neutral.png",
  };

  // If mood is not recognized, fall back to neutral
  const imagePath = moods[mood] || moods.neutral;

  if (faceImg) {
    faceImg.src = imagePath;
    console.log("Set image to:", imagePath); // ✅ debug
  } else {
    console.error("bot-face-img element not found!");
  }
}

document.getElementById("user-input").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});
