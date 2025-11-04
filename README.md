Mandir Darshan - A Full-Stack Temple Guide

<p align="center">
A full-stack web application designed to be a virtual guide to Indian temples, featuring OTP authentication, dynamic content, and integrated an voiceflow for chatbot for assistance.
</p>

<table align="center">
  <tr>
    <th>☀️ Light Mode</th>
    <th>🌙 Dark Mode</th>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/Pavan7201/Mandir-Darshan/blob/main/Light%20Mode.png?raw=true" width="95%">
    </td>
    <td align="center">
      <img src="https://github.com/Pavan7201/Mandir-Darshan/blob/main/Dark%20Mode.png?raw=true" width="95%">
    </td>
  </tr>
  <tr>
    <th colspan="2">💬 Voiceflow AI Chat</th>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img src="https://github.com/Pavan7201/Mandir-Darshan/blob/main/Voiceflow%20assistant.png?raw=true" width="80%">
    </td>
  </tr>
</table>

🌐 Live Demo

Frontend: (GitHub Pages):
[https://pavan7201.github.io/Mandir-Darshan/](https://pavan7201.github.io/Mandir-Darshan/)

Backend: (OnRender):
[https://mandir-darshan.onrender.com/](https://mandir-darshan.onrender.com/)

✨ Core Features

Advanced User Authentication: Secure sign-up and login using OTP (One-Time Password) validation, powered by n8n.io webhooks.

Dynamic Content: Temple information is fetched dynamically from a MongoDB database via a custom Node.js REST API.

Modern Frontend: A clean, mobile-first interface built with React.js + Vite for a fast, modern developer experience.

Light/Dark Mode Toggle: Modern UI theme toggle for user accessibility and preference.

Fully Responsive Design: A clean, mobile-first interface built with React.js.

🛠️ Tech Stack

This project is built with a modern, full-stack architecture.

Category: Technology

Frontend: React.js, Vite, JavaScript (ES6+), HTML5, CSS3

Backend: Node.js, Express.js

Database: MongoDB

AI: Google Gemini API

Automation: n8n.io (for Webhooks/OTP)

ChatBot: Voiceflow

Tools & Version Control: Git, GitHub

🚀 How To Run Locally

To get a local copy up and running, follow these simple steps. (Based on your project structure)

Prerequisites

Node.js (v18 or later)

npm (or yarn)

A MongoDB connection string (from a free Atlas account)

1. Clone the Repository

git clone [https://github.com/Pavan7201/Mandir-Darshan.git](https://github.com/Pavan7201/Mandir-Darshan.git)
cd Mandir-Darshan

2. Backend Setup (in /temple directory)

# Navigate to the temple directory
cd temple

# Install dependencies
npm install

# Create a .env file in the /temple directory
# Add your environment variables:
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
DB_NAME=test
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
VITE_GEMINI_API_KEY=your_gemini_api_key
REACT_APP_WEBHOOK_EMAIL_URL=your_n8n_email_webhook (n8n)
REACT_APP_WEBHOOK_MOBILE_URL=your_n8n_mobile_webhook (n8n)
OTP_TTL_MINUTES=5
OTP_LENGTH=6
OTP_RESEND-COOLDOWN-SECONDS=30
NODE_ENV=production

# Start the backend server
npm run server

3. Frontend Setup (in root / directory)

# Start the frontend dev server
npm run dev

Your application should now be running:

frontend Terminal: http://localhost:5173/Mandir-Darshan
click (ctrl + click) : opens on browser

Backend Terminal: 🚀 Server running on port 4000
check link: https://mandir-darshan.onrender.com/
