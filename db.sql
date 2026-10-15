-- First create a PostgreSQL database named BlogDB in pgAdmin.
-- Then open BlogDB's Query Tool and run this file.
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

-- Sample sign-in credentials: alex / alex123, jamie / jamie123, taylor / taylor123.
INSERT INTO users (user_id, password, name) VALUES
  ('alex', crypt('alex123', gen_salt('bf')), 'Alex Carter'),
  ('jamie', crypt('jamie123', gen_salt('bf')), 'Jamie Lee'),
  ('taylor', crypt('taylor123', gen_salt('bf')), 'Taylor Morgan')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO blogs (creator_name, creator_user_id, title, body, date_created, category)
SELECT name, user_id, 'Getting Started with Node.js', 'Node.js lets developers write server-side JavaScript. Start with a small Express server and build from there.', '2026-09-20 10:00:00', 'Tech' FROM users WHERE user_id = 'alex'
UNION ALL
SELECT name, user_id, 'A Simple Morning Routine', 'Planning my top three priorities each morning has helped me stay focused during busy weeks.', '2026-09-21 08:30:00', 'Lifestyle' FROM users WHERE user_id = 'jamie'
UNION ALL
SELECT name, user_id, 'Tips for Studying Consistently', 'Short study sessions, practice problems, and regular reviews make difficult concepts easier to remember.', '2026-09-22 14:15:00', 'Education' FROM users WHERE user_id = 'taylor'
UNION ALL
SELECT name, user_id, 'Why I Like PostgreSQL', 'PostgreSQL makes it straightforward to store related data using primary keys, foreign keys, and SQL queries.', '2026-09-23 16:45:00', 'Tech' FROM users WHERE user_id = 'alex'
UNION ALL
SELECT name, user_id, 'Learning from Side Projects', 'Small personal projects give you room to experiment, make mistakes, and understand how features work together.', '2026-09-24 12:00:00', 'Other' FROM users WHERE user_id = 'jamie';
