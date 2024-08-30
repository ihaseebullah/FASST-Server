const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    images: [{ type: String }],  // Storing image paths as strings
    ingredients: { type: String, required: true },
    pros: [{ type: String }],  // Array of pros as strings
    sideEffects: [{ type: String }]  // Array of side effects as strings
}, {
    timestamps: true,
    versionKey: false
});

const PRODUCT = mongoose.model('PRODUCT', productSchema);

module.exports = PRODUCT;
