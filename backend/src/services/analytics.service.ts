import { prisma } from '../config/prisma.js';
import { LeadStatus } from '@prisma/client';

export interface AnalyticsSummary {
  totalLeads: number;
  conversionRate: number;
  statusCounts: Record<string, number>;
  sourceCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  topPerformers: {
    userId: string;
    userName: string;
    wonCount: number;
    totalAssigned: number;
  }[];
}

export class AnalyticsService {
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const totalLeads = await prisma.lead.count({
      where: { archived: false },
    });

    const wonLeads = await prisma.lead.count({
      where: {
        status: LeadStatus.WON,
        archived: false,
      },
    });

    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

    // Get counts by status
    const statusGroups = await prisma.lead.groupBy({
      by: ['status'],
      where: { archived: false },
      _count: { id: true },
    });

    const statusCounts: Record<string, number> = {};
    // Seed all statuses with 0
    Object.values(LeadStatus).forEach((status) => {
      statusCounts[status] = 0;
    });
    statusGroups.forEach((group) => {
      statusCounts[group.status] = group._count.id;
    });

    // Get counts by source
    const sourceGroups = await prisma.lead.groupBy({
      by: ['source'],
      where: { archived: false },
      _count: { id: true },
    });
    const sourceCounts: Record<string, number> = {};
    sourceGroups.forEach((group) => {
      sourceCounts[group.source] = group._count.id;
    });

    // Get counts by priority
    const priorityGroups = await prisma.lead.groupBy({
      by: ['priority'],
      where: { archived: false },
      _count: { id: true },
    });
    const priorityCounts: Record<string, number> = {};
    priorityGroups.forEach((group) => {
      priorityCounts[group.priority] = group._count.id;
    });

    // Get top sales reps by Won leads count
    const topSalesRepsData = await prisma.lead.groupBy({
      by: ['assignedToId'],
      where: {
        status: LeadStatus.WON,
        assignedToId: { not: null },
        archived: false,
      },
      _count: { id: true },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    const topPerformers = await Promise.all(
      topSalesRepsData.map(async (rep) => {
        const user = await prisma.user.findUnique({
          where: { id: rep.assignedToId! },
          select: { name: true },
        });

        // Also count total assigned to them
        const totalAssigned = await prisma.lead.count({
          where: {
            assignedToId: rep.assignedToId,
            archived: false,
          },
        });

        return {
          userId: rep.assignedToId!,
          userName: user?.name || 'Unknown',
          wonCount: rep._count.id,
          totalAssigned,
        };
      })
    );

    return {
      totalLeads,
      conversionRate,
      statusCounts,
      sourceCounts,
      priorityCounts,
      topPerformers,
    };
  }
}
