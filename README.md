# CS-312 MiniProject-4 — React Blog Application

React + Vite frontend, Node.js/Express JSON API, and PostgreSQL database. Based on the database schema and functionality from CS-312-MiniProject-1 (the MiniProject-3 repository was not accessible). Includes sign-up, sign-in, sign-out, creating posts, viewing/filtering posts, owner-only editing/deleting, responsive styles, and optional profile.

## Setup

1. Install Node.js and PostgreSQL. Create PostgreSQL database **BlogDB** in pgAdmin.
2. Run `db.sql` in the **BlogDB** database using pgAdmin Query Tool or `psql -U postgres -d BlogDB -f db.sql`. **Do not repeatedly run the sample data insertion file if you want to avoid duplicate blog entries.**
3. In `backend/`, copy `.env.example` to `.env`, then set `PGPASSWORD` and a long random `SESSION_SECRET`.
4. In one terminal: `cd backend && npm install && npm run dev` — API at http://localhost:8000.
5. In another terminal: `cd frontend && npm install && npm run dev` — frontend at http://localhost:5173.
6. Open http://localhost:5173. Sign in as **alex / alex123** (seeded demo account), or sign up.

## API routes

- `GET /api/auth/me`, `POST /api/auth/signup`, `POST /api/auth/signin`, `POST /api/auth/signout`
- `GET /api/blogs?category=All`, `GET /api/blogs/:id`
- `POST /api/blogs`, `PUT /api/blogs/:id`, `DELETE /api/blogs/:id`
- `GET /api/profile`

The backend checks session authentication and post ownership before any write. Passwords are hashed in PostgreSQL with `pgcrypto` bcrypt; session cookies are httpOnly. Vite proxies `/api` to Express in development, so no extra CORS package is required.

## Production build (local demonstration)

Run `cd frontend && npm run build`. Then configure `NODE_ENV=production` in `backend/.env` and start backend with `npm start`. Express serves `frontend/dist` at http://localhost:8000. For real deployment use a persistent session store, HTTPS, a secure secret, and remove demo credentials.

## Submission

Publish the project to a **new public** `CS-312-MiniProject-4` GitHub repo; add repository URL and separate video URL to Canvas. Never commit `.env` or `node_modules`.

## Testing checklist

- Register, reject duplicate ID, sign in with correct/incorrect passwords, sign out.
- Create a post, filter categories, reload to verify persistence.
- Edit and delete your own post; confirm list updates without a page refresh.
- Sign in as another user; verify that Edit/Delete buttons are hidden and direct API modifications fail.
- Check phone-sized viewport and desktop browsers.
