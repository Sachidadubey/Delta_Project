# 🏡 Wanderlust — Full-Stack Travel Booking Platform

> A production-ready, Airbnb-inspired travel platform with real payment processing, interactive maps, automated emails, and a complete booking management system.

---

## 🔗 Live Demo

** https://major-project-tt4c.onrender.com**

> Test credentials — Email: `demo@wanderlust.com` / Password: `demo1234`

---

## 📌 Overview

Wanderlust is a full-stack web application that allows users to discover travel listings, create their own properties, leave reviews, and complete real bookings with integrated Razorpay payments. Built with a clean **MVC architecture** on Node.js/Express/MongoDB, it covers the complete lifecycle of a booking platform — from user authentication to payment verification to automated email notifications.

---

## ✨ Key Features

### 🔐 Authentication & Session Management

- Signup/Login via **Passport.js** (passport-local-mongoose)
- Passwords are **automatically hashed** — never stored in plain text
- Sessions persisted in MongoDB via **connect-mongo** (survives server restarts)
- Protected routes with `isLoggedIn` and `isOwner` middleware

### 🏠 Listing Management

- Full **CRUD** for listings (Create / Read / Update / Delete)
- Image uploads via **Multer + Cloudinary** (stored as `{ url, filename }`)
- Location converted to **GeoJSON coordinates** via Mapbox Geocoding API
- Interactive map displayed on each listing page

### 🔍 Search & Filtering

- Search by **title, location, or country** using MongoDB `$or` regex queries
- Category filters: Trending · Rooms · Mountain · Camping · Farms

### 💳 Booking System with Real Payments

- Users select **check-in / check-out dates**; nights and total price auto-calculated
- **Razorpay** order created server-side → Razorpay checkout popup triggered on frontend
- Payment verified server-side using **HMAC-SHA256 signature**:

- Booking status transitions: `pending → confirmed` (on success) or `failed` (on mismatch)
- Full **My Bookings** dashboard with booking history

### 📩 Automated Email Notifications

| Trigger           | Email Sent To                 |
| ----------------- | ----------------------------- |
| Signup            | Welcome email → User          |
| Login             | Login alert → User            |
| Booking Confirmed | Confirmation + details → User |
| Listing Created   | Owner notification → Creator  |
| Listing Deleted   | Deletion alert → Owner        |
| Profile Updated   | Change alert → User           |

### ⭐ Reviews

- Star ratings + text reviews linked to both user and listing
- Only authenticated users can post; only authors can delete
- Populated and displayed with listing detail

### 🛡️ Admin Dashboard

- Role-based access control — `admin` vs `user` roles on User model
- Dedicated `/admin` route protected by `isAdmin` middleware
- Live stats — total users, listings, bookings, confirmed/pending counts and revenue
- Recent users table with one-click delete (admins protected from deletion)
- Recent listings table with one-click delete
- Recent bookings overview with status pills
- Admin link auto-appears in navbar only for admin accounts

### 🔒 Security

- **Helmet.js** with Content Security Policy (CSP) — protects against XSS and malicious scripts
- `isOwner` middleware prevents unauthorized edits/deletes
- `isAdmin` middleware — role check on every admin route
- `validateListing` middleware with **Joi** schema validation on all inputs

---

## 🏗️ Architecture

Client (EJS + Vanilla JS)
↓
Routes (Express Router)
↓
Controllers (Business Logic)
↓
Models (Mongoose)
↓
Database (MongoDB Atlas)

### Folder Structure

wanderlust/
├── controllers/ # Route handlers — listings, users, bookings, reviews, admin
├── models/ # Mongoose schemas — Listing, User, Booking, Review
├── routes/ # Express routers
├── views/ # EJS templates
│ └── layouts/ # Base layout with nav, flash messages
├── public/ # Static assets (CSS, JS, icons)
├── utils/ # Error handler, wrapAsync, email helper
├── middleware.js # isLoggedIn, isOwner, isAdmin, validateListing
├── cloudConfig.js # Cloudinary + Multer setup
├── app.js # Express app config, middleware stack
└── .env # Environment secrets (never committed)

---

## 🔄 Core Flows

### Payment Flow (Razorpay Integration)

User clicks "Book & Pay"
↓
POST /listings/:id/create-order
↓
Backend: calculate nights × price → razorpay.orders.create()
↓
Booking saved to DB (status: pending)
↓
Razorpay checkout popup (frontend)
↓
User completes payment
↓
POST /bookings/verify-payment
↓
HMAC signature verification (server-side)
↓
Booking status → "confirmed" + paymentId saved
↓
Confirmation email sent → Redirect /my-bookings

### Auth Flow (Passport.js)

POST /users/signup
↓
User.register() → password auto-hashed (passport-local-mongoose)
↓
req.login() → session created → stored in MongoDB
↓
Welcome email triggered → Redirect

---

## 🛠️ Tech Stack

| Layer         | Technology                            |
| ------------- | ------------------------------------- |
| Runtime       | Node.js                               |
| Framework     | Express.js                            |
| Database      | MongoDB Atlas + Mongoose              |
| Templating    | EJS + EJS-Mate                        |
| Auth          | Passport.js + passport-local-mongoose |
| Sessions      | express-session + connect-mongo       |
| Payments      | Razorpay                              |
| Maps          | Mapbox GL JS + Mapbox Geocoding API   |
| Image Storage | Cloudinary + Multer                   |
| Email         | Nodemailer                            |
| Security      | Helmet.js (CSP) + Joi validation      |
| Styling       | Bootstrap 5                           |

---

## ⚙️ Local Setup

### 1. Clone & Install

```bash
git clone https://github.com/sachidanand/wanderlust.git
cd wanderlust
npm install
```

### 2. Environment Variables

Create a `.env` file in the root:

```env
# Database
ATLASDB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/wanderlust

# Session
SECRET=your_super_secret_key

# Mapbox
MAP_TOKEN=pk.eyJ1IjoieW91...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret

# Nodemailer
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 3. Seed the Database (Optional)

```bash
node init/index.js
```

### 4. Run Locally

```bash
npm run dev
```

App runs at: `http://localhost:8080`

---

## 🌐 API Routes

### Listings

| Method | Route           | Description                       | Auth Required |
| ------ | --------------- | --------------------------------- | ------------- |
| GET    | `/listings`     | All listings (with search/filter) | ❌            |
| GET    | `/listings/new` | Create listing form               | ✅            |
| POST   | `/listings`     | Create new listing                | ✅            |
| GET    | `/listings/:id` | Single listing + map              | ❌            |
| PUT    | `/listings/:id` | Update listing                    | ✅ Owner only |
| DELETE | `/listings/:id` | Delete listing                    | ✅ Owner only |

### Bookings

| Method | Route                         | Description              | Auth Required |
| ------ | ----------------------------- | ------------------------ | ------------- |
| GET    | `/bookings/listings/:id/book` | Booking form             | ✅            |
| POST   | `/listings/:id/create-order`  | Create Razorpay order    | ✅            |
| POST   | `/bookings/verify-payment`    | Verify payment signature | ✅            |
| GET    | `/bookings/my-bookings`       | User booking history     | ✅            |

### Auth

| Method   | Route           | Description |
| -------- | --------------- | ----------- |
| GET/POST | `/users/signup` | Register    |
| GET/POST | `/users/login`  | Login       |
| GET      | `/users/logout` | Logout      |

### Admin

| Method | Route                 | Description               | Auth Required |
| ------ | --------------------- | ------------------------- | ------------- |
| GET    | `/admin`              | Dashboard with live stats | ✅ Admin only |
| DELETE | `/admin/users/:id`    | Delete a user             | ✅ Admin only |
| DELETE | `/admin/listings/:id` | Delete any listing        | ✅ Admin only |

---

## 🚀 Deployment

Deployed on **Render** (web service).

- MongoDB: MongoDB Atlas (cloud cluster)
- Images: Cloudinary CDN
- Sessions: Persisted in MongoDB (not in-memory — survives Render cold starts)

---

## 🧠 Technical Highlights

- **HMAC signature verification** for Razorpay — payments cannot be spoofed
- **GeoJSON storage** (`listing.geometry`) for Mapbox coordinate rendering
- **Role-based access control** — `isAdmin` middleware guards all admin routes server-side
- **Session vs Flash** — flash used for standard redirects; `req.session` used for Razorpay's async JSON flow where flash doesn't persist across the redirect chain
- **MongoStore sessions** — ensures auth state survives server restarts (critical for production)
- **MVC separation** — controllers hold zero DB logic (delegated to service/model layer)

---

## 📈 Roadmap

- [ ] Prevent double-booking (date overlap validation)
- [ ] Pagination for listings
- [ ] Price range + sorting filters
- [ ] Wishlist / Save listing feature
- [ ] Admin analytics charts (revenue over time, booking trends)
- [ ] Bulk delete and export for admin
- [ ] Mobile-first UI polish

---

## 👨‍💻 Author

**Sachida dhar dubey**
Final Year B.Tech CSE | Aspiring Backend Developer
📍 India | Open to Backend / MERN Stack roles

Built end-to-end — from schema design to payment integration to admin tooling.

---

> ⭐ If this project helped or impressed you, a star on GitHub means a lot!
