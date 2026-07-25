import { Request, Response, NextFunction } from 'express';
import { LeadService } from '../services/lead.service.js';
import { NoteService } from '../services/note.service.js';
import { ActivityService } from '../services/activity.service.js';
import { LeadStatus, Priority, LeadSource, Role } from '@prisma/client';

const leadService = new LeadService();
const noteService = new NoteService();
const activityService = new ActivityService();

export class LeadController {
  async getLeads(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        status,
        priority,
        source,
        assignedToId,
        search,
        sortBy,
        sortOrder,
        page,
        limit,
      } = req.query;

      const filterOptions = {
        status: status ? (status as LeadStatus) : undefined,
        priority: priority ? (priority as Priority) : undefined,
        source: source ? (source as LeadSource) : undefined,
        assignedToId: assignedToId === 'unassigned' ? null : assignedToId ? (assignedToId as string) : undefined,
        search: search ? (search as string) : undefined,
        sortBy: sortBy ? (sortBy as string) : undefined,
        sortOrder: sortOrder === 'asc' || sortOrder === 'desc' ? (sortOrder as 'asc' | 'desc') : undefined,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch leads',
      });
    }
  }

  async getLeadById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const lead = await leadService.getLeadById(id);
      res.status(200).json({
        success: true,
        data: lead,
      });
    } catch (error: any) {
      const statusCode = error.message === 'Lead not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch lead',
      });
    }
  }

  async createLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const lead = await leadService.createLead(userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Lead created successfully',
        data: lead,
      });
    } catch (error: any) {
      const statusCode = error.message.includes('already exists') ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to create lead',
      });
    }
  }

  async updateLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      const lead = await leadService.updateLead(userId, id, req.body);
      res.status(200).json({
        success: true,
        message: 'Lead updated successfully',
        data: lead,
      });
    } catch (error: any) {
      const statusCode = error.message === 'Lead not found' ? 404 : error.message.includes('already exists') ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update lead',
      });
    }
  }

  async deleteLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      await leadService.deleteLead(userId, id);
      res.status(200).json({
        success: true,
        message: 'Lead deleted successfully',
      });
    } catch (error: any) {
      const statusCode = error.message === 'Lead not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to delete lead',
      });
    }
  }

  async assignLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { assignedToId } = req.body;
      const userId = (req as any).user.userId;

      const lead = await leadService.assignLead(userId, id, assignedToId);
      res.status(200).json({
        success: true,
        message: 'Lead assigned successfully',
        data: lead,
      });
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to assign lead',
      });
    }
  }

  async capturePublicLead(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    } catch (error: any) {
      const statusCode = error.message.includes('already been submitted') ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to submit lead',
      });
    }
  }

  // Lead Notes Actions
  async addNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params; // leadId
      const { note } = req.body;
      const userId = (req as any).user.userId;

      const newNote = await noteService.addNote(userId, id, note);
      res.status(201).json({
        success: true,
        message: 'Note added successfully',
        data: newNote,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to add note',
      });
    }
  }

  async getNotes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params; // leadId
      const notes = await noteService.getNotes(id);
      res.status(200).json({
        success: true,
        data: notes,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch notes',
      });
    }
  }

  async deleteNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { noteId } = req.params;
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role as Role;

      await noteService.deleteNote(userId, userRole, noteId);
      res.status(200).json({
        success: true,
        message: 'Note deleted successfully',
      });
    } catch (error: any) {
      const statusCode = error.message === 'Note not found' ? 404 : error.message.includes('Unauthorized') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to delete note',
      });
    }
  }

  // Lead Activities Actions
  async getActivityLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params; // leadId
      const logs = await activityService.getActivityForLead(id);
      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch activity logs',
      });
    }
  }
}
