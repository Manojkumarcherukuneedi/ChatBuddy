
# ChatBuddy (Full Stack Web App)

Node.js + Express + SQLite + JWT auth. Simple rule-based chatbot with login and conversation history.

## Features (maps to your FR1–FR5)
- FR1: Register/Login (JWT)
- FR2: Real-time-ish chat (HTTP) with rule-based responses
- FR3: Empathetic replies (basic rules in `chatController`)
- FR4: Motivational messages/jokes (random from DB)
- FR5: Conversation Book (history endpoint)

## Quick Start
```bash
# 1) Install deps
npm install

# 2) Create .env
cp .env.example .env
# (Edit JWT_SECRET if you like)

# 3) Run
npm start
# Open http://localhost:3000/login.html
```

## API
- POST /api/auth/register {username, password}
- POST /api/auth/login {username, password} -> {token}
- POST /api/chat/send {text} (Bearer token) -> {reply}
- GET  /api/history (Bearer token) -> {messages}
- GET  /api/messages/random?kind=quote (Bearer token) -> {content}

## Notes
- DB: SQLite file `chatbuddy.db` auto-created at first run.
- This is a minimal starter you can extend with WebSockets and admin UI later.

# ChatBuddy 

ChatBuddy is a supportive chatbot designed to give users a safe, judgment-free space to share their thoughts and feelings. It provides empathetic responses, motivational quotes, and lighthearted jokes to uplift users.

---

## Features
- **User Authentication** – Secure registration and login system
- **Real-time Chat** – Interactive chatbot with rule-based responses
- **Positive Engagement** – Random motivational messages and jokes
- **Conversation Book** – Stores user-chat history with timestamps
- **Conversation Book** – Stores user-chat history with timestamps

---

- **Frontend:** HTML, CSS, JavaScript (responsive web + mobile UI) 
- **Backend:** Node.js / Express.js 
- **Database:** SQL / NoSQL
- **Version Control:** Git + GitHub
- **Project Management:** Trello
---

## Team Members
-  Ashwin Kumar Mandaloju
-  Hemanth Reddy Cheeruka
-  Manoj Kumar Cherukuneedi
-  Meet Saspara  
>>>>>>> c6d5bc6aa72e39d8f91ccb0ada409e15785ab208
