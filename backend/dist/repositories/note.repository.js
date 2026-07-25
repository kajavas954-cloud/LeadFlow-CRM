import { prisma } from '../config/prisma.js';
export class NoteRepository {
    async findById(id) {
        return prisma.leadNote.findUnique({
            where: { id },
        });
    }
    async create(data) {
        return prisma.leadNote.create({
            data,
            include: {
                author: {
                    select: { id: true, name: true, email: true, role: true }
                }
            }
        });
    }
    async findByLeadId(leadId) {
        return prisma.leadNote.findMany({
            where: { leadId },
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { id: true, name: true, email: true, role: true }
                }
            }
        });
    }
    async delete(id) {
        return prisma.leadNote.delete({
            where: { id }
        });
    }
}
