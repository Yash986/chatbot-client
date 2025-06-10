const serverBase = "<https://chatbot-backend-production-a9a3.up.railway.app/>";
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
      addMessage("Bot", data.reply);
      updateExpression(data.mood);
    })
    .catch(() => {
      addMessage("Bot", "Sorry, I couldn’t reach my brain right now 😞");
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
  const moods = {
    happy: "avatars/happy.png",
    sad: "avatars/sad.png",
    angry: "avatars/angry.png",
    confused: "avatars/confused.png",
    neutral: "avatars/neutral.png",
  };
  faceImg.src = moods[mood] || moods.neutral;
}
