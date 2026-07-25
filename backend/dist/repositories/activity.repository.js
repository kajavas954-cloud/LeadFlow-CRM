import { prisma } from '../config/prisma.js';
export class ActivityRepository {
    async create(data) {
        return prisma.activityLog.create({
            data,
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true }
                }
            }
        });
    }
    async findByLeadId(leadId) {
        return prisma.activityLog.findMany({
            where: { leadId },
            orderBy: { timestamp: 'desc' },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true }
                }
            }
        });
    }
    async findAll(limit = 50) {
        return prisma.activityLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: limit,
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true }
                },
                lead: {
                    select: { id: true, name: true, company: true }
                }
            }
        });
    }
}
