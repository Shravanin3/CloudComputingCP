import { GlobalStore } from '../mock/store';

async function runMockIntegrationTests() {
  console.log('===============================================================');
  console.log('STARTING PROJECT-WIDE MOCK STORE & CRUD INTEGRATION TESTS');
  console.log('===============================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? '(' + detail + ')' : ''}`);
      failed++;
    }
  }

  try {
    // -----------------------------------------------------------------
    // TEST 1: Initial Seed State & Category Contract
    // -----------------------------------------------------------------
    console.log('\n--- Test 1: Category & Product Initial Reads ---');
    const categories = GlobalStore.categories;
    assert(categories.length >= 6, 'Categories list returns seed categories', `Found ${categories.length}`);

    const initialProducts = GlobalStore.getProducts();
    assert(initialProducts.length >= 6, 'Product catalog returns active products', `Found ${initialProducts.length}`);

    const initialInventory = GlobalStore.getInventory();
    assert(initialInventory.length === initialProducts.length, 'Inventory count matches product count', `Inv: ${initialInventory.length}, Prods: ${initialProducts.length}`);

    // -----------------------------------------------------------------
    // TEST 2: Product Creation & Cross-Module Inventory Sync
    // -----------------------------------------------------------------
    console.log('\n--- Test 2: Product Creation & Cross-Module Sync ---');
    const newProd = GlobalStore.addProduct({
      name: 'Haldiram Bhujia 400g',
      sku: 'HB-400',
      categoryId: 'cat-5',
      sellingPrice: 110,
      costPrice: 90,
      stock: 35,
    } as any);

    assert(Boolean(newProd.id), 'Created product has valid ID', newProd.id);
    assert(newProd.name === 'Haldiram Bhujia 400g', 'Created product has correct name');

    const prodsAfterCreate = GlobalStore.getProducts();
    const createdInList = prodsAfterCreate.find((p) => p.id === newProd.id);
    assert(Boolean(createdInList), 'Newly created product appears in getProducts()');

    const invAfterCreate = GlobalStore.getInventory();
    const createdInInv = invAfterCreate.find((i) => i.productId === newProd.id);
    assert(Boolean(createdInInv), 'Newly created product appears in getInventory()');
    assert(createdInInv?.stockQuantity === 35, 'Initial stock correctly set in inventory', `Stock: ${createdInInv?.stockQuantity}`);

    // -----------------------------------------------------------------
    // TEST 3: Inventory Restock & Stock Level Reflection
    // -----------------------------------------------------------------
    console.log('\n--- Test 3: Inventory Restock ---');
    GlobalStore.restock(newProd.id, 15);

    const invAfterRestock = GlobalStore.getInventory();
    const restockedItem = invAfterRestock.find((i) => i.productId === newProd.id);
    assert(restockedItem?.stockQuantity === 50, 'Restocking adds 15 units (35 + 15 = 50)', `Current: ${restockedItem?.stockQuantity}`);

    const prodsAfterRestock = GlobalStore.getProducts();
    const prodRestocked = prodsAfterRestock.find((p) => p.id === newProd.id);
    assert(prodRestocked?.stock === 50, 'Product catalog view shows updated stock of 50', `Current: ${prodRestocked?.stock}`);

    // -----------------------------------------------------------------
    // TEST 4: Product Update & Deactivation
    // -----------------------------------------------------------------
    console.log('\n--- Test 4: Product Update & Soft Deactivation ---');
    GlobalStore.updateProduct(newProd.id, { sellingPrice: 120 });
    const prodsAfterUpdate = GlobalStore.getProducts();
    const updatedProd = prodsAfterUpdate.find((p) => p.id === newProd.id);
    assert(updatedProd?.sellingPrice === 120, 'Product update persisted updated price to 120');

    GlobalStore.deleteProduct(newProd.id);
    const prodsAfterDelete = GlobalStore.getProducts();
    const deletedInList = prodsAfterDelete.find((p) => p.id === newProd.id);
    assert(!deletedInList, 'Deactivated product is excluded from active catalog');

    // -----------------------------------------------------------------
    // TEST 5: POS Sale (CASH) & Stock Decrement
    // -----------------------------------------------------------------
    console.log('\n--- Test 5: POS Cash Sale & Inventory Decrement ---');
    // We use prod-1 (Parle-G, sellingPrice 25, current stock 60)
    const parleGBefore = GlobalStore.getProducts().find((p) => p.id === 'prod-1')!;
    const stockBeforeSale = parleGBefore.stock!;

    const cashSale = GlobalStore.createSale({
      paymentMethod: 'CASH',
      items: [{ productId: 'prod-1', quantity: 10 }],
    });

    assert(Boolean(cashSale.id), 'Sale record created with ID', cashSale.id);
    assert(cashSale.totalAmount === 250, 'Cash sale total computed accurately (10 * 25 = 250)', `Total: ${cashSale.totalAmount}`);
    assert(cashSale.saleItems.length === 1, 'Sale record contains line items');
    assert(cashSale.saleItems[0].lineTotal === 250, 'Line total matches unit price * qty');

    const parleGAfter = GlobalStore.getProducts().find((p) => p.id === 'prod-1')!;
    assert(parleGAfter.stock === stockBeforeSale - 10, `Stock decremented from ${stockBeforeSale} to ${parleGAfter.stock}`);

    const allSales = GlobalStore.sales;
    const foundSale = allSales.find((s) => s.id === cashSale.id);
    assert(Boolean(foundSale), 'Sale appears in GlobalStore.sales history');

    // -----------------------------------------------------------------
    // TEST 6: POS Credit Sale & Customer Balance Update
    // -----------------------------------------------------------------
    console.log('\n--- Test 6: POS Credit Sale (Khata/Udhaar) ---');
    const custRamesh = GlobalStore.customers.find((c) => c.id === 'cust-1')!;
    const rameshBalanceBefore = custRamesh.creditBalance;

    const creditSale = GlobalStore.createSale({
      customerId: 'cust-1',
      paymentMethod: 'CREDIT',
      items: [{ productId: 'prod-2', quantity: 5 }], // Tata Salt (28 * 5 = 140)
    });

    assert(creditSale.totalAmount === 140, 'Credit sale total computed accurately (5 * 28 = 140)', `Total: ${creditSale.totalAmount}`);
    assert(creditSale.paymentMethod === 'CREDIT', 'Sale recorded with CREDIT method');

    const custRameshAfter = GlobalStore.customers.find((c) => c.id === 'cust-1')!;
    assert(
      custRameshAfter.creditBalance === rameshBalanceBefore + 140,
      `Customer credit balance increased by 140 (${rameshBalanceBefore} -> ${custRameshAfter.creditBalance})`
    );

    // -----------------------------------------------------------------
    // TEST 7: Customer Payment Reception
    // -----------------------------------------------------------------
    console.log('\n--- Test 7: Customer Payment (Receiving Dues) ---');
    const balanceBeforePayment = custRameshAfter.creditBalance;
    GlobalStore.receiveCustomerPayment('cust-1', 500);

    const custRameshPaid = GlobalStore.customers.find((c) => c.id === 'cust-1')!;
    assert(
      custRameshPaid.creditBalance === balanceBeforePayment - 500,
      `Customer credit balance reduced by 500 payment (${balanceBeforePayment} -> ${custRameshPaid.creditBalance})`
    );

    // -----------------------------------------------------------------
    // TEST 8: Customer & Supplier CRUD
    // -----------------------------------------------------------------
    console.log('\n--- Test 8: Customers & Suppliers CRUD ---');
    const newCust = GlobalStore.addCustomer({ name: 'Vikas Deshmukh', phone: '9822998877' });
    assert(Boolean(newCust.id), 'Created customer with ID', newCust.id);

    GlobalStore.updateCustomer(newCust.id, { phone: '9822998800' });
    const updatedCust = GlobalStore.customers.find((c) => c.id === newCust.id);
    assert(updatedCust?.phone === '9822998800', 'Customer phone updated successfully');

    const newSup = GlobalStore.addSupplier({ name: 'Satara Spices Trading Co', phone: '9860112233' });
    assert(Boolean(newSup.id), 'Created supplier with ID', newSup.id);

    GlobalStore.updateSupplier(newSup.id, { phone: '9860112299' });
    const updatedSup = GlobalStore.suppliers.find((s) => s.id === newSup.id);
    assert(updatedSup?.phone === '9860112299', 'Supplier phone updated successfully');

    // -----------------------------------------------------------------
    // TEST 9: Supplier Payment & Expense Integration
    // -----------------------------------------------------------------
    console.log('\n--- Test 9: Supplier Payment & Automatic Expense Entry ---');
    const supPune = GlobalStore.suppliers.find((s) => s.id === 'sup-1')!;
    const supDebtBefore = supPune.payableBalance;
    const expCountBefore = GlobalStore.expenses.length;

    GlobalStore.recordSupplierPayment('sup-1', 2500);

    const supPuneAfter = GlobalStore.suppliers.find((s) => s.id === 'sup-1')!;
    assert(
      supPuneAfter.payableBalance === supDebtBefore - 2500,
      `Supplier payable balance reduced by 2500 (${supDebtBefore} -> ${supPuneAfter.payableBalance})`
    );

    const expensesAfterSupPay = GlobalStore.expenses;
    assert(
      expensesAfterSupPay.length === expCountBefore + 1,
      'Supplier payment recorded an expense entry in expense ledger'
    );
    const supPayExp = expensesAfterSupPay.find((e) => e.description?.includes('Pune Wholesale'));
    assert(Boolean(supPayExp && supPayExp.amount === 2500), 'Logged expense has amount 2500 and description');

    // -----------------------------------------------------------------
    // TEST 10: General Expense Creation & Financial Reflection
    // -----------------------------------------------------------------
    console.log('\n--- Test 10: Shop Expense Recording ---');
    const generalExp = GlobalStore.addExpense({
      amount: 450,
      category: 'Packaging',
      description: 'Paper carry bags bundle',
    });
    assert(Boolean(generalExp.id), 'Created expense has valid ID', generalExp.id);

    const allExp = GlobalStore.expenses;
    const foundExp = allExp.find((e) => e.id === generalExp.id);
    assert(Boolean(foundExp), 'Expense appears in GlobalStore.expenses list');

    // -----------------------------------------------------------------
    // TEST 11: Cross-Module Dashboard & Reports Verification
    // -----------------------------------------------------------------
    console.log('\n--- Test 11: Dynamic Dashboard & Reports Calculations ---');
    const dashboard = GlobalStore.getDashboardSummary();
    assert(Number(dashboard.totalSales) > 0, `Dashboard totalSales is positive (₹${dashboard.totalSales})`);
    assert(Number(dashboard.activeProducts) >= 6, `Dashboard activeProducts reflects catalog (${dashboard.activeProducts})`);
    assert(Number(dashboard.pendingCredit) > 0, `Dashboard pendingCredit reflects customer balances (₹${dashboard.pendingCredit})`);

    const salesReport = GlobalStore.getSalesReport();
    assert(salesReport.totalSales === dashboard.totalSales, 'Sales report totalSales matches dashboard totalSales');
    assert(salesReport.numberOfSales === GlobalStore.sales.length, 'Sales report count matches total sales in store');
    assert(Number(salesReport.breakdownByPaymentMethod.cash) > 0, 'Sales report shows Cash breakdown');
    assert(Number(salesReport.breakdownByPaymentMethod.credit) > 0, 'Sales report shows Credit breakdown');

    const plReport = GlobalStore.getProfitLossReport();
    assert(plReport.revenue === salesReport.totalSales, 'P&L report revenue matches total sales');
    assert(plReport.grossProfit === plReport.revenue - plReport.cogs, 'P&L report: grossProfit = revenue - cogs');
    assert(plReport.netProfit === plReport.grossProfit - plReport.totalExpenses, 'P&L report: netProfit = grossProfit - expenses');
    assert(Number(plReport.totalExpenses) > 0, `P&L expenses is positive (₹${plReport.totalExpenses})`);

    // -----------------------------------------------------------------
    // TEST 12: Insufficient Stock Guard in POS
    // -----------------------------------------------------------------
    console.log('\n--- Test 12: Insufficient Stock Protection ---');
    let stockErrorThrown = false;
    try {
      GlobalStore.createSale({
        paymentMethod: 'CASH',
        items: [{ productId: 'prod-4', quantity: 99999 }], // Exceeds available stock
      });
    } catch (e: any) {
      stockErrorThrown = true;
    }
    assert(stockErrorThrown, 'Attempting to sell more than available stock is rejected with error');

  } catch (err) {
    console.error('[UNHANDLED TEST ERROR]:', err);
    failed++;
  }

  console.log('\n===============================================================');
  console.log(`MOCK INTEGRATION TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runMockIntegrationTests();
