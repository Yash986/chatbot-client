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
const authAction = document.getElementById("auth-action"); // The login/signup button
const authToggleText = document.getElementById("auth-toggle-text");
const authToggle = document.getElementById("auth-toggle");
const authErrorMessage = document.getElementById("auth-error-message"); // Reference to the error message div

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

// Function to display/hide auth errors in the dedicated div
function displayAuthError(message = "") {
  if (authErrorMessage) {
    authErrorMessage.textContent = message;
    if (message) {
      authErrorMessage.classList.add('show'); // Add 'show' class for visibility and opacity
    } else {
      authErrorMessage.classList.remove('show'); // Remove 'show' class to hide
    }
  }
}

// Toggle login/signup
authToggle.addEventListener("click", () => {
  isLogin = !isLogin;
  authTitle.textContent = isLogin ? "Login" : "Sign Up";
  authAction.textContent = isLogin ? "Login" : "Sign Up"; // Reset button text
  authAction.disabled = false; // Ensure button is enabled when toggling
  authAction.classList.remove('loading'); // Remove loading class
  displayAuthError(""); // Clear any previous error message on toggle
    authToggleText.childNodes[0].textContent = isLogin
    ? "Don't have an account? "
    : "Already have an account? ";
  authToggle.textContent = isLogin ? "Sign Up" : "Login";
});

// Auth action (login or signup)
authAction.addEventListener("click", () => {
  const email = authEmail.value;
  const password = authPass.value;

  displayAuthError(""); // Clear any previous error message on a new attempt

  if (!email || !password) {
    displayAuthError("Please enter both fields.");
    return; // Stop execution if fields are empty
  }

  // Show loading indicator on button
  authAction.disabled = true; // Disable button to prevent multiple clicks
  authAction.classList.add('loading'); // Add loading class for styling
  const originalButtonText = authAction.textContent; // Store original text
  authAction.textContent = isLogin ? "Logging in..." : "Signing up...";

  const authFn = isLogin
    ? auth.signInWithEmailAndPassword
    : auth.createUserWithEmailAndPassword;

  authFn.call(auth, email, password)
    .then((cred) => {
      console.log("✅ Auth Success:", cred.user.uid);
      authOverlay.style.display = "none"; // Hide overlay on success
      window.currentUserId = cred.user.uid;
      displayAuthError(""); // Clear error on success
    })
    .catch((err) => {
      console.error("Auth Error:", err); // Log the full error for debugging
      let errorMessage = "An unknown authentication error occurred.";
      // Firebase error codes usually follow 'auth/error-code' format
      if (err.code) {
        switch (err.code) {
          case 'auth/wrong-password':
            errorMessage = "Incorrect password. Please try again.";
            break;
          case 'auth/user-not-found':
            errorMessage = "No account found with that email.";
            break;
          case 'auth/email-already-in-use':
            errorMessage = "This email is already in use. Please login or use a different email.";
            break;
          case 'auth/invalid-email':
            errorMessage = "Please enter a valid email address.";
            break;
          case 'auth/weak-password':
            errorMessage = "Password should be at least 6 characters long.";
            break;
          case 'auth/network-request-failed':
            errorMessage = "Network error. Please check your internet connection.";
            break;
          default:
            errorMessage = err.message; // Fallback to Firebase's raw message
        }
      } else if (err.message) {
        errorMessage = err.message; // Fallback to generic message if no code
      }
      displayAuthError(errorMessage); // *** THIS IS THE KEY CHANGE ***
    })
    .finally(() => { // This block runs regardless of success or failure
      authAction.disabled = false; // Re-enable button
      authAction.textContent = originalButtonText; // Restore original text
      authAction.classList.remove('loading'); // Remove loading class
    });
    console.log("Clicked", isLogin ? "Login" : "Sign Up");
});

// Event listeners for Enter key on auth inputs
function handleAuthInputEnter(event) {
  if (event.key === 'Enter' || event.keyCode === 13) {
    event.preventDefault(); // Prevent default form submission or new line
    authAction.click();     // Programmatically click the login/signup button
  }
}

authEmail.addEventListener('keydown', handleAuthInputEnter);
authPass.addEventListener('keydown', handleAuthInputEnter);

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
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!window.currentUserId) return alert("Please log in first.");
  const msg = input.value.trim();
  if (!msg) return;

  addMessage("user", msg);
  input.value = "";

  showTyping(true);

  try {
    // NOTE: Ensure this URL matches your deployed Render backend URL
    const response = await fetch("https://chatbot-backend-vddn.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, userId: window.currentUserId })
    });

    const { reply, userMood, botMood } = await response.json();

    showTyping(false);
    addMessage("bot", reply);

    console.log("User Mood:", userMood);
    console.log("Bot Mood:", botMood);

    updateExpression(botMood);

  } catch (error) {
    console.error("Chat fetch error:", error);
    showTyping(false);
    addMessage("bot", "Sorry, I couldn’t reach my brain right now 😞");
    updateExpression("neutral");
  }
});

// Always focus input (modified to respect auth overlay)
document.addEventListener("keydown", () => {
  const isAuthVisible = authOverlay.style.display !== "none"; // Check display style
  if (!isAuthVisible && document.activeElement !== input) {
    input.focus();
  }
});
