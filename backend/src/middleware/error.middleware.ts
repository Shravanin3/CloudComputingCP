import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Handle Prisma known database errors
  if (err.code === 'P2002') {
    res.status(409).json({
      success: false,
      error: 'Conflict: Unique constraint violated on one or more fields',
      target: err.meta?.target,
    });
    return;
  }

  if (err.code === 'P2025') {
    res.status(404).json({
      success: false,
      error: 'Not Found: Record does not exist or access denied',
    });
    return;
  }

  if (err.status) {
    res.status(err.status).json({
      success: false,
      error: err.message,
    });
    return;
  }

  console.error('[Unhandled Error]:', err);

  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}
