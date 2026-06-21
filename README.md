# AI Travel Planner

An AI-powered, multi-user trip planning web application. Users describe their trip (destination, duration, budget, interests) and an LLM agent generates a structured day-by-day itinerary, estimated budget, and a smart packing checklist. Itineraries are fully editable.

## Live Links
- **Frontend (live app):** https://ai-travel-planner-seven-iota.vercel.app
- **Backend API:** https://ai-travel-planner-nbkr.onrender.com
- **GitHub Repo:** https://github.com/Usha348/ai-travel-planner

> Note: Backend is hosted on Render's free tier, which spins down after inactivity. The first request after idle time may take ~50 seconds to respond.

## Tech Stack
- **Frontend:** Next.js (App Router) + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (Mongoose)
- **AI:** Groq API (Llama 3.3 70B) — chosen after hitting free-tier quota limitations with Gemini; Groq offers a reliable, genuinely free tier suitable for this assignment's scope.
- **Auth:** JWT + bcrypt password hashing

## Setup Instructions

### Local Development

**Backend:**
cd backend

npm install
create a .env file with:
PORT=5000
MONGO_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<any secret string>
GROQ_API_KEY=<your Groq API key>
npm run dev

**Frontend:**
cd frontend

npm install
create a .env.local file with:
NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev
Visit `http://localhost:3000`.

### Deployed Setup
- Backend deployed on **Render** (Web Service, root directory `backend`, build: `npm install`, start: `npm start`), with environment variables set in Render's dashboard.
- Frontend deployed on **Vercel** (root directory `frontend`), with `NEXT_PUBLIC_API_URL` set to the live backend URL as an environment variable.

## Architecture
React (Next.js) Frontend

│  fetch() with JWT in Authorization header

▼

Express Backend (Node.js)

├── Auth routes (register/login)

├── Trip routes (CRUD, protected)

└── AI service (Groq)

▼

MongoDB Atlas (Users, Trips)

The app follows a separation-of-concerns structure: the frontend only handles UI/state, the backend handles business logic and data access, and a dedicated `aiService.js` isolates all LLM prompt logic from route/controller code — making it easy to swap AI providers (we did this once already, from Gemini to Groq, without touching any controller code).

## Authentication & Authorization

- **Authentication:** Users register with name/email/password. Passwords are hashed with bcrypt before storage (never stored in plain text). On login, a JWT is issued (7-day expiry) containing the user's ID.
- **Authorization:** A middleware (`authMiddleware.js`) validates the JWT on every protected route, attaching the authenticated user's ID to the request (`req.userId`). Every trip-related database query filters by this ID (e.g. `Trip.findOne({ _id: req.params.id, user: req.userId })`), ensuring users can only access or modify their own trips — strict data isolation, even if a user guesses another user's trip ID.

## AI Agent Design

The AI agent (`aiService.js`) has three responsibilities, each isolated into its own function:
1. **`generateItinerary`** — given destination, days, budget type, and interests, produces a structured day-by-day itinerary plus a budget breakdown.
2. **`regenerateDay`** — regenerates a single day based on a free-text user preference (e.g. "more outdoor activities"), without touching the rest of the itinerary.
3. **`generatePackingList`** — the custom feature (see below).

**Design choice:** Every AI call explicitly instructs the model to return *only* valid JSON in a fixed schema. This is critical because the output needs to be stored in MongoDB and rendered as structured, editable UI — not just displayed as raw text. Responses are defensively cleaned (stripping markdown code fences) before parsing, since LLMs occasionally wrap JSON in ```json blocks despite instructions.

## Custom Feature: AI-Powered Packing Checklist

**What it does:** Generates a categorized packing list (Clothing, Electronics, Documents, Activity-Specific) tailored to the *actual* itinerary — not generic advice. The AI is given the trip's destination, duration, interests, and the full list of planned activities, so it can make specific suggestions (e.g. suggesting "snorkeling gear" because the itinerary includes a snorkeling activity).

**Why I built this:** Every JD requirement is itinerary-and-budget focused, but a major real pain point in trip planning is *logistics* — figuring out what to actually pack. This feature extends the same AI infrastructure already built for itinerary generation, reusing the JSON-output pattern, to solve a genuinely useful adjacent problem with minimal added complexity. It demonstrates that the AI integration isn't just a single hardcoded call, but a reusable pattern that can be applied to multiple trip-planning sub-problems.

## Key Design Decisions & Trade-offs

- **Flexible schema for itinerary/budget fields** (`Array`/`Object` types in Mongoose instead of strict sub-schemas): given the AI generates varying structures, a flexible schema avoided fighting strict validation during rapid development. Trade-off: less validation safety; in a longer-timeline project I'd define explicit sub-schemas.
- **JSON-only AI prompting:** chosen specifically so AI output is directly usable as structured, editable application state rather than free text needing further parsing/NLP.
- **Frontend-only role for `localStorage`:** JWT stored in `localStorage` for simplicity; in a production app, httpOnly cookies would be more secure against XSS.
- **Switched AI providers twice during development** (OpenAI → Gemini → Groq) due to free-tier quota constraints. This is documented here transparently as a real engineering trade-off made under time/cost constraints, not a design flaw.

## Known Limitations

- Hotel suggestions (bonus feature) not implemented due to time constraints; itinerary generation, budget estimation, and the custom packing-list feature were prioritized as mandatory requirements.
- Backend free-tier hosting (Render) causes a cold-start delay (~50s) after inactivity.
- No automated test suite — all endpoints were manually tested via Postman during development.
- "Add activity" uses a simple browser prompt rather than a custom modal, prioritizing functional correctness within the assignment timeline.