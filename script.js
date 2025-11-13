import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } 
from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } 
from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";
import { getDatabase, push, ref as dbRef, onValue } 
from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";

// 🔧 Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDZ7PjKfWIspbozH9_vBc-hp-xdP4q6P38",
  authDomain: "r-mail-3edbf.firebaseapp.com",
  projectId: "r-mail-3edbf",
  storageBucket: "r-mail-3edbf.firebasestorage.app",
  messagingSenderId: "215673046326",
  appId: "1:215673046326:web:333609b0c2a912bc0e9f97",
  measurementId: "G-4P6RG7KFC5"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getDatabase(app);

const authContainer = document.getElementById("auth-container");
const mainContainer = document.getElementById("main-container");
const userEmail = document.getElementById("userEmail");
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const messageBox = document.getElementById("messageBox");
const messagesDiv = document.getElementById("messages");

// Sign Up
window.signUp = async function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  await createUserWithEmailAndPassword(auth, email, password)
    .then(() => alert("Account created!"))
    .catch(err => alert(err.message));
};

// Sign In
window.signIn = async function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  await signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      authContainer.classList.add("hidden");
      mainContainer.classList.remove("hidden");
      userEmail.textContent = email;
      loadFiles();
      loadMessages();
    })
    .catch(err => alert(err.message));
};

// Logout
window.logout = async function() {
  await signOut(auth);
  authContainer.classList.remove("hidden");
  mainContainer.classList.add("hidden");
};

// Upload File
window.uploadFile = async function() {
  const file = fileInput.files[0];
  if (!file) return alert("Select a file first!");
  const storageRef = ref(storage, "uploads/" + file.name);
  await uploadBytes(storageRef, file);
  alert("Uploaded!");
  loadFiles();
};

// Load Files
async function loadFiles() {
  const listRef = ref(storage, "uploads/");
  const res = await listAll(listRef);
  fileList.innerHTML = "<h3>Uploaded Files:</h3>";
  for (const item of res.items) {
    const url = await getDownloadURL(item);
    const link = document.createElement("a");
    link.href = url;
    link.textContent = item.name;
    link.target = "_blank";
    fileList.appendChild(link);
    fileList.appendChild(document.createElement("br"));
  }
}

// Send Message
window.sendMessage = function() {
  const msg = messageBox.value.trim();
  if (msg === "") return;
  push(dbRef(db, "messages"), { text: msg, user: auth.currentUser.email });
  messageBox.value = "";
};

// Load Messages
function loadMessages() {
  onValue(dbRef(db, "messages"), snapshot => {
    messagesDiv.innerHTML = "<h3>Messages:</h3>";
    snapshot.forEach(child => {
      const { text, user } = child.val();
      const p = document.createElement("p");
      p.textContent = `${user}: ${text}`;
      messagesDiv.appendChild(p);
    });
  });
}

