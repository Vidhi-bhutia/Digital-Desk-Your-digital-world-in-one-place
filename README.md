# Digital Desk

Digital Desk is a React/Vite personal workspace backed by an Express API and MongoDB.

## Run locally

1. Install dependencies with `npm install` in both `backend` and `frontend`.
2. Copy `backend/.env.example` to `backend/.env`; set a persistent MongoDB URI and strong random `JWT_SECRET`, `COOKIE_SECRET`, and `ENCRYPTION_KEY` values.
3. Start MongoDB, run `npm run dev` in `backend`, then `npm run dev` in `frontend`. The UI is at `http://localhost:5173` and Vite proxies `/api` to port 5000.

Never commit `.env` files. OAuth and provider secrets belong only in the backend environment.

## Deploy to Vercel

Deploy the `backend` directory as a Vercel project and the `frontend` directory as a separate Vercel project. The frontend's `vercel.json` proxies `/api/*` to `https://digital-desk-be.vercel.app/api/*` so authentication cookies stay on the frontend's origin; update that destination if the backend project uses a different domain. Set the backend's `FRONTEND_URL` to the frontend's exact HTTPS origin (for example, `https://digital-desk-fe.vercel.app`) and configure its production environment variables, including `MONGO_URI`, then redeploy both projects. The app connects to MongoDB before each request and reuses the connection while the function instance stays warm.

Production API calls use the same-origin `/api` proxy. Do not set `VITE_API_URL` to `localhost` or the separate backend domain in Vercel. After deploying this proxy change, log in again once so the browser receives its auth cookie on the frontend origin.

OAuth must also return through that frontend proxy. Production callback URLs use the first `FRONTEND_URL` origin, including when an older callback environment variable still names the backend domain. Register these exact URLs with the providers and set the matching backend environment variables:

```text
GITHUB_CALLBACK_URL=https://digital-desk-fe.vercel.app/api/integrations/github/callback
GOOGLE_CALLBACK_URL=https://digital-desk-fe.vercel.app/api/integrations/google/callback
```

Use your actual frontend domain if different. In GitHub, update the OAuth App's **Authorization callback URL**; in Google Cloud, add the Google URL under the Web client's **Authorized redirect URIs**. Redeploy the backend after changing its environment. Starting OAuth on the frontend and returning to the backend loses the host-only state cookie and produces `github_state` or `google_state`; incognito mode cannot fix that domain mismatch. Keep state validation enabled.

## Provider configuration

### Public policies for Google OAuth

The frontend exposes `/privacy-policy` and `/terms-of-service` without requiring login. Both are linked from authentication screens and the app sidebar. The public operator is Vidhi Bhutia and the contact email is vidhibhutia2407@gmail.com. You can override these with `VITE_PUBLIC_OPERATOR_NAME` and `VITE_PUBLIC_SUPPORT_EMAIL` in the frontend Vercel environment, then rebuild/redeploy. These values are public browser configuration, not secrets.

After deploying, use `https://digital-desk-fe.vercel.app/privacy-policy` and `https://digital-desk-fe.vercel.app/terms-of-service` in Google Auth Platform Branding (replace the domain if needed). Review the policies against your actual hosting, retention, and support practices before submission. These pages do not complete Google's scope verification: Gmail read access is a restricted scope, and Google's verification and possibly security assessment requirements may apply. See [Google's production policy requirements](https://developers.google.com/identity/protocols/oauth2/production-readiness/policy-compliance).

- **GitHub:** Connect using a fine grained personal access token with the needed repository read permissions. The API validates the token with GitHub before storing it encrypted. The optional GitHub OAuth client variables support the existing login flow.
- **GitHub OAuth:** Create a GitHub OAuth App. Set `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `GITHUB_CALLBACK_URL` to `http://localhost:5000/api/integrations/github/callback` locally, or `https://<frontend-domain>/api/integrations/github/callback` in production (register the matching callback URL in GitHub). The redirect is state checked and connects to the currently signed-in Digital Desk account.
- **Google Gmail and Calendar:** Create OAuth 2.0 Web credentials in Google Cloud Console, enable Gmail API and Google Calendar API, configure the consent screen, and set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL`. Register `http://localhost:5000/api/integrations/google/callback` locally, or `https://<frontend-domain>/api/integrations/google/callback` in production as an authorized redirect URI. Gmail read access and Calendar event access are requested.
- **OpenWeather:** Set `OPENWEATHER_API_KEY`. Browser geolocation is requested by the dashboard; alternatively call the weather API with a manually selected `city`.
- **Web search:** Set a server side `TAVILY_API_KEY`. Without it, search returns personal results and reports web search as unavailable.
- **Database:** Set `MONGO_URI` to a persistent MongoDB instance. The server never silently falls back to volatile storage. Tests use an isolated MongoMemoryServer fixture.
- **Desk Radio:** Includes “Emerald Therapy” by Jason Shaw / Audionautix under CC BY 3.0. Attribution appears in the player. Set `RADIO_AUDIO_URL`, `RADIO_TRACK_TITLE`, and `RADIO_TRACK_ARTIST` on the backend to use another licensed HTTPS track. [Track and license details](https://commons.wikimedia.org/wiki/File:Audionautix-com-ccby-emeraldtherapy.mp3).

## API and functionality notes

Authenticated task and app calendar records are stored per user. The activity page includes app task completion and locally created calendar activity. Provider activity and Gmail search/summary require their provider API adapters and account credentials; unavailable services return explicit errors rather than fabricated records.

Run backend tests with `cd backend; npm test` and build the frontend with `cd frontend; npm run build`.
