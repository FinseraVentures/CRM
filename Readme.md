# CRM Backend 🚀

Production-grade backend powering the the CRM platform.

---

## 🧩 Overview

This backend is a **Node.js + Express.js (ESM)** application built to handle real-world CRM operations with:

- Secure authentication
- Role-based access control
- Audit-heavy business logic
- Payment integrations
- Background jobs
- Structured logging

It is designed for **internal operations**, not public SaaS exposure.

---

## 🏗️ Architecture

```
Client (Frontend)
   ↓ JWT (no Bearer)
Express API
   ↓
MongoDB
```

Key decisions:
- Stateless JWT auth
- Header-based role checks
- MongoDB for audit-friendly schemas

---

## 🔐 Authentication Contract (CRITICAL)

⚠️ **Bearer prefix is NOT used**

```http
authorization: <JWT_TOKEN>
```

Breaking this will break the frontend.

---

## 👥 Roles

```txt
dev
srdev
admin
senior admin
HR
```

Roles are enforced via middleware and route-level checks.

---

## 📂 Folder Structure

```
src/
 ├── db/            # MongoDB connection
 ├── routes/        # Feature-based routes
 ├── models/        # Mongoose schemas
 ├── middlewares/   # Auth, upload, logging
 ├── utils/         # External integrations
 ├── logger/        # Winston loggers
 ├── cron/          # Scheduled jobs
 └── index.js       # Entry point
```

---

## 📦 Core Modules

### User Module (`/user`)
- User CRUD (dev only)
- Login / logout
- Password reset (email-based)
- Unified booking search

---

### Booking Module (`/booking`)
- Create & update bookings
- Role-restricted updates
- Full audit trail
- Trash → restore → permanent delete
- Advanced filters & pagination

---

### Employee Module (`/employee`)
(HR only)
- Employee profile lifecycle
- Document uploads
- Approval & deactivation
- Stats & export (CSV)

---

### Payment Module (`/payments`)
- Payment Gateway payment links
- Payment Gateway QR codes
- Status updates
- Google Sheets logging (best-effort)

---

### Email & Leads
- Raw email ingestion
- Operational lead handling
- Duplicate cleanup via cron

⚠️ Not a full Lead CRM by design.

---

## 🗄️ Database & Auditing

- MongoDB + Mongoose
- Update history stored for:
  - Bookings
  - Employees

Never remove audit fields.

---

## 📜 Logging

- Morgan → HTTP logs
- Winston → application logs
- Daily rotated files
- Separate error logs

---

## ⏱️ Background Jobs

- Duplicate lead cleanup
- Data consistency enforcement

Implemented using `node-cron`.

---

## ⚙️ Environment Variables

```env
PORT=
Mongo_URL=
JWT_SECRET=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

MAIL_USER=
MAIL_PASS=

APPSCRIPT_URL=
APPSCRIPT_SECRET=
```

## 🚀 Running Locally

```bash
npm install
npm run dev
```

Production:

```bash
npm run build
npm run start
```


## 🚧 Recommended Improvements

- RBAC permission framework
- Service layer abstraction
- DTO validation layer
- API versioning (`/v1`)
- Webhook-based payment reconciliation
- Redis caching (read-heavy endpoints)

---

## 🧠 Mentor Notes

This backend is:
- Production-oriented
- Audit-heavy
- Built for operations, not demos

Refactor carefully. Preserve:
- Auth contract
- Audit trails
- Payment integrity

## 🚀 v1.0.1 – Stable Production Release

### ✅ Features
- Booking management with offline support
- Service selection & invoice viewing
- Payment initiation (links & QR)
- Role-based UI rendering
- IndexedDB caching for core entities

### ⚡ Improvements
- Reduced API calls via local cache
- Faster UI hydration
- Improved error handling

### 🛡️ Security
- JWT-based authentication
- No Bearer token dependency (custom auth contract)

### ⚠️ Known Limitations
- Lead management UI not included
- Payments require an active internet connection

### 📌 Notes
This release is production-stable and actively used for internal operations.

<img width="1920" height="868" alt="Login Page - CRM v2" src="https://github.com/user-attachments/assets/acd2b99b-cbc4-4984-ab83-14002a000d76" />
<img width="1920" height="1631" alt="Dashboard Page - CRM V2" src="https://github.com/user-attachments/assets/a8af50c5-12d1-4cd6-b6c9-cf3a203b83d2" />
<img width="1920" height="1747" alt="New Booking Page - CRM V2" src="https://github.com/user-attachments/assets/73d188c7-1b45-4e90-aab3-58878d6a7b1d" />
<img width="1920" height="1355" alt="All Bookings Page  - CRM V2" src="https://github.com/user-attachments/assets/0f78d472-fb7e-4dfa-a4e0-90bd432d03e1" />
<img width="1920" height="1270" alt="Payment Link Page  -   CRM V2" src="https://github.com/user-attachments/assets/877bd6d3-8ec1-4803-b97e-8965d60f2097" />
<img width="1920" height="1319" alt="QR Code Page   - CRM V2" src="https://github.com/user-attachments/assets/fd5fc0b8-1c0b-4ab7-abd8-9e19f6d374da" />
<img width="1920" height="1946" alt="Proforma Invoice Page -  CRM V2" src="https://github.com/user-attachments/assets/87335a5c-0490-470e-84c2-e80293a6fa6f" />
<img width="1920" height="978" alt="Users Page  - CRM V2" src="https://github.com/user-attachments/assets/b2b9d207-8fb8-428d-ac39-354493101b5a" />
<img width="1920" height="1094" alt="Services Page  - CRM V2" src="https://github.com/user-attachments/assets/ef21f28f-b7d4-4efd-b60a-641b5cefa3b0" />
<img width="1920" height="1140" alt="Trash Page  - CRM V2" src="https://github.com/user-attachments/assets/6f2c3772-08d1-4239-b209-6587d849e9b5" />

## 🛣️ Roadmap

### v1.1
- UI-level RBAC guards
- Centralized notification system
- Improved error boundaries

### v1.2
- PWA support
- Background sync for offline updates
- Better loading states & skeletons

### v2.0
- Full Lead Management UI
- Advanced analytics dashboards
- Config-driven feature flags


## 👨‍💻 Developer
Rizvan K

Backend & Full‑Stack Developer

[Portfolio](https://rizvan.is-a.dev/)

---


