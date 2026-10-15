# CS 312 Blog App

## Setup

1. Install Node.js and PostgreSQL.
2. Create a PostgreSQL database named `BlogDB` in pgAdmin.
3. Open `BlogDB`'s Query Tool and run `db.sql` once to create and populate the tables. The script inserts **3 users and 5 posts**. (Rerunning the script would insert the 5 posts again.)
4. Copy `.env.example` to `.env` and set your PostgreSQL password and a random `SESSION_SECRET`.
5. Run:

   ```bash
   npm install
   npm start
   ```

6. Open http://localhost:3000/signin.

## Sample accounts

| User ID | Password |
|---|---|
| alex | alex123 |
| jamie | jamie123 |
| taylor | taylor123 |

The app keeps the existing category filter and allows signed-in users to create posts. Only the post's creator can edit or delete it. PostgreSQL stores the posts and users; a login session is stored in a session cookie. The session store uses Express's in-memory development store, so users sign in again if the server restarts.
