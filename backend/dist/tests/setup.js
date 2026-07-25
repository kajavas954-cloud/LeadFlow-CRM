import { jest } from '@jest/globals';
// Set dummy env variables for Jest execution
process.env.DATABASE_URL = 'postgresql://mock_user:mock_password@localhost:5432/mock_db';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
// Define the low-level mock client methods
export const mockPrisma = {
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        deleteMany: jest.fn(),
    },
    lead: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
        deleteMany: jest.fn(),
    },
    leadNote: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        deleteMany: jest.fn(),
    },
    activityLog: {
        create: jest.fn(),
        findMany: jest.fn(),
        deleteMany: jest.fn(),
    },
    $disconnect: jest.fn(),
};
// Mock the whole @prisma/client package
jest.mock('@prisma/client', () => {
    return {
        PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
        Role: {
            ADMIN: 'ADMIN',
            SALES_MEMBER: 'SALES_MEMBER',
        },
        LeadStatus: {
            NEW: 'NEW',
            CONTACTED: 'CONTACTED',
            QUALIFIED: 'QUALIFIED',
            PROPOSAL_SENT: 'PROPOSAL_SENT',
            NEGOTIATION: 'NEGOTIATION',
            WON: 'WON',
            LOST: 'LOST',
        },
        Priority: {
            LOW: 'LOW',
            MEDIUM: 'MEDIUM',
            HIGH: 'HIGH',
            URGENT: 'URGENT',
        },
        LeadSource: {
            WEBSITE: 'WEBSITE',
            REFERRAL: 'REFERRAL',
            LINKEDIN: 'LINKEDIN',
            COLD_EMAIL: 'COLD_EMAIL',
            FACEBOOK: 'FACEBOOK',
            INSTAGRAM: 'INSTAGRAM',
            GOOGLE_ADS: 'GOOGLE_ADS',
            OTHER: 'OTHER',
        },
    };
});
beforeEach(() => {
    // Reset all mock implementation histories
    jest.clearAllMocks();
    // Re-seed default mocks to avoid undefined errors during route validation
    mockPrisma.user.findUnique.mockReset();
    mockPrisma.user.create.mockReset();
    mockPrisma.user.update.mockReset();
    mockPrisma.user.findMany.mockReset();
    mockPrisma.lead.findUnique.mockReset();
    mockPrisma.lead.create.mockReset();
    mockPrisma.lead.update.mockReset();
    mockPrisma.lead.delete.mockReset();
    mockPrisma.lead.findMany.mockReset();
    mockPrisma.lead.count.mockReset();
    mockPrisma.lead.groupBy.mockReset();
    mockPrisma.leadNote.findUnique.mockReset();
    mockPrisma.leadNote.create.mockReset();
    mockPrisma.leadNote.delete.mockReset();
    mockPrisma.leadNote.findMany.mockReset();
    mockPrisma.activityLog.create.mockReset();
    mockPrisma.activityLog.findMany.mockReset();
});
