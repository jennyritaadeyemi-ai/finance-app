# 🌊 Flōw Finance — Full-Stack Mobile App

A complete personal finance application with a Node.js REST API backend and React Native (Expo) mobile app that runs natively on **iOS and Android**.

---

## 🏗️ Architecture

```
flow-app/
├── backend/               # Node.js + Express + SQLite REST API
│   ├── src/
│   │   ├── server.js      # Entry point, middleware, route registration
│   │   ├── db/
│   │   │   ├── schema.js  # SQLite schema (8 tables) + getDb()
│   │   │   └── seed.js    # Demo data seeder
│   │   ├── middleware/
│   │   │   └── auth.js    # JWT + API Key auth middleware
│   │   └── routes/
│   │       ├── auth.js         # Register, Login, Profile
│   │       ├── transactions.js # Full CRUD + monthly summary
│   │       ├── accounts.js     # Bank accounts CRUD
│   │       ├── budgets.js      # Budgets + live spending progress
│   │       ├── bills.js        # Recurring bills + predictions
│   │       ├── insights.js     # AI-powered financial insights
│   │       └── apikeys.js      # API key + webhook management
│   └── Dockerfile
│
├── mobile/                # React Native (Expo) iOS + Android app
│   ├── app/
│   │   ├── _layout.tsx         # Root navigator, session restore
│   │   ├── index.tsx           # Auth redirect
│   │   ├── auth.tsx            # Login / Register screen
│   │   ├── (tabs)/
│   │   │   ├── index.tsx       # 🏠 Home dashboard
│   │   │   ├── transactions.tsx# 📋 Transaction list + search
│   │   │   ├── budget.tsx      # 🎯 Budget tracker
│   │   │   ├── bills.tsx       # 📅 Bill predictions
│   │   │   ├── insights.tsx    # ✨ AI insights + trends
│   │   │   └── settings.tsx    # ⚙️ Profile + integrations
│   │   ├── transaction/
│   │   │   ├── new.tsx         # Add transaction modal
│   │   │   └── [id].tsx        # Transaction detail + delete
│   │   └── settings/
│   │       ├── apikeys.tsx     # API key management UI
│   │       └── webhooks.tsx    # Webhook management UI
│   └── src/
│       ├── services/api.ts     # Full API client (Axios)
│       ├── store/index.ts      # Global state (Zustand)
│       ├── components/index.tsx# Reusable UI components
│       └── theme/index.ts      # Design tokens
│
└── docker-compose.yml     # One-command deployment
```

---

## 🚀 Quick Start

### Option A — Docker (Recommended)

```bash
# Clone / unzip the project
cd flow-app

# Start the API (includes DB seeding)
docker-compose up -d

# API is live at http://localhost:3000
curl http://localhost:3000/health
```

### Option B — Manual

```bash
# Backend
cd backend
npm install
node src/db/seed.js     # seed demo data
npm run dev             # starts on :3000

# Mobile (separate terminal)
cd ../mobile
npm install
npx expo start          # scan QR with Expo Go app
```

**Demo credentials:** `demo@flowfinance.app` / `demo1234`

---

## 📱 Running on iOS & Android

### Development (instant, no build needed)
1. Install **Expo Go** from the App Store or Play Store
2. Run `npx expo start` in `/mobile`
3. Scan the QR code

### Production Builds (App Store / Play Store)
```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Build for both platforms
eas build --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## 🔌 REST API Reference

**Base URL:** `http://localhost:3000/api`

### Authentication
Two methods supported:

```bash
# 1. JWT (user sessions)
curl -X POST /api/auth/login \
  -d '{"email":"demo@flowfinance.app","password":"demo1234"}'
# Returns: { token: "eyJ..." }

# Use token:
curl /api/transactions \
  -H "Authorization: Bearer eyJ..."

# 2. API Key (third-party integrations)
curl /api/transactions \
  -H "X-Api-Key: flow_live_xxxxxxxxxxxx"
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login → JWT token |
| GET | `/auth/me` | Current user profile |
| GET | `/transactions` | List (paginated, filterable) |
| POST | `/transactions` | Create transaction |
| GET | `/transactions/:id` | Get single |
| PUT | `/transactions/:id` | Update |
| DELETE | `/transactions/:id` | Delete |
| GET | `/transactions/summary/monthly` | Category breakdown |
| GET | `/accounts` | List accounts |
| POST | `/accounts` | Create account |
| GET | `/budgets` | List with live % spent |
| POST | `/budgets` | Create budget |
| GET | `/bills` | List with days-until-due |
| POST | `/bills` | Add recurring bill |
| GET | `/categories` | All categories |
| POST | `/categories` | Create custom category |
| GET | `/goals` | Savings goals |
| POST | `/goals` | Create goal |
| GET | `/insights` | AI-generated tips |
| GET | `/insights/trends` | 6-month chart data |
| GET | `/integrations/keys` | List API keys |
| POST | `/integrations/keys` | Create API key |
| DELETE | `/integrations/keys/:id` | Revoke key |
| GET | `/integrations/webhooks` | List webhooks |
| POST | `/integrations/webhooks` | Register webhook |
| GET | `/integrations/export?format=csv\|json` | Export data |

### Query Parameters (GET /transactions)
```
?page=1&limit=20
&account_id=uuid
&category_id=uuid
&type=expense|income|transfer
&date_from=2026-01-01
&date_to=2026-12-31
&search=coffee
```

---

## 🔑 API Key Integration

Generate a scoped API key from **Settings → API Keys** in the app, or via the API:

```bash
# Create a read-only key
curl -X POST /api/integrations/keys \
  -H "Authorization: Bearer <jwt>" \
  -d '{"name":"My Zapier App","scopes":"read","expires_days":90}'

# Response (key shown ONCE):
{
  "api_key": "flow_live_a3f9bc12...",
  "scopes": ["read"],
  "warning": "Store this key securely — it will not be shown again."
}
```

**Scopes:**
- `read` — View transactions, budgets, accounts, insights
- `write` — Create and edit transactions, budgets, bills
- `admin` — Full access including key management

---

## 🔗 Webhook Integration

Register an HTTPS endpoint to receive real-time events:

```bash
curl -X POST /api/integrations/webhooks \
  -H "Authorization: Bearer <jwt>" \
  -d '{
    "url": "https://your-app.com/flow-webhook",
    "events": "transaction.created,budget.exceeded,bill.due"
  }'
```

**Available events:**
- `transaction.created` / `transaction.updated` / `transaction.deleted`
- `budget.exceeded`
- `bill.due`
- `goal.reached`

**Verifying signatures:**
```javascript
const crypto = require('crypto');

function verifyWebhook(body, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return signature === expected;
}

app.post('/flow-webhook', (req, res) => {
  const sig = req.headers['x-flow-signature'];
  if (!verifyWebhook(req.rawBody, sig, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  const { event, data } = req.body;
  console.log(`Received: ${event}`, data);
  res.sendStatus(200);
});
```

---

## 🗄️ Database Schema

SQLite with 8 tables:

```
users          → id, email, password, name, currency
accounts       → id, user_id, name, type, balance, currency
categories     → id, user_id, name, icon, color, type
transactions   → id, user_id, account_id, category_id, amount, type, description, date
budgets        → id, user_id, category_id, amount, period, alert_at
bills          → id, user_id, name, amount, due_day, recurrence, auto_pay
api_keys       → id, user_id, name, key_hash, key_prefix, scopes, expires_at
webhooks       → id, user_id, url, events, secret
goals          → id, user_id, name, target, current, deadline
```

---

## 🔒 Security

- Passwords hashed with **bcrypt** (cost factor 10)
- API keys hashed with bcrypt (only prefix stored in plaintext)
- JWT tokens expire in **30 days**
- Webhook payloads signed with **HMAC-SHA256**
- Rate limiting: 200 req/15min general, 20 req/15min on auth routes
- **Helmet.js** security headers
- Foreign key constraints + input validation on all routes

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo (iOS + Android) |
| Navigation | Expo Router (file-based) |
| State | Zustand |
| HTTP Client | Axios + SecureStore |
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| Auth | JWT + bcrypt + API Keys |
| DevOps | Docker + Docker Compose |
