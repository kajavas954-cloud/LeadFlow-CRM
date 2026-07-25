import { z } from 'zod';
import { LeadStatus, Priority, LeadSource, Role } from '@prisma/client';
export const RegisterSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.nativeEnum(Role).optional(),
});
export const LoginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});
export const CreateLeadSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional().nullable(),
    company: z.string().optional().nullable(),
    website: z.string().url('Invalid website URL').or(z.string().length(0)).optional().nullable(),
    source: z.nativeEnum(LeadSource).optional(),
    industry: z.string().optional().nullable(),
    priority: z.nativeEnum(Priority).optional(),
    status: z.nativeEnum(LeadStatus).optional(),
    assignedToId: z.string().uuid('Invalid assignee User ID').or(z.string().length(0)).optional().nullable(),
});
export const UpdateLeadSchema = CreateLeadSchema.partial();
export const AssignLeadSchema = z.object({
    assignedToId: z.string().uuid('Invalid assignee User ID').nullable().or(z.literal('')),
});
export const CreateNoteSchema = z.object({
    note: z.string().min(1, 'Note content cannot be empty'),
});
export const PublicLeadSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    company: z.string().optional(),
    website: z.string().optional(),
    source: z.nativeEnum(LeadSource).optional(),
    message: z.string().optional(),
    captchaAnswer: z.string().optional(),
    captchaExpected: z.string().optional(),
    honeypot: z.string().optional(),
});
