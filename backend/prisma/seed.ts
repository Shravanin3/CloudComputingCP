import { PrismaClient, UserRole, SubscriptionTier, PaymentMethod, EntityType, ReferenceType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('========================================================================');
  console.log('[Seed] Populating Comprehensive Real-World MSME FinTech Dataset...');
  console.log('========================================================================');

  const passwordHash = await bcrypt.hash('password123', 12);

  // --------------------------------------------------------------------------
  // 1. TENANT A: "Shree Ganesh Kirana" (Primary Demo Shop)
  // --------------------------------------------------------------------------
  // Clean up any existing data if re-seeding
  const existingTenantA = await prisma.tenant.findFirst({
    where: { shopName: 'Shree Ganesh Kirana' },
  });

  if (existingTenantA) {
    console.log(`[Seed] Cleaning previous records for Tenant A (${existingTenantA.id})...`);
    await prisma.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${existingTenantA.id}'`);
    await prisma.tenant.delete({ where: { id: existingTenantA.id } });
  }

  const existingTenantB = await prisma.tenant.findFirst({
    where: { shopName: 'Sai Supermarket' },
  });

  if (existingTenantB) {
    console.log(`[Seed] Cleaning previous records for Tenant B (${existingTenantB.id})...`);
    await prisma.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${existingTenantB.id}'`);
    await prisma.tenant.delete({ where: { id: existingTenantB.id } });
  }

  // CREATE TENANT A
  const tenantA = await prisma.tenant.create({
    data: {
      shopName: 'Shree Ganesh Kirana',
      gstinNumber: '27AAAAA0000A1Z5',
      address: 'Shop No. 4, Shivaji Nagar, Pune, Maharashtra 411005',
      subscriptionTier: SubscriptionTier.PRO,
      users: {
        create: [
          {
            name: 'Ramesh Patil (Owner)',
            email: 'ramesh@ganeshkirana.com',
            passwordHash,
            role: UserRole.Owner,
          },
          {
            name: 'Suresh More (Cashier)',
            email: 'suresh@ganeshkirana.com',
            passwordHash,
            role: UserRole.Cashier,
          },
        ],
      },
    },
    include: { users: true },
  });
  console.log(`[Seed] Created Tenant A: ${tenantA.shopName} (${tenantA.id})`);

  // Inject Tenant A into PostgreSQL session so RLS permits inserting tenant data
  await prisma.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${tenantA.id}'`);

  // --------------------------------------------------------------------------
  // TENANT A: CATEGORIES
  // --------------------------------------------------------------------------
  const catGrains = await prisma.category.create({ data: { tenantId: tenantA.id, name: 'Grains & Pulses' } });
  const catOils = await prisma.category.create({ data: { tenantId: tenantA.id, name: 'Cooking Oils & Ghee' } });
  const catDairy = await prisma.category.create({ data: { tenantId: tenantA.id, name: 'Dairy & Eggs' } });
  const catSnacks = await prisma.category.create({ data: { tenantId: tenantA.id, name: 'Snacks & Biscuits' } });
  const catBeverages = await prisma.category.create({ data: { tenantId: tenantA.id, name: 'Tea & Coffee' } });
  const catCleaning = await prisma.category.create({ data: { tenantId: tenantA.id, name: 'Home & Personal Care' } });

  // --------------------------------------------------------------------------
  // TENANT A: 20 REALISTIC INDIAN FMCG & KIRANA PRODUCTS + INVENTORY
  // --------------------------------------------------------------------------
  const productsData = [
    // Grains
    { cat: catGrains.id, name: 'Aashirvaad Superior MP Shudh Chakki Atta 5kg', sku: 'AASH-ATTA-5KG', sell: 265, cost: 235, stock: 35 },
    { cat: catGrains.id, name: 'India Gate Basmati Rice Feast Rozzana 1kg', sku: 'IG-BASMATI-1KG', sell: 110, cost: 88, stock: 50 },
    { cat: catGrains.id, name: 'Tata Sampann Unpolished Toor Dal 1kg', sku: 'TATA-TOOR-1KG', sell: 185, cost: 155, stock: 40 },
    { cat: catGrains.id, name: 'Tata Salt Vacuum Evaporated 1kg', sku: 'TATA-SALT-1KG', sell: 28, cost: 22, stock: 85 },
    { cat: catGrains.id, name: 'Madhur Pure & Hygienic Sugar 1kg', sku: 'MADHUR-SUGAR-1K', sell: 52, cost: 44, stock: 60 },

    // Oils
    { cat: catOils.id, name: 'Fortune Sunlite Refined Sunflower Oil 1L Pouch', sku: 'FORT-SUN-1L', sell: 145, cost: 125, stock: 45 },
    { cat: catOils.id, name: 'Gemini Pure Filtered Groundnut Oil 1L', sku: 'GEM-GNDNUT-1L', sell: 195, cost: 172, stock: 30 },
    { cat: catOils.id, name: 'Amul Pure Ghee 500ml Tin', sku: 'AMUL-GHEE-500M', sell: 340, cost: 305, stock: 25 },

    // Dairy
    { cat: catDairy.id, name: 'Amul Taaza Homogenised Toned Milk 500ml', sku: 'AMUL-TAAZA-500', sell: 27, cost: 24.5, stock: 8 }, // Low stock (<10)
    { cat: catDairy.id, name: 'Amul Pasteurised Salted Butter 100g', sku: 'AMUL-BTR-100G', sell: 60, cost: 52, stock: 40 },
    { cat: catDairy.id, name: 'Gowardhan Fresh Paneer Classic 200g', sku: 'GOW-PANEER-200', sell: 95, cost: 82, stock: 15 },

    // Snacks
    { cat: catSnacks.id, name: 'Maggi 2-Minute Masala Instant Noodles 70g', sku: 'MAGGI-70G-MAS', sell: 14, cost: 11.8, stock: 120 },
    { cat: catSnacks.id, name: 'Parle-G Original Gluco Biscuits 250g', sku: 'PARLEG-250G', sell: 30, cost: 25, stock: 90 },
    { cat: catSnacks.id, name: 'Britannia Good Day Butter Cookies 200g', sku: 'GD-BUTTER-200G', sell: 45, cost: 37, stock: 55 },
    { cat: catSnacks.id, name: "Lay's India's Magic Masala Potato Chips 50g", sku: 'LAYS-MASALA-50', sell: 20, cost: 16.5, stock: 65 },

    // Beverages
    { cat: catBeverages.id, name: 'Tata Tea Gold Leaf Tea 500g', sku: 'TATA-TEA-500G', sell: 310, cost: 265, stock: 25 },
    { cat: catBeverages.id, name: 'Nescafé Classic Instant Coffee Glass Jar 50g', sku: 'NESCAFE-50G', sell: 190, cost: 160, stock: 6 }, // Low stock (<10)

    // Cleaning & Personal Care
    { cat: catCleaning.id, name: 'Surf Excel Easy Wash Detergent Powder 1kg', sku: 'SURF-EXCEL-1KG', sell: 140, cost: 118, stock: 35 },
    { cat: catCleaning.id, name: 'Colgate Strong Teeth Dental Cream Toothpaste 200g', sku: 'COLGATE-200G', sell: 125, cost: 102, stock: 40 },
    { cat: catCleaning.id, name: 'Dettol Original Germ Protection Bathing Soap 125g', sku: 'DETTOL-125G', sell: 55, cost: 44, stock: 50 },
  ];

  const createdProducts: any[] = [];
  for (const item of productsData) {
    const prod = await prisma.product.create({
      data: {
        tenantId: tenantA.id,
        categoryId: item.cat,
        name: item.name,
        sku: item.sku,
        sellingPrice: item.sell,
        costPrice: item.cost,
        inventory: {
          create: {
            tenantId: tenantA.id,
            stockQuantity: item.stock,
          },
        },
      },
    });
    createdProducts.push({ ...prod, stock: item.stock });
  }
  console.log(`[Seed] Created ${createdProducts.length} real-world products with inventory for Tenant A`);

  // --------------------------------------------------------------------------
  // TENANT A: CUSTOMERS WITH UDHAAR (CREDIT) BALANCES
  // --------------------------------------------------------------------------
  const customer1 = await prisma.customer.create({
    data: {
      tenantId: tenantA.id,
      name: 'Amit Kulkarni',
      phone: '9822012345',
      creditBalance: 1450.00, // Pending Udhaar
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      tenantId: tenantA.id,
      name: 'Sunita Deshmukh',
      phone: '9850123456',
      creditBalance: 850.00, // Pending Udhaar
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      tenantId: tenantA.id,
      name: 'Rahul Shinde',
      phone: '9765432109',
      creditBalance: 0.00, // No debt
    },
  });

  const customer4 = await prisma.customer.create({
    data: {
      tenantId: tenantA.id,
      name: 'Priya Joshi',
      phone: '9890987654',
      creditBalance: 3200.00, // Large Udhaar
    },
  });
  console.log('[Seed] Created 4 regular customers with udhaar (credit balances)');

  // --------------------------------------------------------------------------
  // TENANT A: SUPPLIERS (DISTRIBUTORS) WITH PAYABLE BALANCES
  // --------------------------------------------------------------------------
  const supplier1 = await prisma.supplier.create({
    data: {
      tenantId: tenantA.id,
      name: 'Hindustan Unilever Pune Agency',
      phone: '02025531234',
      payableBalance: 18500.00, // Shop owes distributor
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      tenantId: tenantA.id,
      name: 'Amul Dairy Cooperative Pune',
      phone: '02026124567',
      payableBalance: 6200.00,
    },
  });

  const supplier3 = await prisma.supplier.create({
    data: {
      tenantId: tenantA.id,
      name: 'Parle Agro Wholesale Depot',
      phone: '02027456789',
      payableBalance: 9400.00,
    },
  });
  console.log('[Seed] Created 3 FMCG distributors with payable dues');

  // --------------------------------------------------------------------------
  // TENANT A: HISTORICAL POS SALES & BILLING (LAST 7 DAYS)
  // --------------------------------------------------------------------------
  // Sale 1: Cash sale
  const sale1 = await prisma.sale.create({
    data: {
      tenantId: tenantA.id,
      customerId: customer3.id,
      totalAmount: 434.00,
      taxAmount: 21.00,
      paymentMethod: PaymentMethod.CASH,
      saleDate: new Date(Date.now() - 6 * 24 * 3600 * 1000), // 6 days ago
      saleItems: {
        create: [
          { tenantId: tenantA.id, productId: createdProducts[0].id, quantity: 1, unitPrice: 265, lineTotal: 265 },
          { tenantId: tenantA.id, productId: createdProducts[11].id, quantity: 5, unitPrice: 14, lineTotal: 70 },
          { tenantId: tenantA.id, productId: createdProducts[3].id, quantity: 3, unitPrice: 28, lineTotal: 84 },
        ],
      },
    },
  });

  // Sale 2: UPI sale
  const sale2 = await prisma.sale.create({
    data: {
      tenantId: tenantA.id,
      customerId: null, // Walk-in customer
      totalAmount: 650.00,
      taxAmount: 32.00,
      paymentMethod: PaymentMethod.UPI,
      saleDate: new Date(Date.now() - 4 * 24 * 3600 * 1000), // 4 days ago
      saleItems: {
        create: [
          { tenantId: tenantA.id, productId: createdProducts[5].id, quantity: 2, unitPrice: 145, lineTotal: 290 },
          { tenantId: tenantA.id, productId: createdProducts[15].id, quantity: 1, unitPrice: 310, lineTotal: 310 },
          { tenantId: tenantA.id, productId: createdProducts[9].id, quantity: 1, unitPrice: 50, lineTotal: 50 },
        ],
      },
    },
  });

  // Sale 3: Credit Sale (Udhaar) to Amit Kulkarni
  const sale3 = await prisma.sale.create({
    data: {
      tenantId: tenantA.id,
      customerId: customer1.id,
      totalAmount: 845.00,
      taxAmount: 40.00,
      paymentMethod: PaymentMethod.CREDIT,
      saleDate: new Date(Date.now() - 2 * 24 * 3600 * 1000), // 2 days ago
      saleItems: {
        create: [
          { tenantId: tenantA.id, productId: createdProducts[2].id, quantity: 2, unitPrice: 185, lineTotal: 370 },
          { tenantId: tenantA.id, productId: createdProducts[6].id, quantity: 1, unitPrice: 195, lineTotal: 195 },
          { tenantId: tenantA.id, productId: createdProducts[17].id, quantity: 2, unitPrice: 140, lineTotal: 280 },
        ],
      },
    },
  });

  // Sale 4: Today's High-Velocity UPI Sale
  const sale4 = await prisma.sale.create({
    data: {
      tenantId: tenantA.id,
      customerId: customer4.id,
      totalAmount: 1120.00,
      taxAmount: 55.00,
      paymentMethod: PaymentMethod.UPI,
      saleDate: new Date(), // Today
      saleItems: {
        create: [
          { tenantId: tenantA.id, productId: createdProducts[7].id, quantity: 2, unitPrice: 340, lineTotal: 680 },
          { tenantId: tenantA.id, productId: createdProducts[16].id, quantity: 2, unitPrice: 190, lineTotal: 380 },
          { tenantId: tenantA.id, productId: createdProducts[8].id, quantity: 2, unitPrice: 30, lineTotal: 60 },
        ],
      },
    },
  });
  console.log('[Seed] Created historical and today POS sales transactions');

  // --------------------------------------------------------------------------
  // TENANT A: PROCUREMENT PURCHASES (FROM DISTRIBUTORS)
  // --------------------------------------------------------------------------
  const purchase1 = await prisma.purchase.create({
    data: {
      tenantId: tenantA.id,
      supplierId: supplier1.id,
      totalAmount: 14200.00,
      purchaseDate: new Date(Date.now() - 10 * 24 * 3600 * 1000),
      purchaseItems: {
        create: [
          { tenantId: tenantA.id, productId: createdProducts[17].id, quantity: 50, unitCost: 118, lineTotal: 5900 },
          { tenantId: tenantA.id, productId: createdProducts[18].id, quantity: 50, unitCost: 102, lineTotal: 5100 },
          { tenantId: tenantA.id, productId: createdProducts[19].id, quantity: 75, unitCost: 44, lineTotal: 3200 },
        ],
      },
    },
  });

  const purchase2 = await prisma.purchase.create({
    data: {
      tenantId: tenantA.id,
      supplierId: supplier2.id,
      totalAmount: 9600.00,
      purchaseDate: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      purchaseItems: {
        create: [
          { tenantId: tenantA.id, productId: createdProducts[7].id, quantity: 20, unitCost: 305, lineTotal: 6100 },
          { tenantId: tenantA.id, productId: createdProducts[9].id, quantity: 50, unitCost: 52, lineTotal: 2600 },
          { tenantId: tenantA.id, productId: createdProducts[10].id, quantity: 10, unitCost: 82, lineTotal: 900 },
        ],
      },
    },
  });
  console.log('[Seed] Created incoming distributor purchase invoices');

  // --------------------------------------------------------------------------
  // TENANT A: OPERATING EXPENSES
  // --------------------------------------------------------------------------
  await prisma.expense.createMany({
    data: [
      {
        tenantId: tenantA.id,
        amount: 15000.00,
        category: 'Rent',
        description: 'Monthly shop premise rent for Shivaji Nagar store',
        expenseDate: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      },
      {
        tenantId: tenantA.id,
        amount: 3850.00,
        category: 'Electricity',
        description: 'MSEDCL electricity bill (refrigerators & shop lighting)',
        expenseDate: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      },
      {
        tenantId: tenantA.id,
        amount: 8000.00,
        category: 'Salaries',
        description: 'Monthly salary for shop helper and delivery boy',
        expenseDate: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      },
      {
        tenantId: tenantA.id,
        amount: 450.00,
        category: 'Municipal Tax',
        description: 'PMC trade license and shop sanitation charges',
        expenseDate: new Date(),
      },
    ],
  });
  console.log('[Seed] Created operating expenses (Rent, Electricity, Salaries)');

  // --------------------------------------------------------------------------
  // TENANT A: UNIFIED DOUBLE-ENTRY LEDGER TRANSACTIONS
  // --------------------------------------------------------------------------
  await prisma.transaction.createMany({
    data: [
      {
        tenantId: tenantA.id,
        entityType: EntityType.CUSTOMER,
        entityId: customer1.id,
        amount: 845.00, // Credit added
        referenceType: ReferenceType.SALE,
        referenceId: sale3.id,
        createdAt: sale3.saleDate,
      },
      {
        tenantId: tenantA.id,
        entityType: EntityType.SUPPLIER,
        entityId: supplier1.id,
        amount: -14200.00, // Payable incurred
        referenceType: ReferenceType.PURCHASE,
        referenceId: purchase1.id,
        createdAt: purchase1.purchaseDate,
      },
      {
        tenantId: tenantA.id,
        entityType: EntityType.SUPPLIER,
        entityId: supplier2.id,
        amount: -9600.00,
        referenceType: ReferenceType.PURCHASE,
        referenceId: purchase2.id,
        createdAt: purchase2.purchaseDate,
      },
    ],
  });
  console.log('[Seed] Populated double-entry ledger transactions');

  // --------------------------------------------------------------------------
  // 2. TENANT B: "Sai Supermarket" (Separate Tenant for Isolation Testing)
  // --------------------------------------------------------------------------
  const tenantB = await prisma.tenant.create({
    data: {
      shopName: 'Sai Supermarket',
      gstinNumber: '27BBBBB1111B1Z2',
      address: 'Plot 12, Kothrud, Pune, Maharashtra 411038',
      subscriptionTier: SubscriptionTier.ENTERPRISE,
      users: {
        create: [
          {
            name: 'Pooja Sharma (Owner)',
            email: 'pooja@saisupermarket.com',
            passwordHash,
            role: UserRole.Owner,
          },
        ],
      },
    },
    include: { users: true },
  });

  await prisma.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${tenantB.id}'`);

  const catB1 = await prisma.category.create({ data: { tenantId: tenantB.id, name: 'Beverages' } });
  const catB2 = await prisma.category.create({ data: { tenantId: tenantB.id, name: 'Packaged Foods' } });

  await prisma.product.create({
    data: {
      tenantId: tenantB.id,
      categoryId: catB1.id,
      name: 'Red Bull Energy Drink 250ml',
      sku: 'REDBULL-250',
      sellingPrice: 125,
      costPrice: 98,
      inventory: { create: { tenantId: tenantB.id, stockQuantity: 50 } },
    },
  });

  await prisma.product.create({
    data: {
      tenantId: tenantB.id,
      categoryId: catB2.id,
      name: 'Kellogg’s Corn Flakes Original 500g',
      sku: 'KELLOGGS-500',
      sellingPrice: 195,
      costPrice: 162,
      inventory: { create: { tenantId: tenantB.id, stockQuantity: 30 } },
    },
  });

  console.log(`[Seed] Created Tenant B (${tenantB.shopName}) with isolated catalog`);

  console.log('\n========================================================================');
  console.log('[Seed] DATABASE POPULATION COMPLETED SUCCESSFULLY!');
  console.log('========================================================================');
  console.log('--- Summary of Populated Data ---');
  console.log('• 2 Independent Shops (Tenants)');
  console.log('• 3 Registered Users (Owners & Cashier)');
  console.log('• 8 Categories (Grains, Oils, Dairy, Snacks, Cleaning, Beverages)');
  console.log('• 22 Distinct Retail Products with real SKUs and stock tracking');
  console.log('• 4 Customers with real Udhaar (credit) balances');
  console.log('• 3 FMCG Distributors with payable balances');
  console.log('• 4 POS Sales (Cash, UPI, Credit)');
  console.log('• 2 Procurement Purchase Invoices');
  console.log('• 4 Operating Expenses (Rent, Electricity, Salaries)');
  console.log('• Double-entry journal entries in Transactions ledger');
  console.log('------------------------------------------------------------------------');
  console.log('Demo Login Credentials:');
  console.log('  Tenant A (Owner):   ramesh@ganeshkirana.com | password123');
  console.log('  Tenant A (Cashier): suresh@ganeshkirana.com | password123');
  console.log('  Tenant B (Owner):   pooja@saisupermarket.com | password123');
  console.log('========================================================================');
}

main()
  .catch((e) => {
    console.error('[Seed Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
