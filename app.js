require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'BlogDB',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD
});

if (!process.env.SESSION_SECRET) {
  throw new Error('Set SESSION_SECRET before starting the server.');
}

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' }
}));

function requireLogin(req, res, next) {
  if (!req.session.userId) return res.redirect('/signin');
  next();
}

app.get('/signup', (req, res) => res.render('signup', { error: null }));

app.post('/signup', async (req, res, next) => {
  const { user_id, password, name } = req.body;
  if (!user_id?.trim() || !password || !name?.trim() || user_id.length > 255 || name.length > 255) {
    return res.status(400).render('signup', { error: 'Enter a user ID, password, and name (maximum 255 characters).' });
  }
  try {
    const existing = await pool.query('SELECT user_id FROM users WHERE user_id = $1', [user_id.trim()]);
    if (existing.rowCount) return res.status(409).render('signup', { error: 'This user ID is taken. Choose a different one.' });
    await pool.query('INSERT INTO users (user_id, password, name) VALUES ($1, crypt($2, gen_salt(\'bf\')), $3)', [user_id.trim(), password, name.trim()]);
    res.redirect('/signin');
  } catch (err) {
    if (err.code === '23505') return res.status(409).render('signup', { error: 'This user ID is taken. Choose a different one.' });
    next(err);
  }
});

app.get('/signin', (req, res) => res.render('signin', { error: null }));

app.post('/signin', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT user_id, name FROM users WHERE user_id = $1 AND password = crypt($2, password)', [req.body.user_id || '', req.body.password || '']);
    if (!result.rowCount) return res.status(401).render('signin', { error: 'Incorrect user ID or password.' });
    req.session.regenerate(err => {
      if (err) return next(err);
      req.session.userId = result.rows[0].user_id;
      req.session.name = result.rows[0].name;
      req.session.save(err => err ? next(err) : res.redirect('/'));
    });
  } catch (err) { next(err); }
});

app.post('/signout', requireLogin, (req, res, next) => {
  req.session.destroy(err => err ? next(err) : res.redirect('/signin'));
});

app.get('/', requireLogin, async (req, res, next) => {
  const category = ['All', 'Tech', 'Lifestyle', 'Education', 'Other'].includes(req.query.category) ? req.query.category : 'All';
  try {
    const result = category === 'All'
      ? await pool.query('SELECT * FROM blogs ORDER BY date_created DESC, blog_id DESC')
      : await pool.query('SELECT * FROM blogs WHERE category = $1 ORDER BY date_created DESC, blog_id DESC', [category]);
    res.render('index', { posts: result.rows, category, userId: req.session.userId, name: req.session.name });
  } catch (err) { next(err); }
});

app.post('/posts', requireLogin, async (req, res, next) => {
  const { title, content, category } = req.body;
  if (!title?.trim() || !content?.trim() || title.length > 255 || !['Tech', 'Lifestyle', 'Education', 'Other'].includes(category)) {
    return res.status(400).send('Invalid title, category, or post content.');
  }
  try {
    await pool.query('INSERT INTO blogs (creator_name, creator_user_id, title, body, category, date_created) VALUES ($1, $2, $3, $4, $5, NOW())', [req.session.name, req.session.userId, title.trim(), content.trim(), category]);
    res.redirect('/');
  } catch (err) { next(err); }
});

app.get('/posts/:id/edit', requireLogin, async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM blogs WHERE blog_id = $1', [req.params.id]);
    if (!result.rowCount) return res.status(404).send('Post not found');
    if (result.rows[0].creator_user_id !== req.session.userId) return res.status(403).send('You can only edit your own posts.');
    res.render('edit', { post: result.rows[0] });
  } catch (err) { next(err); }
});

app.post('/posts/:id/edit', requireLogin, async (req, res, next) => {
  const { title, content, category } = req.body;
  if (!title?.trim() || !content?.trim() || title.length > 255 || !['Tech', 'Lifestyle', 'Education', 'Other'].includes(category)) {
    return res.status(400).send('Invalid title, category, or post content.');
  }
  try {
    const result = await pool.query('UPDATE blogs SET title = $1, body = $2, category = $3 WHERE blog_id = $4 AND creator_user_id = $5 RETURNING blog_id', [title.trim(), content.trim(), category, req.params.id, req.session.userId]);
    if (!result.rowCount) return res.status(403).send('Post not found or you do not own this post.');
    res.redirect('/');
  } catch (err) { next(err); }
});

app.post('/posts/:id/delete', requireLogin, async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM blogs WHERE blog_id = $1 AND creator_user_id = $2 RETURNING blog_id', [req.params.id, req.session.userId]);
    if (!result.rowCount) return res.status(403).send('Post not found or you do not own this post.');
    res.redirect('/');
  } catch (err) { next(err); }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('An unexpected server error occurred.');
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
