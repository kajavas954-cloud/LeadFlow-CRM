import { prisma } from '../config/prisma.js';
export class LeadRepository {
    async findById(id) {
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
    async findByEmail(email) {
        return prisma.lead.findUnique({
            where: { email }
        });
    }
    async create(data) {
        return prisma.lead.create({
            data
        });
    }
    async update(id, data) {
        return prisma.lead.update({
            where: { id },
            data
        });
    }
    async delete(id) {
        return prisma.lead.delete({
            where: { id }
        });
    }
    async findAll(options) {
        const { status, priority, source, assignedToId, search, archived = false, sortBy = 'updatedAt', sortOrder = 'desc', page = 1, limit = 10, } = options;
        const skip = (page - 1) * limit;
        // Build Prisma query condition
        const where = {
            archived,
        };
        if (status)
            where.status = status;
        if (priority)
            where.priority = priority;
        if (source)
            where.source = source;
        if (assignedToId !== undefined)
            where.assignedToId = assignedToId;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { company: { contains: search, mode: 'insensitive' } },
            ];
        }
        const orderBy = {
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
    async aggregateStatus() {
        return prisma.lead.groupBy({
            by: ['status'],
            where: { archived: false },
            _count: { id: true }
        });
    }
    async aggregateSource() {
        return prisma.lead.groupBy({
            by: ['source'],
            where: { archived: false },
            _count: { id: true }
        });
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
