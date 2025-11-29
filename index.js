// index.js
// Simple NBA proxy API for The Player Index

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// IMPORTANT: set this in Render → Environment variables
const BALLDONTLIE_API_KEY = process.env.BALLDONTLIE_API_KEY;

// Basic safety check
if (!BALLDONTLIE_API_KEY) {
  console.warn('⚠️ WARNING: BALLDONTLIE_API_KEY is not set. The API will not work until you add it in Render.');
}

app.use(cors());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'theplayerindex-nba-api' });
});

/**
 * GET /players?search=lebron
 * Proxies to BallDontLie players endpoint and returns a simplified response.
 */
app.get('/players', async (req, res) => {
  try {
    const search = req.query.search;
    if (!search) {
      return res.status(400).json({ error: 'Missing required query parameter: search' });
    }

    const response = await axios.get('https://api.balldontlie.io/v1/players', {
      params: { search },
      headers: {
        Authorization: `Bearer ${BALLDONTLIE_API_KEY}`
      }
    });

    const data = response.data;

    // Normalize to a simple consistent shape for FlutterFlow
    const players = (data.data || []).map((p) => ({
      id: p.id,
      first_name: p.first_name,
      last_name: p.last_name,
      position: p.position,
      team_name: p.team?.full_name || null
    }));

    res.json({ players });
  } catch (err) {
    console.error('Error in /players:', err?.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to fetch player data',
      details: err?.response?.data || err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 theplayerindex-nba-api running on port ${PORT}`);
});
