# ⚙️ GAS MTAANI - Backend REST Engine

The robust API engine for Gas Mtaani, built with **Django REST Framework** and integrated with **MongoDB Atlas**.

##  System Design
The backend is designed as a stateless RESTful service. It handles all business logic, role validation, and identity verification.

##  Identity Lifecycle (OTP)
1. **Signup:** User triggers `POST /api/signup/`. Account created as `is_active=False`.
2. **SMTP Action:** Django generates a random 6-digit integer and dispatches it via `django.core.mail`.
3. **Verification:** User submits OTP to `/api/verify/`. If matched, `is_active` flips to `True`.
4. **Authorization:** System returns a permanent `Token` for subsequent authenticated requests.

## Business Intelligence (BI) Logic
The `/api/dashboard-stats/` endpoint is an aggregation powerhouse:
* Uses Django's `Sum` and `Count` functions on MongoDB documents.
* Calculates: Total revenue, active customer base, and inventory health metrics.

##  API Registry

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/products/` | GET | Public | Fetch catalog with dynamic Deal Price logic. |
| `/api/products/<id>/` | PATCH | Admin | Partial update for inventory and deal scheduling. |
| `/api/orders/` | POST | Buyer | Submit order manifest and items array. |
| `/api/verify-email/`| POST | Public | Token-activation via OTP check. |

## Database Strategy (MongoDB Atlas)
We chose NoSQL to handle **Polymorphic Product Data**. 
* **Schema Flexibility:** Gas cylinders vary by Valve Type, Brand, and Weight.
* **Performance:** MongoDB allows these varied schemas to coexist in a single `products` collection without expensive migrations or `null` column overhead.

## Production Recommendations
* **Media:** Use an AWS S3 Bucket for the `/media/` folder to serve product images via CDN.
* **Workers:** Use Gunicorn with `UvicornWorker` for async support.
* **Security:** Ensure `DEBUG=False` and `ALLOWED_HOSTS` are strictly defined in `settings.py`.
