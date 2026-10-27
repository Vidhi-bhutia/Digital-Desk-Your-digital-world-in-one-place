# Digital Desk

Digital Desk is a React/Vite personal workspace backed by an Express API and MongoDB.

## Run locally

1. Install dependencies with `npm install` in both `backend` and `frontend`.
2. Copy `backend/.env.example` to `backend/.env`; set a persistent MongoDB URI and strong random `JWT_SECRET`, `COOKIE_SECRET`, and `ENCRYPTION_KEY` values.
3. Start MongoDB, run `npm run dev` in `backend`, then `npm run dev` in `frontend`. The UI is at `http://localhost:5173` and Vite proxies `/api` to port 5000.

Never commit `.env` files. OAuth and provider secrets belong only in the backend environment.

## Provider configuration

- **GitHub:** Connect using a fine grained personal access token with the needed repository read permissions. The API validates the token with GitHub before storing it encrypted. The optional GitHub OAuth client variables support the existing login flow.
- **GitHub OAuth:** Create a GitHub OAuth App. Set `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `GITHUB_CALLBACK_URL` to `http://localhost:5000/api/integrations/github/callback` (register this exact callback URL in the app). The redirect is state checked and connects to the currently signed-in Digital Desk account.
- **Google Gmail and Calendar:** Create OAuth 2.0 Web credentials in Google Cloud Console, enable Gmail API and Google Calendar API, configure the consent screen, and set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL`. Register `http://localhost:5000/api/integrations/google/callback` as an authorized redirect URI. Gmail read access and Calendar event access are requested.
- **OpenWeather:** Set `OPENWEATHER_API_KEY`. Browser geolocation is requested by the dashboard; alternatively call the weather API with a manually selected `city`.
- **Web search:** Set a server side `TAVILY_API_KEY`. Without it, search returns personal results and reports web search as unavailable.
- **Database:** Set `MONGO_URI` to a persistent MongoDB instance. The server never silently falls back to volatile storage. Tests use an isolated MongoMemoryServer fixture.
- **Desk Radio:** Playback requires a licensed HTTPS audio stream URL configured as a user track. The player will not claim to play when there is no stream.

## API and functionality notes

Authenticated task and app calendar records are stored per user. The activity page includes app task completion and locally created calendar activity. Provider activity and Gmail search/summary require their provider API adapters and account credentials; unavailable services return explicit errors rather than fabricated records.

Run backend tests with `cd backend; npm test` and build the frontend with `cd frontend; npm run build`.
