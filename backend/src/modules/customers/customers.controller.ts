import { Request, Response, NextFunction } from 'express';
import { withTenantContext } from '../../config/database';
import { createCustomerSchema, updateCustomerSchema, receivePaymentSchema } from './customers.validation';

export class CustomerController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const search = req.query.search as string | undefined;

      const customers = await withTenantContext(tenantId, async (tx) => {
        return tx.customer.findMany({
          where: {
            tenantId,
            ...(search
              ? {
                  OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                  ],
                }
              : {}),
          },
          orderBy: { name: 'asc' },
        });
      });

      res.status(200).json({ success: true, count: customers.length, data: customers });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;

      const customer = await withTenantContext(tenantId, async (tx) => {
        return tx.customer.findFirst({
          where: { id, tenantId },
          include: {
            sales: {
              orderBy: { saleDate: 'desc' },
              take: 20,
              include: { saleItems: { include: { product: true } } },
            },
          },
        });
      });

      if (!customer) {
        res.status(404).json({ success: false, error: 'Customer not found' });
        return;
      }

      res.status(200).json({ success: true, data: customer });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const validated = createCustomerSchema.parse(req.body);

      const customer = await withTenantContext(tenantId, async (tx) => {
        return tx.customer.create({
          data: {
            tenantId,
            name: validated.name,
            phone: validated.phone,
            creditBalance: validated.creditBalance,
          },
        });
      });

      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: customer,
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const validated = updateCustomerSchema.parse(req.body);

      const updated = await withTenantContext(tenantId, async (tx) => {
        return tx.customer.update({
          where: { id, tenantId },
          data: validated,
        });
      });

      res.status(200).json({
        success: true,
        message: 'Customer updated successfully',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Record payment received from customer (reduces outstanding udhaar / credit balance)
   */
  static async receivePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const validated = receivePaymentSchema.parse(req.body);

      const result = await withTenantContext(tenantId, async (tx) => {
        const customer = await tx.customer.findFirst({
          where: { id, tenantId },
        });

        if (!customer) {
          throw new Error('Customer not found');
        }

        const newCreditBalance = Math.max(0, Number(customer.creditBalance) - validated.amount);

        // 1. Update customer credit balance
        const updatedCustomer = await tx.customer.update({
          where: { id, tenantId },
          data: { creditBalance: newCreditBalance },
        });

        // 2. Insert payment transaction into unified ledger
        const ledgerTransaction = await tx.transaction.create({
          data: {
            tenantId,
            entityType: 'CUSTOMER',
            entityId: id,
            amount: validated.amount, // Positive amount reduces receivable
            referenceType: 'PAYMENT',
            referenceId: id,
          },
        });

        return { customer: updatedCustomer, transaction: ledgerTransaction };
      });

      res.status(200).json({
        success: true,
        message: `Payment of ₹${validated.amount} recorded for ${result.customer.name}`,
        data: result,
      });
    } catch (err: any) {
      if (err.message === 'Customer not found') {
        res.status(404).json({ success: false, error: err.message });
        return;
      }
      next(err);
    }
  }
}
