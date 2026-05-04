# LifeAid Backend

Django REST backend for LifeAid, a role-based community health support and medical donation platform with MySQL, JWT authentication, Razorpay payment flow, notifications, analytics, chatbot, and Django admin controls.

## Stack

- Django + Django REST Framework
- MySQL
- JWT via `djangorestframework-simplejwt`
- Razorpay test-mode integration
- SMTP email notifications
- Twilio SMS hooks
- Django media storage for uploaded medical documents

## Project Structure

```text
lifeaid_backend/
├── manage.py
├── requirements.txt
├── .env.example
├── lifeaid/
├── apps/
│   ├── accounts/
│   ├── patients/
│   ├── doctors/
│   ├── donors/
│   ├── organizations/
│   ├── payments/
│   ├── notifications/
│   ├── chatbot/
│   ├── dashboard/
│   └── adminpanel/
├── common/
├── media/
└── templates/
```

## Implemented Models

- `CustomUser`
- `DoctorProfile`
- `OrganizationProfile`
- `HelpRequest`
- `Donation`
- `Notification`
- `ActivityLog`

Initial migration files are included under each app’s `migrations/` folder.

## Main API Endpoints

### Auth

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `POST /api/auth/token/refresh/`
- `GET /api/auth/profile/`
- `PUT /api/auth/profile/update/`

### Patient

- `POST /api/patient/request/create/`
- `GET /api/patient/request/my-requests/`
- `GET /api/patient/request/<id>/`
- `GET /api/patient/notifications/`

### Doctor

- `GET /api/doctor/requests/pending/`
- `PUT /api/doctor/requests/<id>/verify/`
- `GET /api/doctor/requests/verified/`

### Donor

- `GET /api/donor/requests/`
- `GET /api/donor/requests/filter/`
- `GET /api/donor/requests/search/`
- `POST /api/donor/donate/initiate/`
- `POST /api/donor/donate/verify/`
- `GET /api/donor/donations/history/`

### Organization

- `GET /api/org/requests/`
- `POST /api/org/donate/bulk/`
- `GET /api/org/donations/analytics/`

### Payments

- `POST /api/payment/create-order/`
- `POST /api/payment/verify/`
- `POST /api/payment/webhook/`

### Notifications

- `GET /api/notifications/all/`
- `POST /api/notifications/mark-read/<id>/`

### Search / Filter

- `GET /api/requests/search/?q=...`
- `GET /api/requests/filter/?illness_type=&location=&urgency=&date_from=&date_to=`

### Dashboard / Analytics

- `GET /api/dashboard/admin/`
- `GET /api/dashboard/patient/`
- `GET /api/dashboard/donor/`
- `GET /api/dashboard/org/`
- `GET /api/dashboard/analytics/donations/`
- `GET /api/dashboard/analytics/cases/`

### Chatbot

- `POST /api/chatbot/message/`

### Admin

- `GET /api/admin/users/`
- `PUT /api/admin/users/<id>/approve/`
- `DELETE /api/admin/users/<id>/delete/`
- `GET /api/admin/requests/`
- `PUT /api/admin/requests/<id>/approve/`
- `GET /api/admin/reports/donations/`
- `GET /api/admin/logs/`

## Setup

1. Create and activate a virtual environment.

```powershell
python -m venv venv
venv\Scripts\activate
```

2. Install dependencies.

```powershell
pip install -r requirements.txt
```

3. Create a MySQL database.

```sql
CREATE DATABASE lifeaid CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. Copy `.env.example` to `.env` and update DB, Razorpay, Twilio, and SMTP values.

5. Run migrations.

```powershell
python manage.py migrate
```

6. Create an admin user.

```powershell
python manage.py createsuperuser
```

7. Start the backend.

```powershell
python manage.py runserver
```

8. Open Django admin at `http://127.0.0.1:8000/admin/`.

## Business Flow Implemented

1. Patient submits a help request with optional medical document upload.
2. Approved doctor verifies or rejects the request with remarks.
3. Admin gives final approval to verified requests.
4. Donors can browse verified and approved requests, create Razorpay orders, and verify payment signatures.
5. Organizations can donate in bulk after admin approval.
6. Successful donations update `amount_raised`; fully funded requests move to `funded`.
7. Notifications are triggered for status changes and confirmed donations.

## Security Features

- JWT-protected APIs
- Role-based permission classes for patient, doctor, donor, organization, and admin
- File validation for PDF/JPG/JPEG/PNG up to 5MB
- DRF throttling on auth endpoints
- CSRF middleware enabled
- Razorpay webhook signature verification hook

## Notes

- Razorpay calls use live client code paths but require valid test keys in `.env`.
- Twilio SMS is optional and controlled by `ENABLE_SMS_NOTIFICATIONS`.
- SMTP uses Django’s standard email backend; set credentials in `.env`.
- The codebase was created in this workspace, but dependencies were not installed in the current venv during this turn.
