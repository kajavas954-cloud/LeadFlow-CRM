import { AIService } from '../services/ai.service.js';
const aiService = new AIService();
export class AIController {
    // 1. Generate Summary
    async generateSummary(req, res, next) {
        try {
            const { leadId } = req.body;
            if (!leadId) {
                res.status(400).json({ success: false, message: 'leadId is required' });
                return;
            }
            const summary = await aiService.generateLeadSummary(leadId);
            res.status(200).json({ success: true, data: summary });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message || 'AI calculation failed' });
        }
    }
    // 2. Next Best Action
    async getNextAction(req, res, next) {
        try {
            const { leadId } = req.body;
            if (!leadId) {
                res.status(400).json({ success: false, message: 'leadId is required' });
                return;
            }
            const suggestion = await aiService.generateNextAction(leadId);
            res.status(200).json({ success: true, data: suggestion });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message || 'AI recommendation failed' });
        }
    }
    // 3. Email Generator
    async generateEmail(req, res, next) {
        try {
            const { leadName, company, template } = req.body;
            if (!leadName) {
                res.status(400).json({ success: false, message: 'leadName is required' });
                return;
            }
            const email = aiService.generateEmail(leadName, company, template || 'FIRST_CONTACT');
            res.status(200).json({ success: true, data: email });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message || 'AI generation failed' });
        }
    }
    // 4. Meeting Notes Parse
    async parseNotes(req, res, next) {
        try {
            const { rawText } = req.body;
            if (!rawText) {
                res.status(400).json({ success: false, message: 'rawText is required' });
                return;
            }
            const parsed = aiService.parseMeetingNotes(rawText);
            res.status(200).json({ success: true, data: parsed });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message || 'AI parsing failed' });
        }
    }
    // 5. Natural Search
    async naturalSearch(req, res, next) {
        try {
            const { prompt } = req.body;
            if (!prompt) {
                res.status(400).json({ success: false, message: 'prompt is required' });
                return;
            }
            const filters = aiService.parseNaturalSearch(prompt);
            res.status(200).json({ success: true, data: filters });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message || 'AI translation failed' });
        }
    }
    // 6. Dashboard Insights
    async getInsights(req, res, next) {
        try {
            const insights = await aiService.getDashboardInsights();
            res.status(200).json({ success: true, data: insights });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message || 'AI insights collection failed' });
        }
    }
    // 7. Conversational Chat
    async chat(req, res, next) {
        try {
            const { message } = req.body;
            if (!message) {
                res.status(400).json({ success: false, message: 'message is required' });
                return;
            }
            const reply = await aiService.chatAssistant(message);
            res.status(200).json({ success: true, data: reply });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message || 'AI assistant offline' });
        }
    }
}
