# FITHUB - Gym Management System 💪

A complete gym management web application built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js). FITHUB helps gym owners manage memberships, members, products, payments, and marketing banners - all with a modern Gen-Z friendly interface.

## ✨ Features

### For Members (Website Visitors)
- 🏠 **Home page** with hero section and marketing banners
- 💳 **Subscription plans** with easy online payment (Razorpay gateway)
- 🛍️ **Products store** - view supplements, equipment, apparel & accessories
- 👤 **Member dashboard** - view active membership, payment status, expiry dates
- 📝 **Contact & About** pages
- 🔐 **Login/Register** with:
  - Email + Password
  - Phone + OTP (verification code sent to email)
  - Password reset via OTP

### For Gym Owner (Admin Panel)
- 📊 **Dashboard** with stats (members, products, revenue)
- 👥 **Member management** - add, edit, delete members
- 🎫 **Assign memberships** with custom start dates and partial payments
- 💰 **Payment tracking** - fees paid vs remaining, filter by status
- 📦 **Product inventory** - add/edit products, quick stock updates
- 📢 **Marketing banners** - create/activate/deactivate promotional banners
- 🏷️ **Subscription plans** - create/edit/delete membership plans

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Framer Motion, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT, Bcrypt, Email OTP (Nodemailer) |
| Payments | Razorpay (with gym-payment fallback) |

## 📁 Project Structure

```
fithub/
├── server/                  # Backend (Node.js + Express)
│   ├── config/db.js         # MongoDB connection
│   ├── models/              # Mongoose models
│   │   ├── User.js
│   │   ├── OTP.js
│   │   ├── Subscription.js
│   │   ├── Membership.js
│   │   ├── Product.js
│   │   └── Banner.js
│   ├── controllers/         # Business logic
│   ├── routes/              # API endpoints
│   ├── middleware/          # Auth guards
│   ├── seed.js              # Sample data + admin seeding
│   └── server.js            # Entry point
│
└── client/                  # Frontend (React + Tailwind)
    ├── public/
    └── src/
        ├── components/      # Navbar, Footer, Logo
        ├── context/         # Auth context
        ├── pages/           # Public pages
        │   └── admin/       # Admin panel pages
        └── App.jsx
```

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- MongoDB - either:
  - [MongoDB Atlas](https://www.mongodb.com/atlas) (free cloud - **recommended**), or
  - Local MongoDB installation

### 1. Setup MongoDB

**Option A: MongoDB Atlas (Recommended)**
1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free M0 tier)
3. Click "Connect" → "Connect your application"
4. Copy the connection string (looks like `mongodb+srv://user:pass@cluster.mongodb.net/...`)
5. Replace the `MONGO_URI` in `server/.env`

**Option B: Local MongoDB**
1. Install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
2. The default local connection `mongodb://localhost:27017/fithub` will work

### 2. Configure Environment

Edit `server/.env` and fill in your values:

```env
PORT = 5000
MONGO_URI = mongodb+srv://your-mongodb-atlas-url  # OR local MongoDB URL

# Email OTP (Use Gmail app password)
# Create app password: Google Account → Security → 2-Step Verification → App passwords
EMAIL_USER = your_email@gmail.com
EMAIL_PASS = your_gmail_app_password

# Razorpay (Optional - for online payments)
# Get from dashboard.razorpay.com
RAZORPAY_KEY_ID = your_razorpay_key_id
RAZORPAY_KEY_SECRET = your_razorpay_key_secret
```

> **Note about OTP:** The OTP is sent via email (Gmail). Even if the user registers/logs in with their phone, the OTP goes to their registered email. If you don't configure Gmail, OTP sending will fail - but you can skip OTP by using email+password login/registration directly.

### 3. Install and Run

**Backend:**
```bash
cd server
npm install
# Optional: seed sample data + create admin
npm run seed
npm start          # runs on http://localhost:5000
```

**Frontend (in a new terminal):**
```bash
cd client
npm install
npm start          # runs on http://localhost:3000
```

Open http://localhost:3000 in your browser.

### 4. Admin Login

After running the seed script, the default admin is:
- **Email:** `admin@fithub.com`
- **Password:** `admin123`

> ⚠️ **Important:** Change the admin password after first login!

## 🌐 API Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login with email/password | Public |
| POST | `/api/auth/send-otp` | Send registration OTP | Public |
| POST | `/api/auth/verify-otp` | Verify registration OTP | Public |
| POST | `/api/auth/login-phone` | Send login OTP to phone | Public |
| POST | `/api/auth/verify-phone-otp` | Verify phone OTP & login | Public |
| POST | `/api/auth/forgot-password` | Send reset OTP | Public |
| POST | `/api/auth/reset-password` | Reset password | Public |
| GET | `/api/subscriptions` | Get active plans | Public |
| GET | `/api/products` | Get available products | Public |
| GET | `/api/banners` | Get active banners | Public |
| POST | `/api/payment/create-order` | Create Razorpay order | Private |
| POST | `/api/payment/verify` | Verify payment & activate | Private |
| GET | `/api/members` | List all members | Admin |
| POST | `/api/members/:id/membership` | Assign membership | Admin |
| POST | `/api/members/:id/payment` | Record payment | Admin |
| ... | ... | ... | ... |

## 📱 Payment Handling

- **Online:** Set your Razorpay keys in `server/.env`. Members can pay directly via UPI, cards, or net banking.
- **Offline/Gym:** If Razorpay keys aren't configured, the app falls back to "Pay at Gym" mode. The admin records payments manually from the admin panel.
- **Partial payments:** Admin can assign a membership with partial payment and record the remaining amount later.

## 🔒 Admin Routes

| URL | Description |
|-----|-------------|
| `/admin` | Dashboard overview |
| `/admin/members` | Member management |
| `/admin/subscriptions` | Subscription plan management |
| `/admin/products` | Product & stock management |
| `/admin/banners` | Marketing banner management |
| `/admin/payments` | Payment tracking & recording |

## 🐛 Troubleshooting

**"Failed to send OTP"**
- Make sure `EMAIL_USER` and `EMAIL_PASS` are set correctly
- For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) (not your regular password), and enable 2-Step Verification

**MongoDB connection error**
- Verify your `MONGO_URI` in `server/.env`
- For Atlas, ensure your IP is whitelisted (Network Access → Add IP Address → Allow access from anywhere)

**Port already in use**
- Change `PORT` in `server/.env`, or stop the process using port 5000

**Payments not working**
- Check Razorpay keys are configured
- Livemode requires verified Razorpay account; test with test keys first

## 📄 License

This project is for college/academic purposes. All brand content is fictional.

---

Made with 💪 for FITHUB - Train Beast Mode ON 🔥
