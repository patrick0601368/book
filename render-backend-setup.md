# Render Backend Setup Guide

## 1. Create Backend API on Render

### Step 1: Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Choose the same repository (`book`)

### Step 2: Configure Build Settings
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Node Version:** 18.x

### Step 3: Environment Variables
Add these environment variables in Render:
```
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_URL=https://your-render-app.onrender.com
NEXTAUTH_SECRET=your_secret_key
OPENAI_API_KEY=your_openai_key
MISTRAL_API_KEY=your_mistral_key
```

## 2. Update Next.js App for Render Backend

### Step 1: Create API Routes for Render
Create `src/app/api/render/` directory with endpoints that call your Render backend.

### Step 2: Update Environment Variables
In Vercel, add:
```
RENDER_API_URL=https://your-render-app.onrender.com
```

### Step 3: Update API Calls
Modify your API calls to use the Render backend instead of local API routes.

## 3. Benefits of Render Backend
- ✅ **Persistent connections** (no cold starts)
- ✅ **Better MongoDB performance**
- ✅ **Dedicated resources**
- ✅ **Image storage ready**
- ✅ **No IP whitelist issues**

## 4. Quick Setup Commands
```bash
# Create render backend
npm init -y
npm install express mongoose cors dotenv
npm install bcryptjs jsonwebtoken
```

Would you like me to implement the Render backend solution?
