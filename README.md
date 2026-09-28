# AeroVision

AeroVision is an edge AI mobility and road intelligence platform.

This repository contains the **Windows laptop platform**:

- FastAPI backend
- PostgreSQL database
- Alembic migrations
- React + TypeScript frontend
- Authentication
- Device management
- Camera/device runtime telemetry
- Detection storage
- Map Intelligence
- Intelligence Mode management

The Raspberry Pi edge agent is maintained separately.

---

# 1. Project Structure

```text
aerovision/
│
├── backend/
│   ├── app/
│   ├── migrations/
│   ├── alembic.ini
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── package-lock.json
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

# 2. Requirements

Install the following on Windows:

- Git
- Python 3.10+
- Node.js 18+
- npm
- Docker Desktop

Verify:

```powershell
git --version
python --version
node --version
npm --version
docker --version
docker compose version
```

---

# 3. Clone the Repository

```powershell
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd aerovision
```

---

# 4. PostgreSQL with Docker

AeroVision uses PostgreSQL through Docker.

From the project root:

```powershell
docker compose up -d
```

Check the containers:

```powershell
docker compose ps
```

PostgreSQL should be running before starting the backend.

To stop the database:

```powershell
docker compose down
```

To stop containers without removing the database volume:

```powershell
docker compose stop
```

---

# 5. Backend Setup

Open PowerShell:

```powershell
cd backend
```

Create a Python virtual environment:

```powershell
python -m venv .venv
```

Activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Then activate again:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

---

# 6. Backend Environment Variables

Create:

```text
backend/.env
```

Do not commit this file to GitHub.

Example:

```env
DATABASE_URL=postgresql://<DB_USER>:<DB_PASSWORD>@localhost:5432/<DB_NAME>

SECRET_KEY=<GENERATE_A_LONG_RANDOM_SECRET>

ACCESS_TOKEN_EXPIRE_MINUTES=60

APP_NAME=AeroVision
APP_VERSION=1.0.0
```

Use the PostgreSQL credentials/database configured in `docker-compose.yml`.

Never commit real passwords, JWT secrets, API keys, or device tokens.

---

# 7. Run Database Migrations

From:

```text
aerovision/backend
```

with the virtual environment activated:

```powershell
alembic upgrade head
```

Check the current migration:

```powershell
alembic current
```

To see migration history:

```powershell
alembic history
```

---

# 8. Create an Admin User

AeroVision does not have public registration.

An administrator is created from the backend.

Run:

```powershell
python -m app.db.seed_admin
```

If your project uses the seed script directly instead:

```powershell
python app/db/seed_admin.py
```

The command should create the initial administrator if one does not already exist.

Use the credentials configured by the seed script.

Do not commit the real production password to GitHub.

---

# 9. Creating Another User

Users should be created through the AeroVision administration interface/API rather than public registration.

After logging in as an administrator, use:

```text
Administration
└── User Management
```

The application is intentionally admin-controlled.

---

# 10. Start the Backend

From:

```text
aerovision/backend
```

with `.venv` activated:

```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8765 --reload
```

The backend will be available locally at:

```text
http://127.0.0.1:8765
```

API health check:

```text
http://127.0.0.1:8765/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "database": "connected"
}
```

API documentation:

```text
http://127.0.0.1:8765/docs
```

---

# 11. Laptop IP Configuration

The Raspberry Pi connects to the laptop backend using the laptop's LAN IP.

The backend listens on:

```text
0.0.0.0:8765
```

The current development network uses:

```text
Laptop:
192.168.0.17

Raspberry Pi:
192.168.0.3

Backend:
http://192.168.0.17:8765

Camera:
http://192.168.0.3:5001/stream
```

These addresses are specific to the current local network.

They may change when using another Wi-Fi network.

---

# 12. Find the Laptop IP

If the laptop IP changes, run:

```powershell
ipconfig
```

Find the active Wi-Fi adapter:

```text
IPv4 Address
```

For example:

```text
192.168.0.17
```

If the laptop receives:

```text
192.168.1.25
```

then the Raspberry Pi backend URL must be changed to:

```text
http://192.168.1.25:8765
```

Do not assume the laptop IP is permanent.

---

# 13. Frontend Setup

Open another PowerShell window.

From the project root:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

---

# 14. Frontend Environment

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_BASE_URL=http://127.0.0.1:8765
VITE_CAMERA_STREAM_URL=http://192.168.0.3:5001/stream
```

If the Raspberry Pi IP changes, update:

```env
VITE_CAMERA_STREAM_URL=http://<PI_IP>:5001/stream
```

Example:

```env
VITE_CAMERA_STREAM_URL=http://192.168.1.30:5001/stream
```

The frontend API can remain:

```env
VITE_API_BASE_URL=http://127.0.0.1:8765
```

when the browser is running on the same laptop as the backend.

---

# 15. Start the Frontend

From:

```text
aerovision/frontend
```

run:

```powershell
npm run dev
```

The Vite development server normally runs at:

```text
http://127.0.0.1:5173
```

Open it in the browser.

---

# 16. Full Development Startup

Every time the project is started, use:

### Terminal 1: Database

From the project root:

```powershell
docker compose up -d
```

### Terminal 2: Backend

```powershell
cd C:\Users\Aditya\Downloads\aerovision\backend
.\.venv\Scripts\Activate.ps1
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8765 --reload
```

### Terminal 3: Frontend

```powershell
cd C:\Users\Aditya\Downloads\aerovision\frontend
npm run dev
```

---

# 17. Verify Everything

### Database

```powershell
docker compose ps
```

### Backend

Open:

```text
http://127.0.0.1:8765/api/health
```

Expected:

```json
{
  "status": "healthy",
  "database": "connected"
}
```

### API documentation

```text
http://127.0.0.1:8765/docs
```

### Frontend

```text
http://127.0.0.1:5173
```

### Login

Use the administrator account created during setup.

---

# 18. LAN Connectivity

If the Raspberry Pi needs to communicate with the laptop, verify the laptop backend is listening on all interfaces:

```powershell
netstat -ano | findstr :8765
```

Expected:

```text
0.0.0.0:8765
```

From the Raspberry Pi:

```bash
curl http://<LAPTOP_IP>:8765/api/health
```

Example:

```bash
curl http://192.168.0.17:8765/api/health
```

Expected:

```json
{
  "status": "healthy",
  "database": "connected"
}
```

---

# 19. Windows Firewall

If the Raspberry Pi cannot reach the backend, make sure TCP port `8765` is allowed on the Windows private network.

A specific firewall rule can be created with an elevated PowerShell:

```powershell
New-NetFirewallRule `
  -DisplayName "AeroVision Backend 8765" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 8765 `
  -Action Allow `
  -Profile Private
```

Check:

```powershell
Get-NetFirewallRule -DisplayName "AeroVision Backend 8765"
```

Do not disable the Windows firewall globally.

---

# 20. Useful Backend Commands

Activate the environment:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
```

Run migrations:

```powershell
alembic upgrade head
```

Check migration:

```powershell
alembic current
```

Start backend:

```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8765 --reload
```

---

# 21. Useful Frontend Commands

Install dependencies:

```powershell
cd frontend
npm install
```

Development server:

```powershell
npm run dev
```

Production build:

```powershell
npm run build
```

Preview production build:

```powershell
npm run preview
```

---

# 22. Security

Never commit:

```text
.env
backend/.env
frontend/.env
.venv/
node_modules/
database files
API keys
JWT secrets
device tokens
private keys
passwords
```

Use:

```text
.env.example
```

files for documenting required environment variables.

Example:

```env
DATABASE_URL=
SECRET_KEY=
ACCESS_TOKEN_EXPIRE_MINUTES=60
APP_NAME=AeroVision
APP_VERSION=1.0.0
```

---

# 23. Current Architecture

```text
                 Windows Laptop
        ┌──────────────────────────────┐
        │                              │
        │  React Frontend :5173        │
        │          │                   │
        │          ▼                   │
        │  FastAPI Backend :8765       │
        │          │                   │
        │          ▼                   │
        │  PostgreSQL                  │
        │      Docker                  │
        │                              │
        └──────────────┬───────────────┘
                       │
                    LAN/Wi-Fi
                       │
                       ▼
              Raspberry Pi Edge
```

The Raspberry Pi runs the camera, Coral AI inference and edge agent separately from this laptop repository.

---

# 24. Development Notes

The laptop platform currently provides:

- FastAPI backend
- PostgreSQL
- Alembic
- Admin authentication
- Device authentication
- Device management
- Camera runtime telemetry
- Coral presence telemetry
- Pixhawk presence/telemetry support
- Detection storage
- Intelligence Mode management
- Traffic Intelligence pages
- Crowd & Mobility pages
- Road Intelligence pages
- Mobility Safety pages
- Missions
- Map Intelligence
- Reports
- Administration

GPS coordinates are only available when the connected Pixhawk/GPS hardware provides actual GPS telemetry.

The current Pixhawk setup may operate without GPS.

---

# 25. License

Add the project's license here before publishing the repository.
