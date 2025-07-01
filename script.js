const firebaseConfig = {
  apiKey: "AIzaSyC_HkN1u_PYg3cQI-ZdWALK2ahZEycUX4c",
  authDomain: "babblebot-47f51.firebaseapp.com",
  projectId: "babblebot-47f51",
  storageBucket: "babblebot-47f51.firebasestorage.app",
  messagingSenderId: "439780752584",
  appId: "1:439780752584:web:eff490409750827280b9fd",
  measurementId: "G-1RB6TTYTFR"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM Refs
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const typingIndicator = document.getElementById("typing-indicator");
const loader = document.getElementById("loader");
const faceImg = document.getElementById("bot-face-img");

const authOverlay = document.getElementById("auth-overlay");
const authTitle = document.getElementById("auth-title");
const authEmail = document.getElementById("auth-email");
const authPass = document.getElementById("auth-password");
const authAction = document.getElementById("auth-action");
const authToggleText = document.getElementById("auth-toggle-text");
const authToggle = document.getElementById("auth-toggle");

const moods = {
  joy: "avatars/happy.png",
  sadness: "avatars/sad.png",
  anger: "avatars/angry.png",
  fear: "avatars/confused.png",
  surprise: "avatars/happy.png",
  disgust: "avatars/angry.png",
  neutral: "avatars/neutral.png",
  concern: "avatars/sad.png"
};

let isLogin = true;

// Toggle login/signup (safe version using textContent)
authToggle.addEventListener("click", () => {
  isLogin = !isLogin;
  authTitle.textContent = isLogin ? "Login" : "Sign Up";
  authAction.textContent = isLogin ? "Login" : "Sign Up";

  authToggleText.childNodes[0].textContent = isLogin
    ? "Don't have an account? "
    : "Already have an account? ";
  authToggle.textContent = isLogin ? "Sign Up" : "Login";
});

// Auth action (login or signup)
authAction.addEventListener("click", () => {
  const email = authEmail.value;
  const password = authPass.value;
  if (!email || !password) return alert("Please enter both fields");

  const authFn = isLogin
    ? auth.signInWithEmailAndPassword
    : auth.createUserWithEmailAndPassword;

  authFn.call(auth, email, password)
    .then((cred) => {
      console.log("✅ Auth Success:", cred.user.uid);
      authOverlay.style.display = "none";
      window.currentUserId = cred.user.uid;
    })
    .catch((err) => alert("❌ " + err.message));
    console.log("Clicked", isLogin ? "Login" : "Sign Up");
});

// Loader fade
window.addEventListener("load", () => {
  if (loader) {
    loader.style.opacity = 0;
    setTimeout(() => loader.remove(), 1000);
  }
});

// Typing indicator
function showTyping(on) {
  typingIndicator.style.display = on ? "flex" : "none";
  if (on) chatBox.scrollTop = chatBox.scrollHeight;
}

// Add message to chat
function addMessage(who, text) {
  const div = document.createElement("div");
  div.classList.add("message", who);
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Change bot face
function updateExpression(mood) {
  const imagePath = moods[mood] || moods.neutral;
  if (faceImg) {
    faceImg.classList.add("animate");
    faceImg.src = imagePath;
    setTimeout(() => faceImg.classList.remove("animate"), 300);
  }
}

// Submit chat
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!window.currentUserId) return alert("Please log in first.");
  const msg = input.value.trim();
  if (!msg) return;
  addMessage("user", msg);
  input.value = "";
  showTyping(true);

  fetch("https://chatbot-backend-production-a9a3.up.railway.app/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: msg, userId: window.currentUserId })
  })
    .then((r) => r.json())
    .then(({ reply, userMood, botMood }) => {
      showTyping(false);
      addMessage("bot", reply);
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

// Always focus input
document.addEventListener("keydown", () => {
  const isAuthVisible = document.getElementById("auth-overlay")?.style.display !== "none";
  if (!isAuthVisible && document.activeElement !== input) {
    input.focus();
  }
});
