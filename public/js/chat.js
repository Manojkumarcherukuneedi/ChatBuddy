// ======================================================================
// REQUIRE LOGIN — Redirect if no token exists
// ======================================================================
const TOKEN = localStorage.getItem("token");
if (!TOKEN) {
  window.location.href = "/login.html";
}

// ======================================================================
// DARK MODE
// ======================================================================
function toggleDark() {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

// ======================================================================
// ADD MESSAGE TO CHAT WINDOW
// ======================================================================
function addMessage(text, type) {
  if (!text) return;

  const box = document.getElementById("chatBox");
  const msg = document.createElement("div");

  msg.className = type === "user" ? "msg-user fade-in" : "msg-bot fade-in";
  msg.textContent = text;

  box.appendChild(msg);
  box.scrollTop = box.scrollHeight; // auto-scroll DOWN for live chat
}

// ======================================================================
// SEND MESSAGE
// ======================================================================
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

// ENTER to send
document.getElementById("msgInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMsg();
  }
});

// ======================================================================
// MOTIVATE ME
// ======================================================================
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

// ======================================================================
// LOAD HISTORY (Auto-scrolls to TOP)
// ======================================================================
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

    // Timestamp Header
    const first = history[0];
    const fixedDate = new Date(first.created_at.replace(" ", "T") + "Z");

    const header = document.createElement("div");
    header.className = "time-header";
    header.textContent = "🗓️ " + fixedDate.toLocaleString("en-US");
    box.appendChild(header);

    // Append all messages (no auto-scroll override)
    history.forEach((h) => {
      if (h.user_text) {
        const u = document.createElement("div");
        u.className = "msg-user fade-in";
        u.textContent = h.user_text;
        box.appendChild(u);
      }
      if (h.bot_text) {
        const b = document.createElement("div");
        b.className = "msg-bot fade-in";
        b.textContent = h.bot_text;
        box.appendChild(b);
      }
    });

    // Auto-scroll to TOP
    box.scrollTop = 0;
  } catch {
    addMessage("⚠️ Couldn't load history right now.", "bot");
  }
}

// ======================================================================
// DELETE HISTORY
// ======================================================================
async function deleteHistory() {
  if (!confirm("Delete ALL chat history?")) return;

  try {
    const res = await fetch(`/api/delete-history`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + TOKEN },
    });

    const data = await res.json();

    const box = document.getElementById("chatBox");
    box.innerHTML = "";

    if (data.success) {
      addMessage("History cleared! 🗑️", "bot");
    } else {
      addMessage("❌ Failed to delete history.", "bot");
    }
  } catch {
    addMessage("❌ Error deleting history.", "bot");
  }
}

// ======================================================================
// ACCOUNT SECTION
// ======================================================================
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

// ======================================================================
// NAVIGATION (MENU PAGES)
// ======================================================================
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

// ======================================================================
// SIDEBAR MENU FUNCTIONS (Missing earlier!)
// ======================================================================
function openSettings() {
  showPage("settingsPage");
}

function openPrivacy() {
  showPage("privacyPage");
}

function openNotifications() {
  showPage("notificationsPage");
}

function openAbout() {
  showPage("aboutPage");
}

// ======================================================================
// SIDEBAR OPEN/CLOSE
// ======================================================================
function openMenu() {
  document.getElementById("sideMenu").style.left = "0px";
  document.getElementById("overlay").style.display = "block";
}

function closeMenu() {
  document.getElementById("sideMenu").style.left = "-260px";
  document.getElementById("overlay").style.display = "none";
}
