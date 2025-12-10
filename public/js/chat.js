/* ======================================================================
   REQUIRE LOGIN
====================================================================== */
const TOKEN = localStorage.getItem("token");
if (!TOKEN) window.location.href = "/login.html";

/* ======================================================================
   DARK MODE (Base Toggle)
====================================================================== */
function toggleDark() {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

/* ======================================================================
   ADD MESSAGE TO CHAT WINDOW
====================================================================== */
function addMessage(text, type) {
  if (!text) return;

  const box = document.getElementById("chatBox");
  const msg = document.createElement("div");

  msg.className = type === "user" ? "msg-user fade-in" : "msg-bot fade-in";
  msg.textContent = text;

  box.appendChild(msg);
  box.scrollTop = box.scrollHeight;
}

/* ======================================================================
   SEND MESSAGE
====================================================================== */
async function sendMsg() {
  const input = document.getElementById("msgInput");
  const msg = input.value.trim();
  if (!msg) return;

  addMessage(msg, "user");
  input.value = "";

  try {
    const res = await fetch(`/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + TOKEN,
      },
      body: JSON.stringify({ message: msg }),
    });

    const data = await res.json();
    addMessage(data.reply || "⚠️ AI did not respond.", "bot");
  } catch {
    addMessage("⚠️ Error contacting server.", "bot");
  }
}

// ENTER = send
document.getElementById("msgInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMsg();
  }
});

/* ======================================================================
   MOTIVATE ME
====================================================================== */
async function motivate() {
  try {
    const res = await fetch(`/api/messages/motivate`, {
      headers: { Authorization: "Bearer " + TOKEN },
    });
    const data = await res.json();
    addMessage(data.message, "bot");
  } catch {
    addMessage("🔥 Couldn't fetch motivation right now 😅", "bot");
  }
}

/* ======================================================================
   LOAD HISTORY
====================================================================== */
async function loadHistory() {
  try {
    const res = await fetch(`/api/history`, {
      headers: { Authorization: "Bearer " + TOKEN },
    });

    const history = await res.json();
    const box = document.getElementById("chatBox");
    box.innerHTML = "";

    if (!history.length) {
      addMessage("No previous conversations yet. Say hi! 👋", "bot");
      return;
    }

    const first = history[0];
    const fixedDate = new Date(first.created_at.replace(" ", "T") + "Z");

    const header = document.createElement("div");
    header.className = "time-header";
    header.textContent = "🗓️ " + fixedDate.toLocaleString();
    box.appendChild(header);

    history.forEach((msg) => {
      if (msg.user_text) addMessage(msg.user_text, "user");
      if (msg.bot_text) addMessage(msg.bot_text, "bot");
    });

    box.scrollTop = box.scrollHeight;
  } catch {
    addMessage("⚠️ Couldn't load history right now.", "bot");
  }
}

/* ======================================================================
   DELETE HISTORY
====================================================================== */
async function deleteHistory() {
  if (!confirm("Delete ALL chat history?")) return;

  try {
    const res = await fetch(`/api/delete-history`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + TOKEN },
    });

    const data = await res.json();
    document.getElementById("chatBox").innerHTML = "";

    if (data.success) addMessage("History cleared! 🗑️", "bot");
    else addMessage("❌ Failed to delete history.", "bot");
  } catch {
    addMessage("❌ Error deleting history.", "bot");
  }
}

/* ======================================================================
   ACCOUNT PAGE
====================================================================== */
function openAccount() {
  closeMenu();
  closePages();

  document.getElementById("chatContainer").style.display = "none";
  document.getElementById("accountSection").style.display = "block";

  fetch(`/api/profile`, {
    headers: { Authorization: "Bearer " + TOKEN },
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("accName").textContent = data.name || "Unknown";
      const fixedDate = new Date(data.created.replace(" ", "T") + "Z");
      document.getElementById("accCreated").textContent =
        fixedDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
    })
    .catch(() => {
      document.getElementById("accName").textContent = "Error loading";
      document.getElementById("accCreated").textContent = "Unavailable";
    });
}

function closeAccount() {
  document.getElementById("accountSection").style.display = "none";
  document.getElementById("chatContainer").style.display = "block";
}

/* ======================================================================
   PAGE NAVIGATION
====================================================================== */
function showPage(id) {
  closeMenu();
  document.getElementById("chatContainer").style.display = "none";
  document.querySelectorAll(".page").forEach((p) => (p.style.display = "none"));
  document.getElementById(id).style.display = "block";
}

function closePages() {
  document.querySelectorAll(".page").forEach((p) => (p.style.display = "none"));
  document.getElementById("chatContainer").style.display = "block";
}

function goHome() {
  closePages();
  closeMenu();
  document.getElementById("chatBox").innerHTML = "";
  addMessage("Welcome back! 👋 Start chatting again!", "bot");
}

function openSettings() { showPage("settingsPage"); }
function openPrivacy() { showPage("privacyPage"); }
function openNotifications() { showPage("notificationsPage"); }
function openAbout() { showPage("aboutPage"); }

/* ======================================================================
   SIDE MENU
====================================================================== */
function openMenu() {
  document.getElementById("sideMenu").style.left = "0px";
  document.getElementById("overlay").style.display = "block";
}
function closeMenu() {
  document.getElementById("sideMenu").style.left = "-260px";
  document.getElementById("overlay").style.display = "none";
}

/* ======================================================================
   LOGOUT
====================================================================== */
function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
}

/* ======================================================================
   SETTINGS SYSTEM (Font Size + Theme)
====================================================================== */

function applySettings() {
  const size = localStorage.getItem("fontSize") || "medium";
  const theme = localStorage.getItem("theme") || "dark";

  // Apply font size globally
  document.body.classList.remove("font-small", "font-medium", "font-large");
  document.body.classList.add(`font-${size}`);

  // Apply theme
  if (theme === "light") {
    document.body.classList.remove("dark");
  } else {
    document.body.classList.add("dark");
  }

  // Pre-select radios only if they exist
  const sizeRadio = document.querySelector(`input[name="fontSize"][value="${size}"]`);
  const themeRadio = document.querySelector(`input[name="theme"][value="${theme}"]`);

  if (sizeRadio) sizeRadio.checked = true;
  if (themeRadio) themeRadio.checked = true;
}


applySettings(); // run at startup

function saveSettings() {
  const size = document.querySelector('input[name="fontSize"]:checked').value;
  const theme = document.querySelector('input[name="theme"]:checked').value;

  localStorage.setItem("fontSize", size);
  localStorage.setItem("theme", theme);

  applySettings();

  alert("Settings saved!");
}

async function changePassword() {
  const oldPass = document.getElementById("oldPass").value.trim();
  const newPass = document.getElementById("newPass").value.trim();

  if (!oldPass || !newPass) {
    alert("Please enter both old and new passwords.");
    return;
  }

  try {
    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + TOKEN
      },
      body: JSON.stringify({ oldPass, newPass })
    });

    const data = await res.json();

    if (data.success) {
      alert("Password changed successfully!");
      document.getElementById("oldPass").value = "";
      document.getElementById("newPass").value = "";
    } else {
      alert(data.message || "Password change failed.");
    }

  } catch {
    alert("Server error. Please try again later.");
  }
}
/* ======================================================================
   NOTIFICATION TOGGLE SETTINGS
====================================================================== */

// Apply saved notification toggle state
function applyNotificationSetting() {
  const toggle = document.getElementById("notifToggle");
  if (!toggle) return; // Page not visible yet

  const enabled = localStorage.getItem("notificationsEnabled") === "true";
  toggle.checked = enabled;
}

// Save toggle changes
function setupNotificationToggle() {
  const toggle = document.getElementById("notifToggle");
  if (!toggle) return;

  toggle.addEventListener("change", () => {
    const enabled = toggle.checked;
    localStorage.setItem("notificationsEnabled", enabled);
  });
}

// Ensure it loads every time the notifications page opens
function openNotifications() {
  showPage("notificationsPage");
  applyNotificationSetting();
  setupNotificationToggle();
}

// ALSO apply setting on full page load
document.addEventListener("DOMContentLoaded", () => {
  applyNotificationSetting();
  setupNotificationToggle();
});
