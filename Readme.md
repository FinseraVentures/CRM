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
Authorization: <JWT_TOKEN>
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

---

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

---

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
Rizvan 

Backend & Full‑Stack Developer

[Portfolio](https://rizvan.is-a.dev/)

---


