import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { AuthenticatedUser } from '../types/express';
import { UserRole } from '@prisma/client';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing or malformed Authorization header with Bearer token',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthenticatedUser;

    if (!decoded.tenantId || !decoded.userId || !decoded.role) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid token payload structure',
      });
      return;
    }

    // Attach verified user and tenant context to request
    req.user = decoded;
    req.tenantId = decoded.tenantId;

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Session expired, please login again',
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or tampered token',
    });
  }
}

/**
 * Role-Based Access Control (RBAC) Guard
 * Restricts access to endpoints based on user role (Owner, Admin, Cashier)
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Forbidden: Access requires one of [${allowedRoles.join(', ')}] permissions. Current role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
}
