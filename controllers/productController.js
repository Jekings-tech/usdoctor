const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
require('dotenv').config();

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Get all products
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single product
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create product
exports.createProduct = async (req, res) => {
    try {
        const { name, category, description, priceMin, priceMax, stock } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Image required' });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: process.env.CLOUDINARY_FOLDER || 'pharmacy-shop'
        });

        // Delete temp file
        fs.unlinkSync(req.file.path);

        const product = new Product({
            name,
            category,
            description,
            priceMin: parseFloat(priceMin),
            priceMax: parseFloat(priceMax),
            stock: parseInt(stock),
            imageUrl: result.secure_url,
            imagePublicId: result.public_id
        });

        await product.save();
        res.json({ success: true, product, message: 'Product created!' });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Not found' });

        const updateData = { ...req.body };

        if (req.file) {
            // Delete old image
            if (product.imagePublicId) {
                await cloudinary.uploader.destroy(product.imagePublicId);
            }
            // Upload new
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: process.env.CLOUDINARY_FOLDER || 'pharmacy-shop'
            });
            updateData.imageUrl = result.secure_url;
            updateData.imagePublicId = result.public_id;
            fs.unlinkSync(req.file.path);
        }

        const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json({ success: true, product: updated, message: 'Product updated!' });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Not found' });

        // Delete from Cloudinary
        if (product.imagePublicId) {
            await cloudinary.uploader.destroy(product.imagePublicId);
        }

        await product.deleteOne();
        res.json({ success: true, message: 'Product deleted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};