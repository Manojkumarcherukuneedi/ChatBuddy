async function loadProfile() {
  const res = await fetch("/api/profile", {
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("token")
    }
  });

  const data = await res.json();

  document.getElementById("usernameDisplay").textContent = data.username;
  document.getElementById("createdAt").textContent = data.created_at;
}

function goBack() {
  window.location.href = "/chat.html";
}

loadProfile();
