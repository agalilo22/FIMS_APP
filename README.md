FIMS (Financial Information Management System)
FIMS is a web application designed to manage financial information. It features a dashboard, client list, and file upload functionality, with user authentication powered by Google.

Features
Google OAuth 2.0 Authentication: Secure login using your Google account.

User Role Management: Assigns roles (admin, analyst, viewer) to users upon first login.

Client Management: View and manage a list of clients.

File Uploads: Functionality to upload files.

Dashboard: A central hub for managing financial data.

Technologies Used
Frontend
React: A JavaScript library for building user interfaces.

@react-oauth/google: For handling Google OAuth 2.0 on the client side.

Axios: Promise-based HTTP client for making API requests.

Backend
Node.js & Express: A fast, unopinionated, minimalist web framework for building the API.

google-auth-library: A library to verify Google ID tokens on the server.

Mongoose: An elegant MongoDB object modeling for Node.js.

jsonwebtoken: For creating and verifying JSON Web Tokens (JWTs) for user sessions.

dotenv: To manage environment variables.

cors: Middleware to enable Cross-Origin Resource Sharing.

Getting Started
Prerequisites
Node.js (LTS version recommended)

MongoDB Atlas account or a local MongoDB instance

1. Google OAuth Setup
Go to the Google Cloud Console.

Create a new project.

Navigate to APIs & Services > OAuth consent screen and configure the user consent screen.

Go to APIs & Services > Credentials and click Create Credentials > OAuth client ID.

Select Web application.

For the Frontend Client ID, set the following:

Authorized JavaScript origins: http://localhost:3000 (and your production domain)

Click Create and copy the Client ID. This will be used in both the frontend and backend.

2. Backend Setup
Navigate to the server directory: cd fims-project/server

Install dependencies: npm install

Create a .env file in the server directory and add the following variables:

MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id_from_step_1
JWT_SECRET=your_jwt_secret_token
Start the backend server: node index.js or nodemon index.js

3. Frontend Setup
Navigate to the client directory: cd fims-project/client

Install dependencies: npm install

Create a .env file in the client directory and add the following variables:

REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_from_step_1
REACT_APP_API_URL=http://localhost:5000
Start the frontend application: npm start

The application will now be running on http://localhost:3000.

Directory Structure
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
Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

User Guide - https://docs.google.com/document/d/1qcVzHOb81o8uFY_rvBc4hOFm_g49xw6CjJesjIWCUzU/edit?usp=sharing
