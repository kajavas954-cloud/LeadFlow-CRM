import { LeadService } from '../services/lead.service.js';
import { NoteService } from '../services/note.service.js';
import { ActivityService } from '../services/activity.service.js';
const leadService = new LeadService();
const noteService = new NoteService();
const activityService = new ActivityService();
export class LeadController {
    async getLeads(req, res, next) {
        try {
            const { status, priority, source, assignedToId, search, sortBy, sortOrder, page, limit, } = req.query;
            const filterOptions = {
                status: status ? status : undefined,
                priority: priority ? priority : undefined,
                source: source ? source : undefined,
                assignedToId: assignedToId === 'unassigned' ? null : assignedToId ? assignedToId : undefined,
                search: search ? search : undefined,
                sortBy: sortBy ? sortBy : undefined,
                sortOrder: sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : undefined,
                page: page ? parseInt(page, 10) : undefined,
                limit: limit ? parseInt(limit, 10) : undefined,
            };
            const result = await leadService.getLeads(filterOptions);
            res.status(200).json({
                success: true,
                data: result.leads,
                pagination: {
                    total: result.total,
                    page: filterOptions.page || 1,
                    limit: filterOptions.limit || 10,
                    totalPages: Math.ceil(result.total / (filterOptions.limit || 10)),
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch leads',
            });
        }
    }
    async getLeadById(req, res, next) {
        try {
            const { id } = req.params;
            const lead = await leadService.getLeadById(id);
            res.status(200).json({
                success: true,
                data: lead,
            });
        }
        catch (error) {
            const statusCode = error.message === 'Lead not found' ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to fetch lead',
            });
        }
    }
    async createLead(req, res, next) {
        try {
            const userId = req.user.userId;
            const lead = await leadService.createLead(userId, req.body);
            res.status(201).json({
                success: true,
                message: 'Lead created successfully',
                data: lead,
            });
        }
        catch (error) {
            const statusCode = error.message.includes('already exists') ? 400 : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to create lead',
            });
        }
    }
    async updateLead(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const lead = await leadService.updateLead(userId, id, req.body);
            res.status(200).json({
                success: true,
                message: 'Lead updated successfully',
                data: lead,
            });
        }
        catch (error) {
            const statusCode = error.message === 'Lead not found' ? 404 : error.message.includes('already exists') ? 400 : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to update lead',
            });
        }
    }
    async deleteLead(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            await leadService.deleteLead(userId, id);
            res.status(200).json({
                success: true,
                message: 'Lead deleted successfully',
            });
        }
        catch (error) {
            const statusCode = error.message === 'Lead not found' ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to delete lead',
            });
        }
    }
    async assignLead(req, res, next) {
        try {
            const { id } = req.params;
            const { assignedToId } = req.body;
            const userId = req.user.userId;
            const lead = await leadService.assignLead(userId, id, assignedToId);
            res.status(200).json({
                success: true,
                message: 'Lead assigned successfully',
                data: lead,
            });
        }
        catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to assign lead',
            });
        }
    }
    async capturePublicLead(req, res, next) {
        try {
            // Basic Honeypot check
            if (req.body.honeypot) {
                // Silent block for spam bots
                res.status(200).json({
                    success: true,
                    message: 'Lead submitted successfully',
                });
                return;
            }
            // Simple Math Captcha verification (bonus spam protection)
            const { captchaAnswer, captchaExpected } = req.body;
            if (captchaExpected !== undefined && parseInt(captchaAnswer, 10) !== parseInt(captchaExpected, 10)) {
                res.status(400).json({
                    success: false,
                    message: 'Security validation failed. Please try again.',
                });
                return;
            }
            const lead = await leadService.capturePublicLead(req.body);
            res.status(201).json({
                success: true,
                message: 'Lead captured successfully',
                data: lead,
            });
        }
        catch (error) {
            const statusCode = error.message.includes('already been submitted') ? 400 : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to submit lead',
            });
        }
    }
    // Lead Notes Actions
    async addNote(req, res, next) {
        try {
            const { id } = req.params; // leadId
            const { note } = req.body;
            const userId = req.user.userId;
            const newNote = await noteService.addNote(userId, id, note);
            res.status(201).json({
                success: true,
                message: 'Note added successfully',
                data: newNote,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to add note',
            });
        }
    }
    async getNotes(req, res, next) {
        try {
            const { id } = req.params; // leadId
            const notes = await noteService.getNotes(id);
            res.status(200).json({
                success: true,
                data: notes,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch notes',
            });
        }
    }
    async deleteNote(req, res, next) {
        try {
            const { noteId } = req.params;
            const userId = req.user.userId;
            const userRole = req.user.role;
            await noteService.deleteNote(userId, userRole, noteId);
            res.status(200).json({
                success: true,
                message: 'Note deleted successfully',
            });
        }
        catch (error) {
            const statusCode = error.message === 'Note not found' ? 404 : error.message.includes('Unauthorized') ? 403 : 400;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Failed to delete note',
            });
        }
    }
    // Lead Activities Actions
    async getActivityLogs(req, res, next) {
        try {
            const { id } = req.params; // leadId
            const logs = await activityService.getActivityForLead(id);
            res.status(200).json({
                success: true,
                data: logs,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch activity logs',
            });
        }
    }
}
