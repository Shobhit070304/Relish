# Nosh — Dish Dashboard

A small menu management app for browsing dishes, editing local drafts, and safely saving changes to MongoDB. The home page introduces the product and previews dishes from the API; the dashboard is at `/dishes`.

## What it includes

- A responsive product landing page with product details, workflow, and a live menu preview.
- Light and dark themes. The selected theme is remembered in the browser.
- A dish dashboard with search, published/draft filters, and inline editing.
- Local drafts, explicit Save and Discard actions, backend validation, and version conflict protection.
- A MongoDB seed command that can be safely run again without overwriting saved edits.

## Requirements

- Node.js 18 or newer
- Local MongoDB running at `mongodb://127.0.0.1:27017` (or another MongoDB URI)

## Run locally

The supplied assignment data is already in `backend/data/dishes.json`.

### 1. Install backend dependencies and configure MongoDB

In a terminal at the repository root:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Run `Copy-Item` only once. If `.env` already exists, keep it and check that `MONGODB_URI` points to your local MongoDB instance. The default is `mongodb://127.0.0.1:27017/nosh`.

### 2. Seed and start the API

From the `backend` folder:

```powershell
npm run seed
npm run dev
```

The API listens on `http://localhost:4000`. The seed command adds missing dishes with `version: 1`. It leaves existing records unchanged, so rerunning it does not duplicate dishes or reset edits.

### 3. Install and start the frontend

Open a second terminal at the repository root:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open the Vite URL printed in the terminal. The frontend defaults to `http://localhost:4000` for the API; set `VITE_API_URL` in `frontend/.env` if needed.

## Project structure

```text
backend/
  data/dishes.json
  src/
    config/          Environment and MongoDB connection
    controllers/     HTTP request and response handlers
    middleware/      Not-found and error responses
    models/          Mongoose dish model
    repositories/    MongoDB queries and conditional updates
    routes/          Express dish routes
    services/        Dish rules, validation, and save flow
    utils/           Shared errors, async wrapper, and validation helpers
    app.js
    server.js
    seed.js
frontend/
  src/
    components/      Header, footer, and dish cards
    hooks/           Dish loading state
    pages/           Landing page and dish dashboard
    services/        API requests
    App.jsx
    styles.css
.gitignore
README.md
```

## API

### `GET /dishes`

Returns all dishes, including `dishId`, `dishName`, `imageUrl`, `isPublished`, and `version`.

```sh
curl http://localhost:4000/dishes
```

### `PATCH /dishes/:dishId`

Saves the name and explicit published status only if the loaded version is still current:

```sh
curl -X PATCH http://localhost:4000/dishes/2 \
  -H "Content-Type: application/json" \
  -d '{"dishName":"Paneer Tikka","isPublished":true,"expectedVersion":1}'
```

- `400`: invalid field types/version, or a published dish has a blank name or non-HTTP/HTTPS image URL.
- `404`: the dish identifier does not exist.
- `409`: another save advanced the version. The response includes `currentDish`.
- `500`: unexpected server failure.

The version condition and MongoDB update happen in the same `findOneAndUpdate` call. A successful save increments the version. Image URLs are validated by format only; the app does not fetch or check whether an image is reachable.

## Draft and conflict behavior

- Editing a name or status only changes browser state. Save sends the draft and its original version.
- Discard restores the last loaded values. A successful save uses the values and version returned by the API.
- If another tab saves first, a stale save returns `409`. The dashboard keeps the draft and offers **Reload latest**, with a warning before discarding it.
- Failed validation and network requests leave the draft available for correction or retry.
- The landing page and dashboard use the supplied image URLs. A failed image load displays a fallback.

## Real-time synchronization (Optional Bonus)

Real-time synchronization is implemented via WebSockets:

- **Update delay**: Updates are pushed immediately (<50ms) across connected clients as soon as a `PATCH` request commits to MongoDB. There is no polling delay.
- **Draft preservation**: If an external update arrives for a dish that the user is actively editing (`dirty === true`), the user's local draft is strictly preserved and never overwritten in the background. A notification banner appears on the card informing the user that *"Newer saved data is available (vX)"* with a **Load latest** button to accept the incoming change if desired. If the card has no unsaved changes (`dirty === false`), it updates smoothly in real time.
- **Connection and timer cleanup**: The frontend hook explicitly closes the WebSocket connection and clears any active reconnect timer (`clearTimeout`) when the component unmounts. The backend server maintains a 30-second ping/pong heartbeat interval that terminates inactive or dead connections, and clears its interval upon server close.
- **Temporary disconnection handling**: If the WebSocket connection drops or the backend restarts, the frontend automatically retries connection every 3 seconds until restored.

## Manual acceptance checks

Run the API and frontend as described above, then check:

1. **Database data:** open `http://localhost:4000/dishes` and confirm the five supplied dishes appear. Run `npm run seed` a second time and confirm there are still five records.
2. **Draft and discard:** edit a dish. Confirm the unsaved indicator appears and the API response/database has not changed. Choose Discard and confirm the loaded values return.
3. **Save persistence:** save a name or status, refresh the page, restart the backend, and confirm the saved value and incremented version remain.
4. **Blank name validation:** send a PATCH with `isPublished: true` and an empty `dishName`. Expect `400`; GET the dish and confirm its saved values and version are unchanged.
5. **Image URL validation:** add temporary test data in `mongosh`, try to publish it, and remove the test record afterward:

   ```js
   use nosh
   db.dishes.insertOne({ dishId: "validation-test", dishName: "Validation test", imageUrl: "not-a-url", isPublished: false, version: 1 })
   // PATCH /dishes/validation-test with {"dishName":"Validation test","isPublished":true,"expectedVersion":1} should return 400.
   db.dishes.deleteOne({ dishId: "validation-test" })
   ```

6. **Conflict:** open the same dish in two tabs. Save a change in tab A, then try to save tab B's older draft. Tab B should show a conflict and preserve its draft until you explicitly reload or discard it.
7. **Real-time WebSocket sync:** open the dashboard at `http://localhost:5173/dishes`. Send a PATCH request from Postman or another tab.
   - For an unedited dish, verify it updates instantly in real time without refreshing.
   - For a dish where you typed an unsaved draft, verify your draft remains intact and the *"Newer saved data is available"* banner appears with the button to load it.
8. **Network and API errors:** stop the API and try to save; confirm the draft remains and can be retried after restarting the API. PATCH an unknown ID for `404`, and send a wrong field type or missing `expectedVersion` for `400`.
9. **Image fallback and themes:** use a broken image URL in temporary test data to see the fallback. Toggle the theme, refresh, and confirm the selected theme is remembered.

## Design decision

The API uses optimistic version checks rather than locks. Each save only updates a dish when the database version matches the version loaded by the browser; MongoDB applies that condition and the changes atomically. This keeps the conflict behavior reliable without adding a separate locking system.

## Known limitations and disclosure

- Local development setup only; no authentication, dish creation/deletion, image upload, or deployment.
- AI assistance was used during implementation. No third-party project code was copied.
- Approximate implementation time so far: about 45 minutes with AI assistance. Update this after your own review and verification.

