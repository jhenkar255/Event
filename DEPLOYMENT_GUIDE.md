# 🚀 UTSAVMITRA – Cloud Deployment Guide

This guide details step-by-step instructions to deploy **UTSAVMITRA** to your choice of cloud platforms.

Your MongoDB Atlas database is already live and connected at:
`mongodb+srv://Jhenkar2005:...@cluster0.xmxj8sa.mongodb.net/utsavmitra`

---

## 🌟 Option 1: Render.com (Recommended – Free & 1-Click Setup)

Render provides free hosting for both the **Node.js Express Backend API** and the **React Vite Frontend Static Site**.

### Step 1: Push your Code to GitHub
1. Create a repository on GitHub (e.g. `https://github.com/<your-username>/utsavmitra`).
2. In your terminal, run:
```bash
git add .
git commit -m "Deploy UtsavMitra to Cloud"
git remote add origin https://github.com/<your-username>/utsavmitra.git
git push -u origin main
```

### Step 2: Deploy on Render
1. Log in to [Render.com](https://render.com).
2. Click **New +** → **Blueprint**.
3. Select your GitHub repository.
4. Render will automatically read [`render.yaml`](file:///Users/apple/Event/render.yaml) and configure:
   - **Backend Web Service (`utsavmitra-backend`)**:
     - Root Dir: `backend`
     - Build: `npm install && npm run build`
     - Start: `npm start`
     - Environment Variables: Enter your `MONGODB_URI` from `.env`.
   - **Frontend Static Site (`utsavmitra-frontend`)**:
     - Root Dir: `frontend`
     - Build: `npm install && npm run build`
     - Publish Dir: `dist`
     - Rewrite rule: `/* -> /index.html`
5. Click **Apply**. Within 2-3 minutes, both your backend and frontend will be live with free SSL!

---

## ⚡ Option 2: Vercel (Frontend) + Render / Railway (Backend)

### Step 1: Deploy Backend to Render or Railway
1. Go to [Render.com](https://render.com) → **New +** → **Web Service**.
2. Connect your repo, set root directory to `backend`.
3. Set Build Command: `npm install && npm run build`
4. Set Start Command: `npm start`
5. Add Environment Variables:
   - `MONGODB_URI`: `mongodb+srv://Jhenkar2005:Jhenkar%402005@cluster0.xmxj8sa.mongodb.net/utsavmitra?retryWrites=true&w=majority&appName=Cluster0`
   - `JWT_SECRET`: `utsavmitra_super_secret_jwt_key_2026_auspicious`
   - `JWT_REFRESH_SECRET`: `utsavmitra_refresh_secret_key_2026_auspicious`
   - `QR_SIGNING_SECRET`: `utsavmitra_qr_token_signing_secret_key_2026`
   - `NODE_ENV`: `production`
6. Copy your backend live URL (e.g. `https://utsavmitra-api.onrender.com`).

### Step 2: Deploy Frontend to Vercel
1. Go to [Vercel.com](https://vercel.com) → **Add New Project**.
2. Select your repo and choose **Root Directory**: `frontend`.
3. Framework Preset: **Vite**.
4. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://utsavmitra-api.onrender.com` (Your backend URL)
5. Click **Deploy**. Vercel will build and serve your frontend with automatic global CDN!

---

## 🚂 Option 3: Railway.app (All-in-One Deployment)

1. Go to [Railway.app](https://railway.app) and create a **New Project** from GitHub.
2. Add Service 1: `backend` folder.
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Variables: Add `MONGODB_URI`, `JWT_SECRET`, `QR_SIGNING_SECRET`.
3. Add Service 2: `frontend` folder.
   - Set `VITE_API_URL` pointing to backend service domain.
4. Click **Deploy**.

---

## 🐳 Option 4: Docker & Docker Compose (Self-Hosted / VPS / AWS EC2 / Cloud Run)

To run the entire fullstack platform on any Linux server, VPS, or cloud VM:

```bash
# Clone and enter repo
git clone https://github.com/<your-username>/utsavmitra.git
cd utsavmitra

# Start both frontend & backend in background
docker compose up -d --build
```

- **Frontend**: `http://<your-server-ip>`
- **Backend API**: `http://<your-server-ip>:5050/api`

---

## 🔑 Default Administrator & Demo Accounts

Once deployed, your live platform is pre-loaded on MongoDB Atlas with:
- **Admin**: `admin@utsavmitra.demo` / `Utsav@2026` *(or `jhenkar1234@gmail.com`)*
- **Organizer**: `organizer@utsavmitra.demo` / `Utsav@2026`
- **Host / User**: `user@utsavmitra.demo` / `Utsav@2026`
