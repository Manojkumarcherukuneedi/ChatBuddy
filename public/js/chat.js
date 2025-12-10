// ======================================================================
// NO API_BASE — Render and Localhost both use relative routes
// ======================================================================

// ======================================================================
// LOGOUT
// ======================================================================
function logout() {
  localStorage.removeItem("token");
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
// ADD MESSAGE
// ======================================================================
function addMessage(text, type) {
  if (!text) return;

  const box = document.getElementById("chatBox");
  const div = document.createElement("div");

  div.className = type === "user" ? "msg-user fade-in" : "msg-bot fade-in";
  div.textContent = text;

  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
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
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ message: msg }),
    });

    const data = await res.json();
    addMessage(data.reply || "⚠️ AI did not respond.", "bot");
  } catch {
    addMessage("⚠️ Error contacting server", "bot");
  }
}

// ENTER TO SEND
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
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    });

    const data = await res.json();
    addMessage(data.message, "bot");
  } catch {
    addMessage("🔥 Couldn't fetch motivation right now 😅", "bot");
  }
}

// ======================================================================
// LOAD HISTORY
// ======================================================================
async function loadHistory() {
  try {
    const res = await fetch(`/api/history`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    });

    const history = await res.json();
    const box = document.getElementById("chatBox");
    box.innerHTML = "";

    if (!history.length) {
      addMessage("No previous conversations yet. Say hi! 👋", "bot");
      return;
    }

    let first = history[0];
    let fixedDate = new Date(first.created_at.replace(" ", "T") + "Z");

    const header = document.createElement("div");
    header.className = "time-header";
    header.textContent = "🗓️ " + fixedDate.toLocaleString("en-US");
    box.appendChild(header);

    history.forEach((h) => {
      if (h.user_text) addMessage(h.user_text, "user");
      if (h.bot_text) addMessage(h.bot_text, "bot");
    });
  } catch {
    addMessage("⚠️ Couldn't load history right now", "bot");
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
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    });

    const data = await res.json();

    if (data.success) {
      document.getElementById("chatBox").innerHTML = "";
      addMessage("History cleared! 🗑️", "bot");
    } else {
      addMessage("❌ Failed to delete history", "bot");
    }
  } catch {
    addMessage("❌ Error deleting history", "bot");
  }
}

// ======================================================================
// ACCOUNT PAGE
// ======================================================================
function openAccount() {
  closeMenu();
  closePages();

  document.getElementById("chatContainer").style.display = "none";
  document.getElementById("accountSection").style.display = "block";

  fetch(`/api/profile`, {
    headers: { Authorization: "Bearer " + localStorage.getItem("token") },
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("accName").textContent = data.name || "Unknown";

      let fixedDate = new Date(data.created.replace(" ", "T") + "Z");

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
// PAGE NAVIGATION / MENU
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
  const box = document.getElementById("chatBox");
  box.innerHTML = "";
  addMessage("Welcome back! 👋 Start chatting again!", "bot");
}

function openMenu() {
  document.getElementById("sideMenu").style.left = "0px";
  document.getElementById("overlay").style.display = "block";
}

function closeMenu() {
  document.getElementById("sideMenu").style.left = "-260px";
  document.getElementById("overlay").style.display = "none";
}
