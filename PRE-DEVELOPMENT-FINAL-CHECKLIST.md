# 🚀 Pre-Development Preparation - Final Checklist

**Project:** Research Topic Similarity Detection MVP  
**Tool:** BlackboxAI IDE (Pro Plan)  
**Target:** 10-week implementation  
**Date:** February 8, 2026

---

## ✅ **COMPLETE THIS BEFORE STARTING DEVELOPMENT**

### **Phase 1: Environment Setup** ⏱️ 1-2 hours

#### **Software Installation**
- [ ] Node.js 20.x LTS installed
  - Test: `node --version` (should show v20.x.x)
  - Test: `npm --version` (should show 10.x.x)
- [ ] Python 3.10+ installed
  - Test: `python3 --version` (should show 3.10.x or higher)
- [ ] Git installed
  - Test: `git --version`
- [ ] PostgreSQL 15 installed (optional, for local testing)
  - Test: `psql --version`
- [ ] Code editor (VS Code, Cursor, or BlackboxAI IDE) installed

#### **BlackboxAI IDE Configuration**
- [ ] BlackboxAI IDE installed and activated
- [ ] Pro plan confirmed active
- [ ] Default model set to **Claude 3.5 Sonnet**
- [ ] IDE settings configured (auto-save, formatting, etc.)

---

### **Phase 2: Cloud Service Accounts** ⏱️ 30 minutes

#### **GitHub**
- [ ] Account created (https://github.com)
- [ ] Repository created: `topic-similarity-detection-mvp`
- [ ] Repository set to private (or public if thesis requires)
- [ ] SSH key added to GitHub (or HTTPS credentials ready)
- [ ] Test: `git clone` your empty repository

#### **Neon (Database)**
- [ ] Account created (https://neon.tech)
- [ ] Project created: "topic-similarity-db"
- [ ] Database connection string copied (DATABASE_URL)
- [ ] Format: `postgresql://user:pass@host.neon.tech/db?sslmode=require`
- [ ] Test connection with: `psql <connection-string>` (if PostgreSQL installed locally)

#### **Render (Backend Deployment)**
- [ ] Account created (https://render.com)
- [ ] Email verified
- [ ] Dashboard accessible
- [ ] Payment method added (free tier, but card required for some features)

#### **Vercel (Frontend Deployment)**
- [ ] Account created (https://vercel.com)
- [ ] GitHub account connected to Vercel
- [ ] Dashboard accessible

---

### **Phase 3: Local Project Setup** ⏱️ 15 minutes

#### **Create Project Directory**

```bash
# Create workspace
mkdir -p ~/Development/topic-similarity-mvp
cd ~/Development/topic-similarity-mvp

# Initialize git
git init

# Create folder structure
mkdir -p backend frontend sbert-service docs
```

- [ ] Project directory created
- [ ] Git initialized: `git status` shows "On branch main"

#### **Create Root .gitignore**

```bash
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
venv/
__pycache__/
.pytest_cache/

# Environment
.env
.env.local
.env.*.local

# Build
dist/
build/
*.log
logs/

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# OS
Thumbs.db
EOF
```

- [ ] .gitignore created
- [ ] Test: `git status` should not show node_modules or .env files

#### **Initial Git Commit**

```bash
git add .gitignore
git commit -m "chore: initial commit with gitignore"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/topic-similarity-detection-mvp.git
git push -u origin main
```

- [ ] Initial commit created
- [ ] Remote connected to GitHub
- [ ] Pushed to GitHub: `git push` succeeds

#### **Create First Tag**

```bash
git tag -a v0.1.0 -m "Project initialization"
git push origin v0.1.0
```

- [ ] Tag v0.1.0 created
- [ ] Tag pushed to GitHub
- [ ] Verify on GitHub: Check "Releases" or "Tags" section

---

### **Phase 4: Documentation Preparation** ⏱️ 10 minutes

#### **Download Your Preparation Documents**

You have 4 key documents:
1. ✅ `BLACKBOX-AI-MVP-REQUIREMENTS.md` - Complete implementation guide
2. ✅ `BLACKBOX-PROGRESS-TRACKER.md` - Progress checklist
3. ✅ `BLACKBOX-PROMPT-TEMPLATES.md` - How to prompt BlackboxAI
4. ✅ `BLACKBOX-MODEL-SELECTION-GUIDE.md` - Which AI model to use

- [ ] All 4 documents downloaded
- [ ] Saved in an accessible location
- [ ] Read through MVP Requirements (at least overview section)
- [ ] Bookmarked Prompt Templates for reference

#### **Create Project README**

```bash
cat > README.md << 'EOF'
# Research Topic Similarity Detection System - MVP

**Institution:** UNIOSUN Public Health Department  
**Phase:** MVP Development  
**Timeline:** 10 weeks  
**Status:** 🚧 In Development

## Overview

A tri-algorithm similarity detection system to identify duplicate research topics.

## Tech Stack

- **Backend:** Node.js 20, Express, Prisma, PostgreSQL (Neon)
- **SBERT:** Python 3.10, FastAPI, sentence-transformers
- **Frontend:** React 18, Vite, Tailwind CSS
- **Deployment:** Render (backend/SBERT), Vercel (frontend)

## Development Setup

Coming soon...

## License

MIT (or your choice)
EOF

git add README.md
git commit -m "docs: add initial README"
git push
```

- [ ] README.md created
- [ ] Committed and pushed to GitHub

---

### **Phase 5: Verify BlackboxAI Setup** ⏱️ 5 minutes

#### **Test BlackboxAI IDE**

Open BlackboxAI IDE and test basic functionality:

**Test 1: Code Generation**
- [ ] Prompt: "Create a simple Hello World in Node.js Express"
- [ ] Verify: BlackboxAI generates code
- [ ] Check: Code quality looks reasonable

**Test 2: Model Selection**
- [ ] Verify: Claude 3.5 Sonnet is selected (check dropdown/settings)
- [ ] If not: Switch to Claude 3.5 Sonnet

**Test 3: Chat Context**
- [ ] Start a new chat
- [ ] Prompt: "I'm building a topic similarity detection system with Node.js, Express, and React. Can you help?"
- [ ] Verify: BlackboxAI responds appropriately

---

### **Phase 6: Create Environment Files** ⏱️ 10 minutes

#### **Backend .env Template**

```bash
cd backend

cat > .env.example << 'EOF'
# Server Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:pass@host.neon.tech/database?sslmode=require

# SBERT Python Service
SBERT_SERVICE_URL=http://localhost:8000
SBERT_TIMEOUT_MS=5000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS_PER_IP=100

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/combined.log
EOF

# Create actual .env (you'll fill in values)
cp .env.example .env
```

- [ ] Backend .env.example created
- [ ] Backend .env created (copy of .env.example)
- [ ] **IMPORTANT:** Edit backend/.env and add your actual Neon DATABASE_URL

#### **Frontend .env Template**

```bash
cd ../frontend

cat > .env.example << 'EOF'
# API Configuration
VITE_API_URL=http://localhost:3000/api/v1
EOF

cp .env.example .env
```

- [ ] Frontend .env.example created
- [ ] Frontend .env created

---

### **Phase 7: Reference Documents Ready** ⏱️ 5 minutes

#### **Have These Open in Tabs/Windows**

- [ ] **Tab 1:** BLACKBOX-PROMPT-TEMPLATES.md (for copy-paste prompts)
- [ ] **Tab 2:** BLACKBOX-AI-MVP-REQUIREMENTS.md (for reference)
- [ ] **Tab 3:** Your Obsidian vault (for detailed specs)
- [ ] **Tab 4:** GitHub repository page
- [ ] **Tab 5:** Neon dashboard (for database connection string)

#### **Obsidian Quick Reference**

Key files to reference during development:
- Database schema: `05-Implementation/Backend/Database/Database-Schema-and-Migrations.md`
- Seeding script: `05-Implementation/Backend/Database/Database-Seeding-Script.md`
- API design: `05-Implementation/Backend/API/Main-Similarity-Controller.md`
- Algorithms: `05-Implementation/Backend/Algorithms/` folder
- Frontend components: `04-Design/Components/Component-Library.md`

- [ ] Obsidian vault open
- [ ] Know where to find each reference file

---

## 🎯 **READY TO START?**

### **Final Pre-Development Checklist**

Before starting Week 1 development:

**Environment:**
- [x] Node.js 20.x installed
- [x] Python 3.10+ installed
- [x] Git configured
- [x] BlackboxAI IDE ready with Claude 3.5 Sonnet

**Accounts:**
- [x] GitHub repository created and connected
- [x] Neon database account + connection string
- [x] Render account ready
- [x] Vercel account ready + GitHub connected

**Project:**
- [x] Local project directory created
- [x] Git initialized with v0.1.0 tag
- [x] .gitignore in place
- [x] .env files created (with actual DATABASE_URL)

**Documentation:**
- [x] MVP requirements document read
- [x] Prompt templates accessible
- [x] Model selection guide read
- [x] Obsidian vault references identified

**BlackboxAI:**
- [x] IDE configured and tested
- [x] Claude 3.5 Sonnet selected
- [x] Test prompt successful

---

## 🚀 **YOU'RE READY!**

### **Your First Development Session (Week 1, Day 1)**

**Duration:** 2-3 hours  
**Goal:** Initialize backend with package.json and folder structure

#### **Step 1: Open BlackboxAI IDE**
- Open your project: `~/Development/topic-similarity-mvp`
- Start new chat with Claude 3.5 Sonnet

#### **Step 2: Use Prompt Template #1**
Copy from `BLACKBOX-PROMPT-TEMPLATES.md`:
- Prompt 1: "Initialize Backend"
- Paste into BlackboxAI
- Review generated package.json
- Save to `backend/package.json`

#### **Step 3: Install Dependencies**
```bash
cd backend
npm install
```

#### **Step 4: Commit**
```bash
git add backend/
git commit -m "chore(backend): initialize Node.js project with dependencies"
git push
```

#### **Step 5: Continue with Prompts**
- Prompt 2: Environment Configuration
- Prompt 3: Text Preprocessing
- etc.

---

## 📋 **Troubleshooting**

### **Issue: Can't connect to Neon database**

**Solution:**
1. Check DATABASE_URL format in .env
2. Verify Neon project is active
3. Test with: `psql <connection-string>`
4. Check if IP whitelisting needed

### **Issue: BlackboxAI generates incorrect code**

**Solution:**
1. Provide more context in prompt
2. Reference specific files: "Using the preprocessing.js file..."
3. Try rephrasing the prompt
4. If still wrong after 2-3 attempts, try GPT-4

### **Issue: Git push fails**

**Solution:**
1. Check GitHub credentials: `git config --list`
2. Verify remote: `git remote -v`
3. Try HTTPS instead of SSH (or vice versa)
4. Check GitHub token permissions

---

## 🎓 **Tips for Success**

1. **Start Small:** One feature at a time
2. **Test Frequently:** After each feature, test it works
3. **Commit Often:** After each working feature
4. **Use Semantic Commits:** feat:, fix:, chore:, docs:
5. **Read AI Code:** Don't blindly trust, review everything
6. **Ask for Tests:** "Create unit tests for this function"
7. **Reference Obsidian:** When stuck, check your documentation
8. **Take Breaks:** 10-week marathon, not a sprint

---

## ✅ **STATUS CHECK**

Mark when complete:

- [ ] **All Prerequisites Complete** - Ready to code
- [ ] **Week 1 Day 1 Complete** - Backend package.json + dependencies
- [ ] **Week 1 Day 2 Complete** - Environment config + preprocessing
- [ ] **Week 1 Day 3 Complete** - Prisma schema + SBERT service
- [ ] **Week 1 Complete** - v0.3.0 tag created

---

**Good luck with your MVP development!** 🚀

Remember: You have 10 weeks, comprehensive documentation, and powerful AI assistance. Take it one step at a time, and you'll have a working MVP ready for your thesis defense!
