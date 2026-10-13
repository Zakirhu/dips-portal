# Learn with Zakir — Supabase & Render Deployment Guide

This application is configured for full-stack deployment on **Render** (as a Node.js web service) connected to **Supabase** (PostgreSQL Database & Realtime).

---

## 1. Supabase Setup (Database & Authentication)

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a free project.
2. Note down your project database credentials from **Project Settings -> API**:
   - `Project URL` (e.g. `https://xyzcompany.supabase.co`)
   - `anon public key` (e.g. `eyJhbGci...`)

### Step 2: Initialize Database Schema
1. In the Supabase Dashboard, open the **SQL Editor** tab from the left navigation.
2. Open the file `src/db/supabase-schema.sql` in this repo.
3. Paste the SQL contents into the editor and click **Run**.
4. This creates all necessary tables (`profiles`, `quiz_attempts`, `doubt_queries`, `study_room_messages`) with indexes and Row Level Security (RLS) policies.

---

## 2. Render Deployment (1-Click or Manual)

### Step 1: Push Repository to GitHub / GitLab
Make sure your latest code is pushed to your Git repository.

### Step 2: Create a Web Service on Render
1. Go to [https://dashboard.render.com](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Select your repository.
4. Configure the settings:
   - **Name**: `learn-with-zakir`
   - **Environment**: `Node`
   - **Region**: Select closest to your users (e.g., `Singapore` or `Oregon`)
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`

### Step 3: Add Environment Variables in Render Dashboard
Under the **Environment** section of your Render Web Service, add:

| Key | Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables Express static serving |
| `PORT` | `3000` | Port for Express & WebSockets |
| `CORS_ORIGIN` | `*` | Or specify your domain (e.g. `https://yourdomain.com`) |
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Your Supabase Anon Public Key |

5. Click **Create Web Service**. Render will automatically build the client with Vite and launch the Node.js Express server on port 3000.

---

## 3. Architecture Overview

```text
┌────────────────────────────────────────────────────────┐
│                   Render Web Service                   │
│                                                        │
│  ┌─────────────────────────┐  ┌─────────────────────┐  │
│  │   React Client (Vite)   │  │   Express Server    │  │
│  │   - Curriculum UI       │  │   - WebSocket Gateway│  │
│  │   - PDF Annotations     │  │   - Health Check    │  │
│  │   - Exam Timers         │  │   - CORS Middleware │  │
│  └────────────┬────────────┘  └──────────┬──────────┘  │
└───────────────┼──────────────────────────┼─────────────┘
                │                          │
                ▼                          ▼
      ┌──────────────────┐       ┌──────────────────┐
      │  Supabase Cloud  │       │  Render Clients  │
      │  - PostgreSQL    │       │  - Live Rooms WS │
      │  - Quiz Attempts │       │  - Realtime Chat │
      │  - Profiles/RLS  │       └──────────────────┘
      └──────────────────┘
```

---

## 4. Local Development Verification

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Start dev server (Vite + Express on Port 3000)
npm run dev

# 3. Test production build locally
npm run build
npm start
```
