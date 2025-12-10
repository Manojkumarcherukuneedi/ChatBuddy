const API = {
  chat: '/api/chat/send',
  history: '/api/history',
  randomMsg: (kind='quote') => `/api/messages/random?kind=${kind}`
};

function getToken() { return localStorage.getItem('token'); }
function setToken(t) { localStorage.setItem('token', t); }
function clearToken() { localStorage.removeItem('token'); }

function appendMessage(who, text) {
  const el = document.createElement('div');
  el.className = `message ${who}`;
  el.textContent = text;
  document.getElementById('chat').appendChild(el);
  el.scrollIntoView();
}

async function sendMessage() {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  if (!text) return;
  appendMessage('user', text);
  input.value='';
  const res = await fetch(API.chat, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
    body: JSON.stringify({ text })
  });
  const data = await res.json();
  if (res.ok) {
    appendMessage('bot', data.reply);
  } else {
    appendMessage('bot', data.error || 'Error');
  }
}

async function loadHistory() {
  const res = await fetch(API.history, {
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  const data = await res.json();
  if (res.ok) {
    document.getElementById('chat').innerHTML = '';
    data.messages.forEach(m => appendMessage(m.sender, `${m.content}`));
  } else {
    appendMessage('bot', data.error || 'Failed to load history');
  }
}

async function motivate() {
  const res = await fetch(API.randomMsg('quote'), {
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  const data = await res.json();
  if (res.ok) {
    appendMessage('bot', data.content);
  } else {
    appendMessage('bot', 'No motivation found.');
  }
}

document.getElementById('sendBtn').addEventListener('click', sendMessage);
document.getElementById('messageInput').addEventListener('keydown', (e)=>{
  if (e.key === 'Enter') sendMessage();
});
document.getElementById('loadHistory').addEventListener('click', loadHistory);
document.getElementById('motivateBtn').addEventListener('click', motivate);
document.getElementById('logout').addEventListener('click', (e)=>{
  clearToken();
});
