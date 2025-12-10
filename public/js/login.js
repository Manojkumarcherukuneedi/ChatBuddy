// ======================================================================
// BASE API URL (Render or Localhost)
// ======================================================================
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://chatbuddy-l38k.onrender.com";

// ======================================================================
// LOGIN REQUEST
// ======================================================================
async function login(username, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  return res.json().then(data => ({ ok: res.ok, data }));
}

// ======================================================================
// LOGIN BUTTON HANDLER
// ======================================================================
document.getElementById('loginBtn').addEventListener('click', async () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) {
    document.getElementById('error').textContent = 'Enter username & password';
    return;
  }

  const result = await login(username, password);

  if (result.ok) {
    localStorage.setItem('token', result.data.token);
    window.location.href = '/';
  } else {
    document.getElementById('error').textContent =
      result.data.error || 'Login failed';
  }
});
