# 🤖 Agent Dashboard

A private dashboard to monitor and run your MakerWorks agents (Photo Sync & Blog Generator).

---

## Table of Contents

| Section | Description |
|---------|-------------|
| [Features](#features) | What the dashboard can do |
| [Prerequisites](#prerequisites) | What you need before starting |
| [Setup](#setup) | Step-by-step installation guide |
| [Token Setup](#token-setup) | How to get GitHub token |
| [Running Locally](#running-locally) | Run on your computer |
| [Deploying to GitHub Pages](#deploying-to-github-pages) | Host it privately online |
| [How to Use](#how-to-use) | Using the dashboard |
| [Troubleshooting](#troubleshooting) | Common issues and fixes |

---

## Features

| Feature | Description |
|---------|-------------|
| 📊 **Agent Status** | See if agents are running, success, or failed |
| ⏱️ **Last Run Time** | Shows when each agent last ran |
| ▶️ **Run Button** | One-click to trigger any agent manually |
| ❌ **Error Display** | See error messages when agents fail |
| 📜 **Run History** | View recent runs for both agents |
| 🔄 **Auto Refresh** | Automatically updates every 30 seconds |
| 🌙 **Dark Mode** | Beautiful dark theme (default) |
| ☀️ **Light Mode** | Toggle to light theme |
| 📱 **Mobile Friendly** | Works on phone and desktop |

---

## Prerequisites

Before setting up, you'll need:

| Requirement | Why |
|-------------|-----|
| GitHub Account | To access your repos |
| GitHub Personal Access Token | For API access |
| Web Browser | Chrome, Firefox, Safari, or Edge |

---

## Setup

### Step 1: Get Your GitHub Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Give it a name (e.g., "Agent Dashboard")
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
5. Click **"Generate token"**
6. **Copy the token** — You'll need it later

> ⚠️ **Important:** Copy and save your token somewhere safe. You won't see it again!

---

### Step 2: Configure the Token

Open `config-token.js` in a text editor:

```javascript
const GITHUB_TOKEN_CONFIG = 'YOUR_TOKEN_HERE';
```

Replace `'YOUR_TOKEN_HERE'` with your actual token.

---

### Step 3: Run Locally

#### Option A: Using VS Code (Recommended)

1. Open the `dashboard` folder in VS Code
2. Install "Live Server" extension
3. Right-click `index.html` → "Open with Live Server"

#### Option B: Using Python

```bash
cd dashboard
python -m http.server 3000
```

Then open: http://localhost:3000

#### Option C: Using Double-Click

Simply double-click `index.html` to open in your browser.

---

## How to Use

### Main Dashboard View

```
┌─────────────────────────────────────────────────────────────┐
│  🤖 Agent Dashboard           [Refresh] [🌙]               │
│  Last updated: 10:30 AM                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 📷 Photo Sync Agent                                   │  │
│  │ Status: ✅ Success    Last Run: 2 hours ago          │  │
│  │ Duration: 45s                                        │  │
│  │                                                       │  │
│  │ [▶ Run Now] [📜 View Logs]                           │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 📝 Blog Generator Agent                              │  │
│  │ Status: ❌ Failed      Last Run: 30 mins ago         │  │
│  │                                                       │  │
│  │ Error: API key not found                             │  │
│  │                                                       │  │
│  │ [▶ Run Now] [📜 View Logs]                           │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### What Each Button Does

| Button | Action |
|--------|--------|
| **Refresh** | Updates all agent statuses |
| **Run Now** | Triggers the agent to run immediately |
| **View Logs** | Opens GitHub Actions logs in new tab |
| **Dark/Light** | Toggles between dark and light theme |

---

## Deploying to GitHub Pages (Private)

If you want to access the dashboard from your phone:

### Step 1: Create a Private Repo

1. Go to GitHub → New Repository
2. Name: `agent-dashboard`
3. Select: **Private**
4. Click "Create repository"

### Step 2: Push the Files

```bash
cd dashboard
git init
git add .
git commit -m "Add agent dashboard"
git remote add origin https://github.com/YOUR_USERNAME/agent-dashboard.git
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repo → Settings → Pages
2. Source: "Deploy from a branch"
3. Branch: "main" → "/ (root)"
4. Click Save

### Step 4: Add Yourself as Collaborator

1. Settings → Collaborators → Add people
2. Add your own GitHub username
3. Accept the invitation

Now you can access it at: `https://your-username.github.io/agent-dashboard`

> ⚠️ **Security Note:** Only collaborators can access this URL.

---

## File Structure

```
dashboard/
├── index.html          # Main dashboard page
├── style.css          # Styling (dark/light theme)
├── app.js             # Logic and GitHub API
├── config.js          # Configuration (workflow IDs)
├── config-token.js    # Your GitHub token (DO NOT COMMIT!)
├── README.md          # This file
```

---

## Troubleshooting

### Error: "GitHub token not configured"

| Cause | Solution |
|-------|----------|
| Token not set | Edit `config-token.js` and add your token |
| Invalid token | Regenerate your token at github.com/settings/tokens |

### Error: "Failed to fetch"

| Cause | Solution |
|-------|----------|
| No internet | Check your internet connection |
| Token expired | Generate a new token |
| Wrong repo | Check `CONFIG.GITHUB_OWNER` and `GITHUB_REPO` in `config.js` |

### Status shows "Loading..." forever

| Cause | Solution |
|-------|----------|
| Token not loaded | Refresh the page and enter token |
| CORS issue | Run locally, not from file:// |

---

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Browser                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Dashboard (index.html)                             │   │
│  │  ├── Fetches data from GitHub API                   │   │
│  │  ├── Shows agent status                              │   │
│  │  └── Sends commands (run workflow)                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    GitHub REST API                          │
│                                                               │
│  GET  /repos/{owner}/{repo}/actions/runs                    │
│  POST /repos/{owner}/{repo}/actions/workflows/{id}/dispatches│
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

| Step | What Happens |
|------|--------------|
| 1 | Dashboard loads → Asks GitHub API for run status |
| 2 | GitHub returns → Latest run for each workflow |
| 3 | Dashboard displays → Status, last run time, errors |
| 4 | User clicks "Run Now" → Sends POST to GitHub API |
| 5 | GitHub triggers → Workflow starts running |
| 6 | Auto-refresh → Updates status every 30 seconds |

---

## Security Notes

| Do | Don't |
|----|-------|
| ✅ Keep token private | ❌ Don't commit `config-token.js` to GitHub |
| ✅ Use local storage option | ❌ Don't share the dashboard URL publicly |
| ✅ Use private repo | ❌ Don't add people you don't trust |

---

## Support

If you have issues:

1. Check the browser console (F12 → Console)
2. Verify your token has `repo` scope
3. Make sure you have access to the repo
4. Try running locally first

---

## Credits

Built for MakerWorks Lab - https://makerworkslab.in
