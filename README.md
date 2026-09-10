# MediFind 🏥

MediFind is a web platform that connects patients with nearby pharmacies to check real-time medicine availability, reserve medicines, and manage prescriptions.

## Features

- 🔍 **Real-Time Medicine Search**: Locate nearby pharmacies stocking required medicines.
- 📋 **Prescription Upload & Verification**: Upload prescriptions for verification and quick fulfillment.
- 🏪 **Pharmacy Dashboard**: Manage inventory, stock levels, and customer reservations.
- 🧑‍💼 **Pharmacist Desk & Admin Console**: Tools for review, verification, and pharmacy management.
- 🔐 **Authentication & Role-Based Access**: Secure login and signup for customers, pharmacists, and administrators.

## Project Structure

```text
medifind/
├── backend/
│   ├── prisma/             # Prisma schema and migrations
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth, admin, and upload middleware
│   │   ├── routes/         # Express API routes
│   │   └── server.js       # Backend server entry point
│   ├── uploads/            # Uploaded files directory
│   └── package.json
└── frontend/
    ├── index.html          # Main landing page
    ├── search.html         # Medicine search page
    ├── pharmacy-dashboard.html
    ├── admin-console.html
    ├── pharmacist-desk.html
    ├── login.html / signup.html
    ├── app.js / styles.css
    └── serve.js            # Frontend static server
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [PostgreSQL](https://www.postgresql.org/) database

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your database credentials:
   ```bash
   cp .env.example .env
   ```

4. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the backend server:
   ```bash
   npm start
   ```
   The backend API will run on `http://localhost:5000`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Start the frontend server:
   ```bash
   node serve.js
   ```
   The application will be accessible at `http://localhost:3000`.