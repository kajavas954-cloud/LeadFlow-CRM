import { LeadRepository, LeadFilterOptions } from '../repositories/lead.repository.js';
import { ActivityRepository } from '../repositories/activity.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { Lead, LeadStatus, Priority, LeadSource, Prisma } from '@prisma/client';

const leadRepository = new LeadRepository();
const activityRepository = new ActivityRepository();
const userRepository = new UserRepository();

export class LeadService {
  // Simple, explainable lead scoring algorithm
  calculateLeadScore(data: {
    source: LeadSource;
    priority: Priority;
    phone?: string | null;
    website?: string | null;
    company?: string | null;
  }): number {
    let score = 30; // base score

    // Source points
    switch (data.source) {
      case LeadSource.REFERRAL:
        score += 25;
        break;
      case LeadSource.LINKEDIN:
        score += 20;
        break;
      case LeadSource.GOOGLE_ADS:
        score += 15;
        break;
      case LeadSource.WEBSITE:
        score += 10;
        break;
      case LeadSource.COLD_EMAIL:
        score += 5;
        break;
      default:
        score += 0;
    }

    // Priority points
    switch (data.priority) {
      case Priority.URGENT:
        score += 25;
        break;
      case Priority.HIGH:
        score += 15;
        break;
      case Priority.MEDIUM:
        score += 5;
        break;
      default:
        score += 0;
    }

    // Completeness of profile points
    if (data.phone && data.phone.trim() !== '') score += 10;
    if (data.website && data.website.trim() !== '') score += 5;
    if (data.company && data.company.trim() !== '') score += 5;

    return Math.min(score, 100);
  }

  async getLeads(options: LeadFilterOptions): Promise<{ leads: Lead[]; total: number }> {
    return leadRepository.findAll(options);
  }

  async getLeadById(id: string): Promise<Lead> {
    const lead = await leadRepository.findById(id);
    if (!lead) {
      throw new Error('Lead not found');
    }
    return lead;
  }

  async createLead(userId: string, data: Omit<Prisma.LeadUncheckedCreateInput, 'score' | 'createdById'>): Promise<Lead> {
    const existing = await leadRepository.findByEmail(data.email);
    if (existing) {
      throw new Error('A lead with this email already exists');
    }

    const priority = data.priority || Priority.MEDIUM;
    const source = data.source || LeadSource.WEBSITE;

    const score = this.calculateLeadScore({
      source,
      priority,
      phone: data.phone,
      website: data.website,
      company: data.company,
    });

    const lead = await leadRepository.create({
      ...data,
      score,
      createdById: userId,
    });

    await activityRepository.create({
      leadId: lead.id,
      userId,
      action: 'LEAD_CREATED',
      metadata: {
        name: lead.name,
        company: lead.company,
        status: lead.status,
        priority: lead.priority,
      },
    });

    if (lead.assignedToId) {
      await activityRepository.create({
        leadId: lead.id,
        userId,
        action: 'ASSIGNED',
        metadata: {
          assignedToId: lead.assignedToId,
        },
      });
    }

    return lead;
  }

  async updateLead(userId: string, id: string, data: Prisma.LeadUncheckedUpdateInput): Promise<Lead> {
    const lead = await leadRepository.findById(id);
    if (!lead) {
      throw new Error('Lead not found');
    }

    // Check email uniqueness if email is changing
    if (data.email && typeof data.email === 'string' && data.email !== lead.email) {
      const existing = await leadRepository.findByEmail(data.email);
      if (existing) {
        throw new Error('A lead with this email already exists');
      }
    }

    // Recalculate score if factors changed
    const source = (data.source as LeadSource) || lead.source;
    const priority = (data.priority as Priority) || lead.priority;
    const phone = data.phone !== undefined ? (data.phone as string) : lead.phone;
    const website = data.website !== undefined ? (data.website as string) : lead.website;
    const company = data.company !== undefined ? (data.company as string) : lead.company;

    const score = this.calculateLeadScore({
      source,
      priority,
      phone,
      website,
      company,
    });

    const updated = await leadRepository.update(id, {
      ...data,
      score,
    });

    // Detect status change
    if (data.status && data.status !== lead.status) {
      await activityRepository.create({
        leadId: id,
        userId,
        action: 'STATUS_CHANGED',
        metadata: {
          old: lead.status,
          new: updated.status,
        },
      });
    }

    // Detect priority change
    if (data.priority && data.priority !== lead.priority) {
      await activityRepository.create({
        leadId: id,
        userId,
        action: 'PRIORITY_CHANGED',
        metadata: {
          old: lead.priority,
          new: updated.priority,
        },
      });
    }

    return updated;
  }

  async deleteLead(userId: string, id: string): Promise<void> {
    const lead = await leadRepository.findById(id);
    if (!lead) {
      throw new Error('Lead not found');
    }

    await leadRepository.delete(id);
  }

  async assignLead(userId: string, id: string, assignedToId: string | null): Promise<Lead> {
    const lead = await leadRepository.findById(id);
    if (!lead) {
      throw new Error('Lead not found');
    }

    let assigneeName = 'Unassigned';
    if (assignedToId) {
      const assignee = await userRepository.findById(assignedToId);
      if (!assignee) {
        throw new Error('Assignee user not found');
      }
      assigneeName = assignee.name;
    }

    const updated = await leadRepository.update(id, {
      assignedToId,
    });

    await activityRepository.create({
      leadId: id,
      userId,
      action: 'ASSIGNED',
      metadata: {
        assignedToId,
        assigneeName,
      },
    });

    return updated;
  }

  async capturePublicLead(data: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    website?: string;
    source?: LeadSource;
    message?: string;
  }): Promise<Lead> {
    const existing = await leadRepository.findByEmail(data.email);
    if (existing) {
      throw new Error('A lead with this email address has already been submitted');
    }

    // Default values for public lead
    const priority = Priority.MEDIUM;
    const source = data.source || LeadSource.WEBSITE;

    const score = this.calculateLeadScore({
      source,
      priority,
      phone: data.phone,
      website: data.website,
      company: data.company,
    });

    // Create lead with unassigned status
    const lead = await leadRepository.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      website: data.website,
      source,
      priority,
      status: LeadStatus.NEW,
      score,
    });

    // Find a user to attribute this action to (typically the first admin or sales rep)
    const users = await userRepository.findAll();
    const systemUser = users.find((u) => u.role === 'ADMIN') || users[0];

    if (systemUser) {
      await activityRepository.create({
        leadId: lead.id,
        userId: systemUser.id,
        action: 'LEAD_CREATED',
        metadata: {
          name: lead.name,
          company: lead.company,
          source: lead.source,
          isPublicForm: true,
          message: data.message,
        },
      });
    }

    return lead;
  }
}
