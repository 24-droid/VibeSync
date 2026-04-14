# 🚀 VibeSync Deployment Guide

Follow these steps to deploy VibeSync to **Vercel** (Frontend) and **Render** (Backend).

## 1. Backend Deployment (Render)

1.  **Create a New Web Service:** Connect your GitHub repository to Render.
2.  **Configuration:**
    - **Name:** `vibesync-api`
    - **Language:** `Node`
    - **Root Directory:** `server`
    - **Build Command:** `npm install`
    - **Start Command:** `npm start`
3.  **Environment Variables:** Add all keys from your `.env` file:
    - `MONGO_URI`: (Use your MongoDB Atlas prod string)
    - `JWT_SECRET`: (A strong random string)
    - `GEMINI_API_KEY`: (Your Google AI key)
    - `ALLOWED_ORIGINS`: `https://your-frontend-url.vercel.app` (Add this *after* creating the Vercel project)
4.  **Copy your Service URL:** It will look like `https://vibesync-api.onrender.com`.

---

## 2. Frontend Deployment (Vercel)

1.  **Import Project:** Connect your GitHub repository to Vercel.
2.  **Configuration:**
    - **Framework Preset:** `Vite`
    - **Root Directory:** (Leave as default `/`)
    - **Build Command:** `npm run build`
    - **Output Directory:** `dist`
3.  **Environment Variables:**
    - `VITE_API_URL`: `https://vibesync-api.onrender.com/api` (Point this to your Render URL)
4.  **Deploy:** Click "Deploy" and wait for the "Congratulations" screen.

---

## 3. Post-Deployment (Closing the loop)

1.  Copy your new Vercel URL (e.g., `https://vibe-sync-xyz.vercel.app`).
2.  Go back to your **Render Dashboard** → Environment Settings.
3.  Update `ALLOWED_ORIGINS` with your Vercel URL.
4.  Restart the Render service.

---

## ⚠️ Important Notes

### 1. Image Persistence
Render's filesystem is ephemeral. This means uploaded images in the `server/public/uploads` folder will disappear after the service restarts (which happens every time you push code).
- **Pro Solution:** For a permanent app, swap the local upload logic in `analysis.js` with a cloud provider like **Cloudinary** or **Supabase Storage**.

### 2. Cold Starts
If you are on Render's **Free Tier**, the server "sleeps" after 15 minutes of inactivity. The first request (like your initial mood scan) might take 30-60 seconds to respond as it wakes up.
