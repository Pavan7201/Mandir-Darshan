# 🕍️ Mandir Darshan - A Full-Stack Temple Guide

<p align="center">
  A full-stack web application designed to be a virtual guide to Indian temples, featuring secure OTP authentication, dynamic content from a MongoDB backend, and an integrated AI chatbot for assistance.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/n8n-553DF4?style=for-the-badge&logo=n8n&logoColor=white" alt="n8n">
  <img src="https://img.shields.io/badge/Voiceflow-1C1C1F?style=for-the-badge&logo=voiceflow&logoColor=white" alt="Voiceflow">
</p>

---

## 📸 Screenshots

<table align="center">
  <tr>
    <th colspan="2">☀️ Light Mode vs 🌙 Dark Mode</th>
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
    <th colspan="2">💬 Voiceflow AI Chat Assistant</th>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img src="https://github.com/Pavan7201/Mandir-Darshan/blob/main/Voiceflow%20assistant.png?raw=true" width="90%">
    </td>
  </tr>
</table>

---

## 🌐 Live Demo Links

* **Frontend (GitHub Pages):** [https://pavan7201.github.io/Mandir-Darshan/](https://pavan7201.github.io/Mandir-Darshan/)
* **Backend (OnRender):** [https://mandir-darshan.onrender.com/](https://mandir-darshan.onrender.com/)

---

## ✨ Core Features

* **Secure OTP Authentication:** Robust sign-up and login flow using OTP (One-Time Password) validation, powered by **n8n.io** webhooks.
* **Dynamic Temple Content:** All temple information, guides, and details are fetched dynamically from a **MongoDB** database via a custom-built Node.js/Express REST API.
* **AI Chat Assistant:** An integrated **Voiceflow** chatbot, powered by the **Google Gemini API**, provides users with instant assistance and answers to their queries.
* **Modern UI/UX:** A clean, fast, and mobile-first interface built with **React.js + Vite**.
* **Light/Dark Mode:** A user-friendly theme toggle for accessibility and personal preference.
* **Fully Responsive:** The design is optimized for all screen sizes, from mobile phones to desktops.

---

## 🛠️ Tech Stack

This project is built with a modern, full-stack architecture.

| Category | Technology |
| :--- | :--- |
| **Frontend** | ⚛️ React.js, ⚡ Vite, JavaScript (ES6+), HTML5, CSS3 |
| **Backend** | 🟢 Node.js, 🚀 Express.js |
| **Database** | 🍃 MongoDB |
| **AI & Chat** | 🤖 Voiceflow, 🧠 Google Gemini API |
| **Automation** | ⚙️ n8n.io (for OTP Webhooks) |
| **DevOps & Tools** | ☁️ OnRender (Backend), 📄 GitHub Pages (Frontend), git, GitHub |

---

## 🚀 Getting Started: Running Locally

To get a local copy up and running, follow these simple steps.

### Prerequisites

* **Node.js** (v18 or later recommended)
* **npm** (or yarn)
* A **MongoDB Connection String** (you can get one for free from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
* **n8n.io Webhook URLs** (for OTP generation)
* **Google Gemini API Key**

### 1. Clone the Repository

```bash
git clone [https://github.com/Pavan7201/Mandir-Darshan.git](https://github.com/Pavan7201/Mandir-Darshan.git)
cd Mandir-Darshan
```

### 2. Backend Setup (in /temple directory)
The backend server runs from the /temple folder.
```bash
# 1. Navigate to the directory
cd temple

# 2. Install backend dependencies
npm install

# 3. Create a .env file in the /temple directory
#    (You can copy .env.example to .env)
touch .env
```

### Add your environment variables to .env file:
```bash
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
```

### Start the backend server
```bash
npm run server
```

### 3. Frontend Setup (in root / directory)
Start the frontend dev server
```bash
npm run dev
```

Your application should now be running:

frontend Terminal: http://localhost:5173/Mandir-Darshan

Backend Terminal: 🚀 Server running on port 4000
check link: https://mandir-darshan.onrender.com/
