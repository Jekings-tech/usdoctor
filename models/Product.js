mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Strong Painkillers (Opioids)',
            'Anti-Anxiety & Sedatives (Benzodiazepines)',
            'Sleeping Aids (Z-Drugs)',
            'Muscle Relaxants',
            'ADHD & Stimulants',
            'Nerve Pain Medication',
            'Combination Pain Relief',
            'Carts'
        ]
    },
    description: {
        type: String,
        required: true
    },
    priceMin: {
        type: Number,
        required: true
    },
    priceMax: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    imageUrl: {
        type: String,
        required: true
    },
    imagePublicId: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);