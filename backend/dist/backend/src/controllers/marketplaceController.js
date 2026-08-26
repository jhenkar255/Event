"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEntertainment = exports.getEntertainment = exports.createCateringPackage = exports.getCateringPackages = exports.createDecoration = exports.getDecorations = void 0;
const Decoration_1 = require("../models/Decoration");
const Catering_1 = require("../models/Catering");
const Entertainment_1 = require("../models/Entertainment");
// ==================== DECORATIONS ====================
const getDecorations = async (req, res) => {
    try {
        const { category, culturalStyle, maxPrice, search } = req.query;
        const filter = { isAvailable: true };
        if (category)
            filter.category = category;
        if (culturalStyle)
            filter.culturalStyle = culturalStyle;
        if (maxPrice)
            filter.price = { $lte: Number(maxPrice) };
        if (search) {
            filter.$or = [
                { name: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { category: new RegExp(search, 'i') },
            ];
        }
        const decorations = await Decoration_1.Decoration.find(filter).sort({ rating: -1, price: 1 });
        res.json({ success: true, count: decorations.length, decorations });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getDecorations = getDecorations;
const createDecoration = async (req, res) => {
    try {
        const decoration = await Decoration_1.Decoration.create(req.body);
        res.status(201).json({ success: true, decoration });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createDecoration = createDecoration;
// ==================== CATERING ====================
const getCateringPackages = async (req, res) => {
    try {
        const { category, maxPricePerPlate, search } = req.query;
        const filter = { isAvailable: true };
        if (category)
            filter.category = category;
        if (maxPricePerPlate)
            filter.pricePerPlate = { $lte: Number(maxPricePerPlate) };
        if (search) {
            filter.$or = [
                { name: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { category: new RegExp(search, 'i') },
            ];
        }
        const packages = await Catering_1.Catering.find(filter).sort({ rating: -1, pricePerPlate: 1 });
        res.json({ success: true, count: packages.length, packages, catering: packages, caterings: packages });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCateringPackages = getCateringPackages;
const createCateringPackage = async (req, res) => {
    try {
        const catering = await Catering_1.Catering.create(req.body);
        res.status(201).json({ success: true, catering });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createCateringPackage = createCateringPackage;
// ==================== ENTERTAINMENT ====================
const getEntertainment = async (req, res) => {
    try {
        const { category, maxPrice, search } = req.query;
        const filter = { isAvailable: true };
        if (category)
            filter.category = category;
        if (maxPrice)
            filter.price = { $lte: Number(maxPrice) };
        if (search) {
            filter.$or = [
                { name: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { category: new RegExp(search, 'i') },
            ];
        }
        const items = await Entertainment_1.Entertainment.find(filter).sort({ rating: -1, price: 1 });
        res.json({ success: true, count: items.length, items, entertainment: items, entertainments: items });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getEntertainment = getEntertainment;
const createEntertainment = async (req, res) => {
    try {
        const item = await Entertainment_1.Entertainment.create(req.body);
        res.status(201).json({ success: true, item });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createEntertainment = createEntertainment;
