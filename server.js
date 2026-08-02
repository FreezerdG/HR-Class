const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Railway injects DATABASE_URL automatically once you add a Postgres
// database to the same project — you don't need to set this by hand.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('railway')
    ? { rejectUnauthorized: false }
    : false
});

app.use(express.json());

// ALLOWED_ORIGIN restricts who can call this API from a browser.
// Set it in Railway to your GitHub Pages URL, e.g.
// https://yourname.github.io
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*'
}));

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      company_name TEXT NOT NULL,
      hire_name TEXT NOT NULL,
      manager_name TEXT NOT NULL,
      buddy_name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

// Health check — also what you'll see if you open the API URL directly
app.get('/', (req, res) => {
  res.send('Onboarding API is running.');
});

// List the most recent submissions
app.get('/api/submissions', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, company_name, hire_name, manager_name, buddy_name, created_at
       FROM submissions
       ORDER BY created_at DESC
       LIMIT 50`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to load submissions:', err);
    res.status(500).json({ error: 'Failed to load submissions' });
  }
});

// Save a new submission
app.post('/api/submissions', async (req, res) => {
  const { company_name, hire_name, manager_name, buddy_name } = req.body || {};

  if (!company_name || !hire_name || !manager_name || !buddy_name) {
    return res.status(400).json({ error: 'company_name, hire_name, manager_name, and buddy_name are all required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO submissions (company_name, hire_name, manager_name, buddy_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, company_name, hire_name, manager_name, buddy_name, created_at`,
      [company_name, hire_name, manager_name, buddy_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Failed to save submission:', err);
    res.status(500).json({ error: 'Failed to save submission' });
  }
});

ensureTable()
  .then(() => {
    app.listen(port, () => {
      console.log(`Onboarding API listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to set up the database table:', err);
    process.exit(1);
  });
