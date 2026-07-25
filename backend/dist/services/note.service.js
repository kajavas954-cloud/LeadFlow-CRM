import { NoteRepository } from '../repositories/note.repository.js';
import { ActivityRepository } from '../repositories/activity.repository.js';
import { Role } from '@prisma/client';
const noteRepository = new NoteRepository();
const activityRepository = new ActivityRepository();
export class NoteService {
    async addNote(userId, leadId, noteContent) {
        if (!noteContent || noteContent.trim() === '') {
            throw new Error('Note content cannot be empty');
        }
        const note = await noteRepository.create({
            leadId,
            authorId: userId,
            note: noteContent,
        });
        await activityRepository.create({
            leadId,
            userId,
            action: 'NOTE_ADDED',
            metadata: {
                noteId: note.id,
                snippet: noteContent.substring(0, 50),
            },
        });
        return note;
    }
    async getNotes(leadId) {
        return noteRepository.findByLeadId(leadId);
    }
    async deleteNote(userId, userRole, noteId) {
        const note = await noteRepository.findById(noteId);
        if (!note) {
            throw new Error('Note not found');
        }
        // Authorization: Admin can delete any note, Sales Members can only delete their own notes
        if (userRole !== Role.ADMIN && note.authorId !== userId) {
            throw new Error('Unauthorized to delete this note');
        }
        await noteRepository.delete(noteId);
        // Write activity log for note deleted
        await activityRepository.create({
            leadId: note.leadId,
            userId,
            action: 'NOTE_DELETED',
            metadata: {
                noteId,
            },
        });
    }
}
