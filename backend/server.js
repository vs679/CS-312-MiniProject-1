require('dotenv').config();
const express = require('express');
const session = require('express-session');
const { Pool } = require('pg');
const path = require('path');
const app = express();
const pool = new Pool({
  host: process.env.PGHOST || 'localhost', port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'BlogDB', user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD
});
if (!process.env.SESSION_SECRET) throw new Error('Set SESSION_SECRET in backend/.env');
app.use(express.json({ limit: '100kb' }));
app.use(session({
  name: 'blog.sid', secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 86400000 }
}));
const requireLogin = (req, res, next) => req.session.userId ? next() : res.status(401).json({ error: 'Sign in to continue.' });
const categories = ['Tech', 'Lifestyle', 'Education', 'Other'];
const validId = id => /^\d+$/.test(String(id));
function validatePost(req, res, next) {
  const { title, content, category } = req.body;
  if (typeof title !== 'string' || !title.trim() || title.length > 255 ||
      typeof content !== 'string' || !content.trim() || content.length > 20000 ||
      !categories.includes(category)) return res.status(400).json({ error: 'Enter a title (up to 255 characters), content (up to 20,000 characters), and category.' });
  next();
}
app.get('/api/auth/me', (req, res) => res.json({ user: req.session.userId ? { user_id: req.session.userId, name: req.session.name } : null }));
app.post('/api/auth/signup', async (req, res, next) => {
  const { user_id, password, name } = req.body;
  if (typeof user_id !== 'string' || !user_id.trim() || user_id.length > 255 ||
      typeof name !== 'string' || !name.trim() || name.length > 255 ||
      typeof password !== 'string' || password.length < 8 || password.length > 128)
    return res.status(400).json({ error: 'Provide a user ID and name (up to 255 characters) and password of 8–128 characters.' });
  try {
    await pool.query("INSERT INTO users (user_id, password, name) VALUES ($1, crypt($2, gen_salt('bf')), $3)", [user_id.trim(), password, name.trim()]);
    res.status(201).json({ message: 'Account created. Please sign in.' });
  } catch (e) { if (e.code === '23505') return res.status(409).json({ error: 'User ID already taken.' }); next(e); }
});
app.post('/api/auth/signin', async (req, res, next) => {
  const { user_id, password } = req.body;
  if (typeof user_id !== 'string' || typeof password !== 'string') return res.status(400).json({ error: 'User ID and password required.' });
  try {
    const result = await pool.query('SELECT user_id, name FROM users WHERE user_id = $1 AND password = crypt($2, password)', [user_id.trim(), password]);
    if (!result.rowCount) return res.status(401).json({ error: 'Incorrect user ID or password.' });
    req.session.regenerate(error => {
      if (error) return next(error);
      req.session.userId = result.rows[0].user_id;
      req.session.name = result.rows[0].name;
      req.session.save(error => error ? next(error) : res.json({ user: result.rows[0] }));
    });
  } catch (e) { next(e); }
});
app.post('/api/auth/signout', requireLogin, (req, res, next) => req.session.destroy(err => err ? next(err) : res.clearCookie('blog.sid').json({ message: 'Signed out.' })));
app.get('/api/blogs', async (req, res, next) => {
  try {
    const category = req.query.category;
    if (category && category !== 'All' && !categories.includes(category)) return res.status(400).json({ error: 'Invalid category.' });
    const where = category && category !== 'All' ? 'WHERE category = $1' : '';
    const result = await pool.query(`SELECT blog_id, creator_name, creator_user_id, title, body, category, date_created FROM blogs ${where} ORDER BY date_created DESC, blog_id DESC`, where ? [category] : []);
    res.json({ posts: result.rows });
  } catch (e) { next(e); }
});
app.get('/api/blogs/:id', async (req, res, next) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid post ID.' });
  try {
    const result = await pool.query('SELECT blog_id, creator_name, creator_user_id, title, body, category, date_created FROM blogs WHERE blog_id = $1', [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Post not found.' });
    res.json({ post: result.rows[0] });
  } catch (e) { next(e); }
});
app.post('/api/blogs', requireLogin, validatePost, async (req, res, next) => {
  try {
    const result = await pool.query('INSERT INTO blogs (creator_name, creator_user_id, title, body, category) VALUES ($1,$2,$3,$4,$5) RETURNING *', [req.session.name, req.session.userId, req.body.title.trim(), req.body.content.trim(), req.body.category]);
    res.status(201).json({ post: result.rows[0] });
  } catch (e) { next(e); }
});
app.put('/api/blogs/:id', requireLogin, validatePost, async (req, res, next) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid post ID.' });
  try {
    const result = await pool.query('UPDATE blogs SET title=$1, body=$2, category=$3 WHERE blog_id=$4 AND creator_user_id=$5 RETURNING *', [req.body.title.trim(), req.body.content.trim(), req.body.category, req.params.id, req.session.userId]);
    if (!result.rowCount) return res.status(404).json({ error: 'Post not found or not owned by you.' });
    res.json({ post: result.rows[0] });
  } catch (e) { next(e); }
});
app.delete('/api/blogs/:id', requireLogin, async (req, res, next) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid post ID.' });
  try {
    const result = await pool.query('DELETE FROM blogs WHERE blog_id=$1 AND creator_user_id=$2 RETURNING blog_id', [req.params.id, req.session.userId]);
    if (!result.rowCount) return res.status(404).json({ error: 'Post not found or not owned by you.' });
    res.json({ deleted: true });
  } catch (e) { next(e); }
});
app.get('/api/profile', requireLogin, async (req, res, next) => {
  try {
    const result = await pool.query('SELECT user_id, name FROM users WHERE user_id=$1', [req.session.userId]);
    if (!result.rowCount) return res.status(404).json({ error: 'User not found.' });
    const posts = await pool.query('SELECT * FROM blogs WHERE creator_user_id=$1 ORDER BY date_created DESC,blog_id DESC', [req.session.userId]);
    res.json({ user: result.rows[0], posts: posts.rows });
  } catch (e) { next(e); }
});
// Run the frontend production build with npm run build in frontend/ first.
const built = path.join(__dirname, '..', 'frontend', 'dist');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(built));
  app.get('/{*path}', (req, res) => res.sendFile(path.join(built, 'index.html')));
}
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Unexpected server error.' }); });
app.listen(Number(process.env.PORT || 8000), () => console.log(`API listening at http://localhost:${process.env.PORT || 8000}`));
