import { prisma } from '../config/prisma.js';
import { Prisma, Lead, LeadStatus, Priority, LeadSource } from '@prisma/client';

export interface LeadFilterOptions {
  status?: LeadStatus;
  priority?: Priority;
  source?: LeadSource;
  assignedToId?: string | null;
  search?: string;
  archived?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class LeadRepository {
  async findById(id: string): Promise<Lead | null> {
    return prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
  }

  async findByEmail(email: string): Promise<Lead | null> {
    return prisma.lead.findUnique({
      where: { email }
    });
  }

  async create(data: Prisma.LeadUncheckedCreateInput): Promise<Lead> {
    return prisma.lead.create({
      data
    });
  }

  async update(id: string, data: Prisma.LeadUncheckedUpdateInput): Promise<Lead> {
    return prisma.lead.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<Lead> {
    return prisma.lead.delete({
      where: { id }
    });
  }

  async findAll(options: LeadFilterOptions): Promise<{ leads: Lead[]; total: number }> {
    const {
      status,
      priority,
      source,
      assignedToId,
      search,
      archived = false,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = options;

    const skip = (page - 1) * limit;

    // Build Prisma query condition
    const where: Prisma.LeadWhereInput = {
      archived,
    };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (source) where.source = source;
    if (assignedToId !== undefined) where.assignedToId = assignedToId;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.LeadOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true, role: true }
          },
          createdBy: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      }),
      prisma.lead.count({ where }),
    ]);

    return { leads, total };
  }

  async aggregateStatus(): Promise<{ status: LeadStatus; _count: { id: number } }[]> {
    return prisma.lead.groupBy({
      by: ['status'],
      where: { archived: false },
      _count: { id: true }
    }) as any;
  }

  async aggregateSource(): Promise<{ source: LeadSource; _count: { id: number } }[]> {
    return prisma.lead.groupBy({
      by: ['source'],
      where: { archived: false },
      _count: { id: true }
    }) as any;
  }

  async getRecentActivityLogs(limit = 10) {
    return prisma.activityLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        lead: {
          select: { id: true, name: true, company: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }
}
