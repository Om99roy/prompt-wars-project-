require('dotenv').config({ path: '../services/venue-service/.env' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  try {
    await client.connect();
    console.log('✅ Connected to Neon PostgreSQL');

    // Run schema migration
    const schema = fs.readFileSync(path.join(__dirname, 'migrations', '001_initial_schema.sql'), 'utf8');
    await client.query(schema);
    console.log('✅ Schema migration complete');

    // Seed initial venue data
    await client.query(`
      INSERT INTO venues (name, country, city, capacity, sport_type, timezone, data_residency, geo_lat, geo_lng)
      VALUES
        ('M. Chinnaswamy Stadium', 'IN', 'Bengaluru', 35000, ARRAY['CRICKET_T20','CRICKET_ODI'], 'Asia/Kolkata', 'IN', 12.978889, 77.598056),
        ('Wankhede Stadium', 'IN', 'Mumbai', 33000, ARRAY['CRICKET_T20','CRICKET_ODI','CRICKET_TEST'], 'Asia/Kolkata', 'IN', 18.938611, 72.825278),
        ('Lords Cricket Ground', 'GB', 'London', 30000, ARRAY['CRICKET_ODI','CRICKET_TEST'], 'Europe/London', 'GB', 51.529722, -0.172778),
        ('National Stadium Karachi', 'PK', 'Karachi', 34228, ARRAY['CRICKET_T20','CRICKET_ODI','CRICKET_TEST'], 'Asia/Karachi', 'PK', 24.892500, 67.063333)
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Seeded 4 venues');

    const { rows } = await client.query('SELECT venue_id, name, country, city FROM venues');
    console.log('\n📋 Venues in database:');
    rows.forEach(v => console.log(`   - ${v.name} (${v.country}) — ${v.city}`));

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
