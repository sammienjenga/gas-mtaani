# GAS MTAANI ⚡ Enterprise Energy Logistics Ecosystem

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Framework: Django](https://img.shields.io/badge/Backend-Django_5.x-green)](https://www.djangoproject.com/)
[![Library: React](https://img.shields.io/badge/Frontend-React_18-61DAFB)](https://reactjs.org/)
[![Database: MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248)](https://www.mongodb.com/)

## Project Introduction
**Gas Mtaani** is a high-density, mission-critical logistics platform engineered to digitize the cooking gas supply chain for university ecosystems. It bridges the gap between gas retailers and the Karatina University community through a high-performance, secure, and role-based architecture.

## System Architecture
The system utilizes a **Decoupled Client-Server Architecture** designed for high availability and strict separation of concerns.



### High-Level Workflow
1.  **Identity Phase:** User registers -> SMTP triggers 6-digit OTP -> Account remains `inactive` until verification.
2.  **Engagement Phase:** Authenticated Buyer explores the "Gas Inventory" or "Flash Sales."
3.  **Logistics Phase:** Buyer builds a "Bundle" -> Secure Checkout -> Admin "Control Room" receives order manifest.
4.  **Fulfillment Phase:** Admin dispatches gas -> Status updates in real-time on Buyer dashboard.

## Tech Stack Breakdown
| Layer | Component | Implementation |
| :--- | :--- | :--- |
| **Frontend** | UI Framework | React 18 (Vite Build System) |
| **Styling** | Design System | Tailwind CSS (Industrial Dark Theme) |
| **State** | Global Store | React Context API (Auth & Cart) |
| **Backend** | API Engine | Django REST Framework (DRF) |
| **Database** | Persistence | MongoDB Atlas (NoSQL Document Store) |
| **Identity** | Security | SMTP Email Services & DRF Token Auth |

## Security Architecture
* **Email OTP Lifecycle:** Accounts are locked (`is_active=False`) until a server-side OTP match occurs.
* **RBAC (Role-Based Access Control):** Permissions are strictly enforced via Django `IsAdminUser` and `IsAuthenticated` classes.
* **Token Handshake:** All sensitive requests require a `Authorization: Token <key>` header.
* **Defensive Frontend:** HOC (Higher-Order Components) prevent UI sniffing of admin routes.

## Running Locally
1. **Backend:** `cd backend && pip install -r requirements.txt && python manage.py runserver`
2. **Frontend:** `cd frontend && npm install && npm run dev`
