const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 8000;

app.use(cors());

// ── API Proxies (must come BEFORE static files) ──
app.use(createProxyMiddleware({ 
    pathFilter: '/api/v1/auth',
    target: 'http://localhost:8080', 
    changeOrigin: true 
}));

app.use(createProxyMiddleware({ 
    pathFilter: '/api/v1/venues',
    target: 'http://localhost:3000', 
    changeOrigin: true 
}));

// ── Gateway health check ──
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', gateway: 'running', timestamp: new Date().toISOString() });
});

// ── Serve Frontend Static Files ──
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Handle feature routes without .html extension
app.get('/features/:page', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'features', req.params.page + '.html'));
});

// Fallback: serve index.html for any non-API route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n⚡ VenueIQ Gateway running on http://localhost:${PORT}`);
    console.log(`   🌐 Frontend  → http://localhost:${PORT}`);
    console.log(`   🔐 Auth API  → http://localhost:${PORT}/api/v1/auth`);
    console.log(`   🏟️  Venue API → http://localhost:${PORT}/api/v1/venues`);
    console.log(`   💚 Health    → http://localhost:${PORT}/api/health\n`);
});
