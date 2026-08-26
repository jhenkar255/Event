"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveRecommendation = exports.chatAssistant = exports.optimizeBudget = exports.parseNaturalPrompt = exports.generateEventPlan = void 0;
const aiService_1 = require("../services/aiService");
const AIRecommendation_1 = require("../models/AIRecommendation");
const generateEventPlan = async (req, res) => {
    try {
        const plan = await aiService_1.AIService.generateEventPlan(req.body);
        res.json({ success: true, plan });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.generateEventPlan = generateEventPlan;
const parseNaturalPrompt = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            res.status(400).json({ success: false, message: 'Natural language prompt is required.' });
            return;
        }
        const parsed = aiService_1.AIService.parseNaturalPrompt(prompt);
        res.json({ success: true, parsed });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.parseNaturalPrompt = parseNaturalPrompt;
const optimizeBudget = async (req, res) => {
    try {
        const { totalBudget, priorityCategory } = req.body;
        const result = aiService_1.AIService.optimizeBudget(Number(totalBudget), priorityCategory);
        res.json({ success: true, result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.optimizeBudget = optimizeBudget;
const chatAssistant = async (req, res) => {
    try {
        const { message, eventContext } = req.body;
        if (!message) {
            res.status(400).json({ success: false, message: 'Message is required.' });
            return;
        }
        const response = await aiService_1.AIService.answerAssistantQuery(message, eventContext);
        res.json({ success: true, reply: response });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.chatAssistant = chatAssistant;
const saveRecommendation = async (req, res) => {
    try {
        const { eventId, prompt, category, responsePayload } = req.body;
        const rec = await AIRecommendation_1.AIRecommendation.create({
            eventId,
            userId: req.user?.id || 'demo_user',
            prompt,
            category,
            responsePayload,
        });
        res.status(201).json({ success: true, recommendation: rec });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.saveRecommendation = saveRecommendation;
