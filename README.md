# 🏥 AGG Hospital – Full-Stack AI Healthcare Management System
### Final Year Project | React + Node.js + MongoDB + OpenAI

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)
- npm or yarn

### 2. Backend Setup
```bash
cd backend
npm install

# Copy env file
cp .env.example .env
# Edit .env with your MongoDB URI and OpenAI API key

# Seed the database with demo data
npm run seed

# Start backend server
npm run dev     # development (with nodemon)
npm start       # production
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

The frontend runs on **http://localhost:3000** and proxies API calls to **http://localhost:5000**.

---

## 🔐 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Patient** | patient@agg.com | password123 |
| **Doctor** | doctor@agg.com | password123 |
| **Admin** | admin@agg.com | password123 |
| **Nurse** | nurse@agg.com | password123 |
| **Receptionist** | reception@agg.com | password123 |
| **Pharmacist** | pharmacy@agg.com | password123 |

---

## 🤖 AI Health Assistant Setup

1. Get an API key from [OpenAI Platform](https://platform.openai.com)
2. Add to `backend/.env`:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```
3. The AI Assistant will use GPT-3.5-turbo with the patient's medical records as context
4. Without an API key, it falls back to intelligent demo responses

---

## 📁 Project Structure

```
agg-hospital-fullstack/
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js              ← Express app entry
│       ├── config/
│       │   └── db.js              ← MongoDB connection
│       ├── middleware/
│       │   ├── auth.js            ← JWT auth + role guard
│       │   └── errorHandler.js    ← Global error handler
│       ├── models/
│       │   ├── User.js            ← All 6 roles in one model
│       │   ├── Appointment.js     ← Appointments
│       │   ├── MedicalRecord.js   ← Records + vitals + meds
│       │   ├── Prescription.js    ← Prescriptions
│       │   ├── Inventory.js       ← Drug inventory
│       │   └── Vitals.js          ← Nurse vitals logs
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── appointmentController.js
│       │   ├── recordController.js
│       │   ├── prescriptionController.js
│       │   ├── inventoryController.js
│       │   ├── userController.js
│       │   ├── vitalsController.js
│       │   └── aiController.js    ← OpenAI integration
│       ├── routes/
│       │   ├── auth.js
│       │   ├── appointments.js
│       │   ├── records.js
│       │   ├── prescriptions.js
│       │   ├── users.js
│       │   └── misc.js            ← inventory, vitals, AI
│       └── utils/
│           └── seeder.js          ← Demo data seeder
│
└── frontend/
    ├── package.json
    └── src/
        ├── App.js                 ← Routes + layout
        ├── index.js
        ├── utils/
        │   └── api.js             ← Axios client with JWT
        ├── context/
        │   └── AuthContext.js     ← Auth state + login/register
        ├── hooks/
        │   └── useApi.js          ← Data fetching hooks
        ├── styles/
        │   └── global.css         ← Design system
        ├── pages/
        │   ├── LoginPage.js       ← Multi-role login
        │   └── RegisterPage.js
        └── components/
            ├── common/
            │   ├── Sidebar.js     ← Collapsible sidebar
            │   ├── Topbar.js      ← Header with notifications
            │   ├── Appointments.js
            │   ├── Prescriptions.js
            │   ├── PatientsList.js
            │   └── ProfilePage.js
            ├── patient/
            │   ├── PatientDashboard.js
            │   ├── MedicalHistory.js
            │   └── AIAssistant.js ← Live OpenAI chat
            ├── doctor/
            │   └── DoctorDashboard.js
            ├── admin/
            │   ├── AdminDashboard.js   ← Recharts analytics
            │   └── StaffManagement.js
            ├── nurse/
            │   └── NurseDashboard.js
            ├── receptionist/
            │   └── ReceptionistDashboard.js
            └── pharmacist/
                └── PharmacistDashboard.js
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |
| PUT | /api/auth/password | Change password |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/appointments | Get appointments (role-filtered) |
| POST | /api/appointments | Book appointment |
| PUT | /api/appointments/:id | Update/confirm appointment |
| DELETE | /api/appointments/:id | Cancel appointment |
| GET | /api/appointments/stats | Dashboard stats |

### Medical Records
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/records | Get records (role-filtered) |
| POST | /api/records | Create record (doctor) |
| GET | /api/records/:id | Get single record |
| PUT | /api/records/:id | Update record (doctor) |

### Prescriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/prescriptions | Get prescriptions |
| POST | /api/prescriptions | Create (doctor) |
| PUT | /api/prescriptions/:id/dispense | Dispense (pharmacist) |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/inventory | Get all inventory |
| POST | /api/inventory | Add item (pharmacist) |
| PUT | /api/inventory/:id | Update item |
| DELETE | /api/inventory/:id | Delete item |
| GET | /api/inventory/low-stock | Get low/out of stock |

### Users (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | Get users (role filter) |
| POST | /api/users | Create user (admin) |
| PUT | /api/users/:id | Update user (admin) |
| DELETE | /api/users/:id | Deactivate user (admin) |
| GET | /api/users/admin/stats | Hospital stats |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ai/chat | AI Health Assistant |

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC) for all 6 roles
- Token stored in localStorage, attached via interceptor
- Protected routes on frontend

### 👤 Patient Portal
- Personalized dashboard with real appointment & record data
- Medical history with expandable records (accessible by Doctor & Nurse)
- **Live AI Health Assistant** powered by OpenAI GPT-3.5 with patient context
- Appointment booking with doctor selection & time slots
- Prescription viewing
- Profile management with health info

### 🩺 Doctor Portal
- Dashboard with appointment stats from database
- Patient list with drill-down to medical records
- Create/edit medical records with medications + vitals
- Prescription writing auto-creates prescription on record save

### 🛡️ Admin Portal
- Hospital-wide analytics with Recharts
- Staff management (create doctors, nurses, etc.)
- Patient management
- Revenue & department load charts (demo data)

### 👩‍⚕️ Nurse Portal
- Assigned patient list from database
- Log vitals modal (saves to MongoDB)
- Medication schedule view
- Medical record read access

### 🗓️ Receptionist Portal
- Appointment management + booking
- Bed availability tracker (visual progress bars)
- Quick action navigation

### 💊 Pharmacist Portal
- Prescription queue with dispense action
- Drug inventory management (CRUD)
- Auto-status (in-stock/low/out-of-stock based on quantity)

---

## 🎨 Design System

- **Colors**: Deep teal primary (#0a4d68), role-specific accents
- **Fonts**: Playfair Display (display) + DM Sans (body)
- **Sidebar**: Collapsible with role-color theming
- **Responsive**: Works on tablet and desktop

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| State | React Context API |
| HTTP | Axios with JWT interceptor |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js + Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| AI | OpenAI GPT-3.5-turbo |
| Security | Helmet, CORS, Rate Limiting |

---

## 👨‍💻 Developer Notes

- All API calls use the `api.js` Axios instance which auto-attaches JWT
- Medical records are accessible by patient (own), doctor (all), nurse (all read-only)
- The AI controller passes patient's medical records as context to GPT
- Admin dashboard stats come from real MongoDB counts
- Seeder creates 10 users + 10 inventory items for demo

---

*Final Year Project – AGG Hospital AI Healthcare Management System*
*Stack: React + Node.js + Express + MongoDB + OpenAI*
#   A g g - h o s p i t a l  
 "# Agg-hospital" 
"# Agg-hospital" 
