<h1>Full-stack Chat Application</h1>

---
Check out the demo here: 🚀
[Go to demo App](https://chatify-6cw27.sevalla.app/)

---
Feature:
- Custom JWT Authentication
- Real-time Messaging via Socket.io
- Online/Offline Presence Indicators
- REST API with Node.js & Express
- MongoDB for Data Persistence
- API Rate-Limiting powered by Arcjet
- Zustand for State Management
- Deployment with Sevalla
- CI using GitHub Action

Upcoming feature:
- Send welcome email (requires a owned domain)
- Test automation using Robot Framework
- (Front-end) Indicators for unseen message
- (Front-end) New features for chat container.

---
## Resources:
### Backend:
- MongoDB (for storing user's data and message): https://www.mongodb.com/
- Cloudinary (for storing image): https://cloudinary.com/
- Arcjet (for preventing DDOS and protect the app from bot): https://app.arcjet.com/
- Sevalla (for deploying web application): https://app.sevalla.com/
- Resend (for sending welcome email): https://resend.com/

### Frontend:
- tailwindcss: https://v3.tailwindcss.com/
- daisyUI (v4): https://daisyui.com/?lang=en
- React-Hot-Toast: https://react-hot-toast.com/
- Cruip (Tailwind CSS template): https://cruip.com/
- Lucide (nice buttons and icons): https://lucide.dev/

---

## Setup before running the application

### Backend (`/backend`)
### .env setup
```bash
PORT=3000
MONGO_URI=your_mongo_uri_here

# For testing
MONGO_URI_FOR_TEST=add_your_mongo_uri_for_test_here

NODE_ENV=development #change this to `test` if you want to enable test mode for database and arcjet

JWT_SECRET=your_jwt_secret

RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=your_email_from_address
EMAIL_FROM_NAME=your_email_from_name

CLIENT_URL=http://localhost:5173 (if you have a URL from Sevalla, replace the localhost with it)

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

ARCJET_KEY=your_arcjet_key
ARCJET_ENV=development
```

---

## 🔧 Run the Backend

```bash
cd backend
npm install
npm run dev
```

## 💻 Run the Frontend

```bash
cd frontend
npm install
npm run dev
```
