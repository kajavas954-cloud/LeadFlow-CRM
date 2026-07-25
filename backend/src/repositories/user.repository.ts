import { prisma } from '../config/prisma.js';
import { Prisma, Role, User } from '@prisma/client';

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
  }

  async findAll(): Promise<Omit<User, 'password' | 'refreshToken'>[]> {
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
