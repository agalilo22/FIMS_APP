
# FIMS (Financial Information Management System)

FIMS is a web application designed to manage financial information. It provides a **dashboard**, **client list**, and **file upload functionality**, with secure user authentication powered by **Google OAuth 2.0**.

---

## 🚀 Features

* **Google OAuth 2.0 Authentication** – Secure login using your Google account.
* **User Role Management** – Assigns roles (admin, analyst, viewer) upon first login.
* **Client Management** – View and manage a list of clients.
* **File Uploads** – Upload and manage financial files.
* **Dashboard** – Central hub for managing financial data.

---

## 🛠️ Technologies Used

### Frontend

* [React](https://react.dev/) – UI library for building the interface
* [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google) – Google OAuth 2.0 client
* [Axios](https://axios-http.com/) – Promise-based HTTP client

### Backend

* [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/) – API server
* [google-auth-library](https://www.npmjs.com/package/google-auth-library) – Verifies Google ID tokens
* [Mongoose](https://mongoosejs.com/) – MongoDB object modeling
* [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) – User session handling with JWTs
* [dotenv](https://www.npmjs.com/package/dotenv) – Environment variable management
* [cors](https://www.npmjs.com/package/cors) – Cross-Origin Resource Sharing middleware

---

## ⚙️ Getting Started

### Prerequisites

* [Node.js (LTS)](https://nodejs.org/en/)
* [MongoDB Atlas](https://www.mongodb.com/atlas) account or local MongoDB instance
* [Google Cloud Console](https://console.cloud.google.com/) project

---

### 🔑 Google OAuth Setup

1. Go to **Google Cloud Console** → Create a new project.
2. Navigate to **APIs & Services > OAuth consent screen** → Configure consent screen.
3. Go to **APIs & Services > Credentials** → Click **Create Credentials > OAuth client ID**.
4. Select **Web application**.
5. Add **Authorized JavaScript origins**:

   * `http://localhost:3000` (and your production domain)
6. Click **Create** → Copy the **Client ID** (used in frontend & backend).

---

### 🖥️ Backend Setup

```bash
cd fims-project/server
npm install
```

Create a `.env` file inside `/server`:

```env
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id_from_step_1
JWT_SECRET=your_jwt_secret_token
```

Run the backend:

```bash
node index.js
# or
npx nodemon index.js
```

---

### 💻 Frontend Setup

```bash
cd fims-project/client
npm install
```

Create a `.env` file inside `/client`:

```env
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_from_step_1
REACT_APP_API_URL=http://localhost:5000
```

Run the frontend:

```bash
npm start
```

App will be running on:
👉 `http://localhost:3000`

---

## 📂 Directory Structure

```
fims-project/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   └── ...
│   ├── .env
│   ├── package.json
│   └── ...
├── server/
│   ├── models/
│   │   ├── Client.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── clients.js
│   │   └── files.js
│   ├── .env
│   ├── index.js
│   ├── package.json
│   └── ...
└── README.md
```

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📘 User Guide

👉 [FIMS User Guide](https://docs.google.com/document/d/1qcVzHOb81o8uFY_rvBc4hOFm_g49xw6CjJesjIWCUzU/edit?usp=sharing)

---

