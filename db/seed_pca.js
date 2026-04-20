require('dotenv').config({ path: '../services/venue-service/.env' });
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

client.connect().then(async () => {
  await client.query(
    "INSERT INTO venues (name, country, city, capacity, sport_type, timezone, data_residency, geo_lat, geo_lng) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT DO NOTHING",
    ['PCA New Cricket Stadium', 'IN', 'Mullanpur', 33000, ['CRICKET_T20','CRICKET_ODI'], 'Asia/Kolkata', 'IN', 30.757, 76.664]
  );
  const { rows } = await client.query('SELECT name, city FROM venues ORDER BY name');
  console.log('All venues:');
  rows.forEach(r => console.log(' -', r.name, '—', r.city));
  await client.end();
}).catch(e => { console.error(e.message); process.exit(1); });
