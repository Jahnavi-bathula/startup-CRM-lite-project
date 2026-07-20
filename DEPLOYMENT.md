# Startup CRM Lite — Deployment Guide

This guide explains exactly how to deploy Startup CRM Lite so that
**Register**, **Login**, and all features work correctly in production.

---

## Architecture

```
[User Browser]
     |
     v
[Vercel — Frontend (React + Vite)]
     |  API calls via VITE_API_URL
     v
[Railway — Backend (Node.js + Express)]
     |  Mongoose via MONGODB_URI
     v
[MongoDB Atlas — Database]
```

---

## Step 1 — MongoDB Atlas: Allow Railway IPs

Railway uses dynamic IPs. You MUST whitelist all IPs in MongoDB Atlas.

1. Log in to https://cloud.mongodb.com
2. Go to your project → Network Access (left sidebar)
3. Click + Add IP Address
4. Click "Allow Access from Anywhere" → sets 0.0.0.0/0
5. Click Confirm

> If you see "Database connection failure" in Railway logs, this is the cause.

---

## Step 2 — Railway: Set Environment Variables

Railway does NOT read your .env file from GitHub.
Set all variables manually in the Railway dashboard.

1. Go to Railway → open your backend service
2. Click the Variables tab
3. Add each variable:

   MONGODB_URI   = mongodb+srv://crm-admin:<password>@startupcrmlite.wcn2oco.mongodb.net/?appName=startupcrmlite
   JWT_SECRET    = (copy from your local backend/.env)
   JWT_EXPIRES_IN = 7d
   NODE_ENV      = production
   FRONTEND_URL  = https://startup-crm-lite-project-xi.vercel.app

   WARNING: Do NOT set PORT — Railway injects this automatically.

4. Railway will auto-redeploy after saving variables.

### Verifying Railway:
Visit: https://<your-service>.up.railway.app/api/health

Expected response:
{
  "success": true,
  "message": "Backend is running successfully.",
  "timestamp": "2026-...",
  "environment": "production",
  "uptime": "5s"
}

Check Railway logs for:
  All required environment variables are present.
  CORS allowed origins: ["https://startup-crm-lite-project-xi.vercel.app"]
  Current environment: production
  MongoDB Atlas Connected: ...
  Server running on port XXXX in production mode

---

## Step 3 — Get Your Railway Domain

1. Railway → your backend service → Settings → Networking → Generate Domain
2. Copy the domain: e.g. startup-crm-lite-production.up.railway.app
3. Use this as VITE_API_URL in Vercel (Step 4)

---

## Step 4 — Vercel: Set Environment Variables

Vite bakes env vars at BUILD TIME. The .env file is gitignored so
Vercel never sees it. You MUST set VITE_API_URL in the Vercel dashboard.

1. Go to Vercel → your frontend project
2. Click Settings → Environment Variables
3. Add:

   VITE_API_URL = https://<your-railway-service>.up.railway.app

   Set Environment to: Production, Preview, Development (all three)

4. Click Save
5. Go to Deployments → latest deployment → Redeploy
   (This rebuilds with the new env var baked in)

---

## Step 5 — End-to-End Verification

Backend checks:
  https://<railway-url>/           → returns API info JSON
  https://<railway-url>/api/health → returns { "success": true, ... }

Frontend checks (open browser DevTools console at Vercel URL):
  - No [CRM] CRITICAL or [CRM] WARNING messages
  - Network tab → Login request URL starts with Railway URL (not localhost)

Full flow test (use Incognito window):
  1. Open Vercel URL
  2. Click Register → enter name, email, password → submit
  3. Should redirect to Dashboard
  4. Logout
  5. Login with same credentials → should redirect to Dashboard
  6. Create a Lead → verify it appears in the list

---

## Troubleshooting

Symptom                          | Cause                      | Fix
---------------------------------|----------------------------|-----------------------------
"train has not arrived"          | Railway crashed            | Check Railway logs — missing env vars (Step 2)
Register/Login fails silently    | VITE_API_URL wrong         | Check browser console for [CRM] warnings
"Network Error" in browser       | CORS / FRONTEND_URL wrong  | Verify FRONTEND_URL in Railway = Vercel URL exactly
"Database connection failure"    | MongoDB Atlas blocks IP    | Add 0.0.0.0/0 in Atlas Network Access (Step 1)
401 on every protected request   | JWT_SECRET mismatch        | Ensure same JWT_SECRET in Railway as local .env

---

## Local Development

Terminal 1 — Backend:
  cd backend
  npm install
  # Ensure backend/.env exists with local values
  npm run dev

Terminal 2 — Frontend:
  npm install
  # Ensure root .env has: VITE_API_URL=http://localhost:5000
  npm run dev

Local frontend: http://localhost:5173
Local backend:  http://localhost:5000/api/health
