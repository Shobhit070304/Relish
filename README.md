# Relish — Dish Dashboard

A dish management dashboard for browsing dishes, editing local drafts, and safely saving changes with Optimistic Concurrency Control (OCC) and real-time WebSocket synchronization.

The landing page is at `/` and the dashboard is at `/dishes`.

---

## Prerequisites

- **Node.js** 18 or newer
- **MongoDB** running locally at `mongodb://127.0.0.1:27017` (or remote URI)

---

## Quick Setup & Run

### 1. Backend

In a terminal:

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run seed
npm run dev
```

* API runs on `http://localhost:4000`.
* `npm run seed` idempotently loads the assignment dataset into MongoDB with `version: 1`. Rerunning it leaves existing edits unchanged.

### 2. Frontend

In a second terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

* Frontend runs on `http://localhost:5173`.
* It connects to `http://localhost:4000` by default (configurable in `frontend/.env`).

---

## Environment Variables

### Backend (`backend/.env.example`)
```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/relish
```

### Frontend (`frontend/.env.example`)
```env
VITE_API_URL=http://localhost:4000
```

---

## Architecture & Project Structure

The project separates concerns cleanly:
- **Backend**: Express + Mongoose + `ws` following a strict `Route → Controller → Service → Repository → Model` layered architecture.
- **Frontend**: React 18 + Vite with custom hooks, CSS design tokens, and WebSocket listener.

```text
Relish/
├── backend/
│   ├── data/dishes.json           # Seed data
│   └── src/
│       ├── config/                # Database & WebSocket setup
│       ├── controllers/           # HTTP handlers
│       ├── middleware/            # Global error & 404 handlers
│       ├── models/                # Mongoose Dish schema
│       ├── repositories/          # Atomic MongoDB queries
│       ├── routes/                # Express routes
│       ├── services/              # Business rules & OCC logic
│       ├── utils/                 # Validation & AppError
│       ├── app.js                 # Express app
│       ├── server.js              # Server entry point
│       └── seed.js                # Idempotent database seeder
└── frontend/
    └── src/
        ├── components/            # Dish cards, header, footer
        ├── hooks/                 # useDishes hook with WebSocket sync
        ├── pages/                 # HomePage and DishListingPage
        ├── services/              # API fetch requests
        ├── App.jsx                # Layout & theme router
        └── styles.css             # Responsive styling & themes
```

---

## API Reference

### `GET /dishes`
Returns all dishes with their `dishId`, `dishName`, `imageUrl`, `isPublished`, and `version`.

```bash
curl http://localhost:4000/dishes
```

### `PATCH /dishes/:dishId`
Atomically updates `dishName` and explicit `isPublished` only if `expectedVersion` matches:

```bash
curl -X PATCH http://localhost:4000/dishes/1 \
  -H "Content-Type: application/json" \
  -d '{"dishName":"Jeera Rice Special","isPublished":true,"expectedVersion":1}'
```

* **`200 OK`**: Returns updated dish with incremented version.
* **`400 Bad Request`**: Invalid field types, empty name when published, or invalid image URL.
* **`404 Not Found`**: Unknown `dishId`.
* **`409 Conflict`**: Version mismatch (dish was updated by another request). Returns `{ error, currentDish }`.

---

## Drafts & Conflict Handling

- **Local Drafts**: Edits remain local until **Save changes** is clicked. The badge displays `● Unsaved changes`.
- **Discard**: Clicking **Discard** reverts fields to the last loaded server state.
- **Atomic Concurrency Control (OCC)**: On save, the client sends `expectedVersion`. The backend atomically verifies the version in MongoDB before applying changes and incrementing `version`.
- **Conflict (409)**: If another tab or user saves first, the server returns 409. The draft is preserved, an explanation is shown, and a **Reload latest** action is offered with a discard warning confirmation.

---

## Real-Time Synchronization (Optional Bonus)

Real-time synchronization is implemented via WebSockets (`ws`):

- **Update Delay**: Updates are pushed immediately (<50ms) across connected clients upon MongoDB commit.
- **Draft Preservation**: If an external update arrives for a dish that the user is actively editing (`dirty === true`), the user's draft is **never overwritten**. A banner appears: *"Newer saved data is available (vX)"* with a **Load latest** button. If the dish has no unsaved changes (`dirty === false`), it updates smoothly in real time.
- **Cleanup**: The frontend hook closes the WebSocket and clears reconnect timers on unmount. The backend runs a 30-second ping/pong heartbeat to terminate inactive connections.
- **Disconnection Handling**: If the connection drops or the backend restarts, the client automatically retries connecting every 3 seconds.

---

## Verification & Testing Steps

1. **Database & Seed**: Open `http://localhost:4000/dishes` to see the 5 seeded dishes with `version: 1`. Run `npm run seed` again and verify no duplicates are created.
2. **Draft & Discard**: On `http://localhost:5173/dishes`, edit any dish name. Notice `● Unsaved changes`. Click **Discard** to revert.
3. **Save Persistence**: Edit a dish name, click **Save changes**, and verify the version increments. Restart the backend and refresh the page to confirm changes persisted.
4. **Validation (400)**: Clear the name of a published dish and click Save. Notice the error banner: *"A published dish must have a name."*
5. **Conflict (409)**: Open the dashboard in two tabs. Save a change in Tab A. In Tab B, try to save an older draft. Notice Tab B preserves your draft and shows the 409 conflict message.
6. **Real-time Sync**: Open the dashboard. In Postman, send a `PATCH` request to update Dish 1. Observe Dish 1 updating on screen instantly without page refresh.

---

## Design Decision

The API uses **Optimistic Concurrency Control (OCC)** via an atomic `findOneAndUpdate({ dishId, version: expectedVersion }, { $set: ..., $inc: { version: 1 } })`. This avoids pessimistic database locks, keeps requests stateless and performant, and guarantees zero race conditions under concurrent writes.

---

## Known Limitations & Disclosure

- **Scope boundaries**: Local development setup; authentication, image upload, and dish deletion are out of scope as per requirements.
- **AI Disclosure**: AI pairing assistance was used during implementation and documentation.
- **Time Spent**: Approximately 1.5 hours (including full core requirements, WebSocket real-time bonus, and testing).
