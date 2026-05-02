# 📅 BookEase – MERN Appointment Booking System

A full-stack appointment booking system built with **MongoDB, Express, React (Vite), and Node.js**.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running locally (or MongoDB Atlas URI)

---

### 1️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env` file (already included):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/appointment-booking
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
NODE_ENV=development
```

Seed the database with sample data:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev       # development (with nodemon)
npm start         # production
```

Server runs on: `http://localhost:5000`

---

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🔐 Demo Credentials

| Role  | Email                  | Password  |
|-------|------------------------|-----------|
| Admin | admin@bookease.com     | admin123  |
| User  | user@bookease.com      | user123   |

---

## 📁 Project Structure

```
appointment-booking/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Service.js
│   │   ├── Appointment.js
│   │   └── TimeSlot.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── services.js
│   │   ├── appointments.js
│   │   ├── timeslots.js
│   │   ├── admin.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── seed.js
│   └── .env
│
└── frontend/
    └── src/
        ├── api/
        │   └── axios.js
        ├── context/
        │   └── AuthContext.jsx
        ├── components/
        │   └── layout/
        │       ├── UserLayout.jsx
        │       └── AdminLayout.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Home.jsx
            ├── Services.jsx
            ├── BookAppointment.jsx
            ├── MyAppointments.jsx
            ├── Profile.jsx
            └── admin/
                ├── Dashboard.jsx
                ├── Appointments.jsx
                ├── Services.jsx
                ├── Users.jsx
                └── TimeSlots.jsx
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Services
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/services` | Public |
| POST | `/api/services` | Admin |
| PUT | `/api/services/:id` | Admin |
| DELETE | `/api/services/:id` | Admin |

### Appointments
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/appointments` | User |
| POST | `/api/appointments` | User |
| PUT | `/api/appointments/:id/cancel` | User |
| PUT | `/api/appointments/:id/reschedule` | User |

### Time Slots
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/timeslots` | Public |
| POST | `/api/timeslots` | Admin |
| POST | `/api/timeslots/bulk` | Admin |
| DELETE | `/api/timeslots/:id` | Admin |

### Admin
| Method | Endpoint |
|--------|----------|
| GET | `/api/admin/dashboard` |
| GET | `/api/admin/appointments` |
| PUT | `/api/admin/appointments/:id/status` |
| GET | `/api/admin/users` |
| PUT | `/api/admin/users/:id/toggle` |

---

## ✨ Features

### User Side
- 🔐 Register & Login with JWT auth
- 🏠 Dashboard with stats and recent appointments
- 🗂️ Browse all available services
- 📅 3-step booking flow (Date → Slot → Confirm)
- 📋 View, cancel, and reschedule appointments
- 👤 Profile management

### Admin Side
- 📊 Dashboard with stats, charts, and recent bookings
- ✅ Confirm / Reject / Complete appointments
- ➕ Full CRUD for services
- 👥 Manage users (activate/deactivate)
- ⏰ Create individual or bulk time slots

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Routing | React Router v6 |
| HTTP | Axios |
| State | React Context API |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) |
| Validation | express-validator |
| Dates | date-fns |
| Icons | react-icons |
| Toasts | react-hot-toast |

---

## 🌐 MongoDB Atlas (Production)

Replace `MONGODB_URI` in `.env`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/appointment-booking
```

---

## 📦 Build for Production

```bash
# Frontend
cd frontend
npm run build   # Creates dist/ folder

# Backend
cd backend
NODE_ENV=production npm start
```
