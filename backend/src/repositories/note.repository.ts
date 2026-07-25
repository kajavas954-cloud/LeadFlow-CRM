import { prisma } from '../config/prisma.js';
import { Prisma, LeadNote } from '@prisma/client';

export class NoteRepository {
  async findById(id: string): Promise<LeadNote | null> {
    return prisma.leadNote.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.LeadNoteUncheckedCreateInput): Promise<LeadNote> {
    return prisma.leadNote.create({
      data,
      include: {
        author: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
  }

  async findByLeadId(leadId: string): Promise<LeadNote[]> {
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

  async delete(id: string): Promise<LeadNote> {
    return prisma.leadNote.delete({
      where: { id }
    });
  }
}
