const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productController');
const fs = require('fs');

// Create uploads folder
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const types = /jpeg|jpg|png|gif|webp/;
        const ext = types.test(path.extname(file.originalname).toLowerCase());
        const mime = types.test(file.mimetype);
        if (ext && mime) cb(null, true);
        else cb(new Error('Images only'));
    }
});

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
router.post('/', upload.single('image'), productController.createProduct);
router.put('/:id', upload.single('image'), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;