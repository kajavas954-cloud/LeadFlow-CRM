import { prisma } from '../config/prisma.js';
export class UserRepository {
    async findById(id) {
        return prisma.user.findUnique({
            where: { id },
        });
    }
    async findByEmail(email) {
        return prisma.user.findUnique({
            where: { email },
        });
    }
    async create(data) {
        return prisma.user.create({
            data,
        });
    }
    async updateRefreshToken(id, refreshToken) {
        return prisma.user.update({
            where: { id },
            data: { refreshToken },
        });
    }
    async findAll() {
        return prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
    }
}
