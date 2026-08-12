const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');
const reviewRoutes = require('./routes/reviewRoutes');  // Moved up

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// ============ ROUTES - MUST COME BEFORE STATIC FILES ============
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);  // Review routes BEFORE static

// ============ SITEMAP ROUTE (NEW - SEO) ============
app.get('/sitemap.xml', async (req, res) => {
    try {
        const Product = require('./models/Product');
        const products = await Product.find().sort({ createdAt: -1 });
        
        const baseUrl = 'https://jonsonharvey.com';
        
        const productUrls = products.map(product => `
            <url>
                <loc>${baseUrl}/product.html?id=${product._id}</loc>
                <lastmod>${new Date(product.updatedAt || product.createdAt).toISOString()}</lastmod>
                <changefreq>weekly</changefreq>
                <priority>0.8</priority>
            </url>
        `).join('');
        
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            <url>
                <loc>${baseUrl}/</loc>
                <lastmod>${new Date().toISOString()}</lastmod>
                <changefreq>daily</changefreq>
                <priority>1.0</priority>
            </url>
            <url>
                <loc>${baseUrl}/shop.html</loc>
                <lastmod>${new Date().toISOString()}</lastmod>
                <changefreq>daily</changefreq>
                <priority>0.9</priority>
            </url>
            <url>
                <loc>${baseUrl}/about.html</loc>
                <lastmod>${new Date().toISOString()}</lastmod>
                <changefreq>monthly</changefreq>
                <priority>0.6</priority>
            </url>
            <url>
                <loc>${baseUrl}/contact.html</loc>
                <lastmod>${new Date().toISOString()}</lastmod>
                <changefreq>monthly</changefreq>
                <priority>0.6</priority>
            </url>
            ${productUrls}
        </urlset>`;
        
        res.header('Content-Type', 'application/xml');
        res.send(sitemap);
    } catch (error) {
        console.error('Sitemap error:', error);
        res.status(500).send('Error generating sitemap');
    }
});

// ============ STATIC FILES ============
// Client site static files
app.use(express.static('client'));
// Admin dashboard static files
app.use(express.static('public'));

// ============ PAGE ROUTES ============
// Root route - serve client homepage
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: 'client' });
});

// Admin dashboard route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}`);
    console.log(`📊 Admin: http://localhost:${PORT}/admin`);
    console.log(`🌐 Client: http://localhost:${PORT}`);
});