import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { ENV } from '../../config/env';
import { RegisterInput, LoginInput } from './auth.validation';
import { UserRole } from '@prisma/client';

export class AuthService {
  /**
   * Provisions a new shop (Tenant) and its first administrative User (Owner)
   * in a single atomic database transaction.
   */
  static async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      const error: any = new Error('Email already registered');
      error.status = 409;
      throw error;
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(input.password, saltRounds);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Tenant (Shop)
      const tenant = await tx.tenant.create({
        data: {
          shopName: input.shopName,
          gstinNumber: input.gstinNumber,
          address: input.address,
        },
      });

      // Inject tenant context so RLS permits creating tenant-scoped entities
      await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${tenant.id}'`);

      // 2. Create Initial Owner User
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: input.name,
          email: input.email.toLowerCase(),
          passwordHash,
          role: UserRole.Owner,
        },
      });

      // 3. Create Default Category
      await tx.category.create({
        data: {
          tenantId: tenant.id,
          name: 'General',
        },
      });

      return { tenant, user };
    });

    // 4. Generate Stateless JWT
    const token = this.generateToken(result.user.id, result.tenant.id, result.user.role, result.user.email);

    return {
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
      tenant: {
        id: result.tenant.id,
        shopName: result.tenant.shopName,
        gstinNumber: result.tenant.gstinNumber,
        address: result.tenant.address,
        subscriptionTier: result.tenant.subscriptionTier,
      },
    };
  }

  /**
   * Authenticates user credentials and returns signed JWT
   */
  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      include: { tenant: true },
    });

    if (!user) {
      const error: any = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      const error: any = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    const token = this.generateToken(user.id, user.tenantId, user.role, user.email);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tenant: {
        id: user.tenant.id,
        shopName: user.tenant.shopName,
        gstinNumber: user.tenant.gstinNumber,
        address: user.tenant.address,
        subscriptionTier: user.tenant.subscriptionTier,
      },
    };
  }

  /**
   * Retrieves profile of current authenticated user and shop
   */
  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user) {
      const error: any = new Error('User not found');
      error.status = 404;
      throw error;
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      tenant: {
        id: user.tenant.id,
        shopName: user.tenant.shopName,
        gstinNumber: user.tenant.gstinNumber,
        address: user.tenant.address,
        subscriptionTier: user.tenant.subscriptionTier,
      },
    };
  }

  private static generateToken(userId: string, tenantId: string, role: UserRole, email: string): string {
    return jwt.sign(
      { userId, tenantId, role, email },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );
  }
}
