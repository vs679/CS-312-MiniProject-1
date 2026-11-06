-- Create the database BlogDB in pgAdmin first, then execute this file against BlogDB.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR(255) PRIMARY KEY,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL
);
CREATE TABLE IF NOT EXISTS blogs (
  blog_id SERIAL PRIMARY KEY,
  creator_name VARCHAR(255) NOT NULL,
  creator_user_id VARCHAR(255) NOT NULL REFERENCES users(user_id),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  category VARCHAR(255) NOT NULL DEFAULT 'Other'
);
-- Demo accounts: alex / alex123, jamie / jamie123. Remove for production.
INSERT INTO users (user_id, password, name) VALUES
  ('alex', crypt('alex123', gen_salt('bf')), 'Alex Carter'),
  ('jamie', crypt('jamie123', gen_salt('bf')), 'Jamie Lee')
ON CONFLICT (user_id) DO NOTHING;
INSERT INTO blogs (creator_name, creator_user_id, title, body, category)
SELECT 'Alex Carter', 'alex', 'Getting Started with Node.js',
       'Node.js lets developers write server-side JavaScript.', 'Tech'
WHERE NOT EXISTS (SELECT 1 FROM blogs WHERE creator_user_id = 'alex' AND title = 'Getting Started with Node.js');
