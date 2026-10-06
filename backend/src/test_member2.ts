import { app } from './app';
import http from 'http';

async function runTests() {
  console.log('===============================================================');
  console.log('STARTING MEMBER 2 INTEGRATION & RLS VERIFICATION TESTS');
  console.log('===============================================================');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://localhost:${address.port}`;
  console.log(`[Test Runner] Test server listening on ${baseUrl}`);

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: Health Check Probe
    // -------------------------------------------------------------
    console.log('\n--- Test 1: Health Probe ---');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json() as any;
    assert(healthRes.status === 200, 'Health endpoint returns HTTP 200');
    assert(healthData.status === 'UP', 'Health status is UP');

    // -------------------------------------------------------------
    // TEST 2: Authentication & JWT Login (Tenant A Owner)
    // -------------------------------------------------------------
    console.log('\n--- Test 2: Login as Tenant A Owner ---');
    const loginResA = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ramesh@ganeshkirana.com',
        password: 'password123',
      }),
    });
    const loginDataA = await loginResA.json() as any;
    assert(loginResA.status === 200, 'Login returns HTTP 200');
    assert(typeof loginDataA.data?.token === 'string', 'Received signed JWT token');
    assert(loginDataA.data?.user?.role === 'Owner', 'User role is Owner');
    const tokenA = loginDataA.data?.token;

    // -------------------------------------------------------------
    // TEST 3: Authenticated /me Endpoint
    // -------------------------------------------------------------
    console.log('\n--- Test 3: Fetch /api/v1/me Profile ---');
    const meRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const meData = await meRes.json() as any;
    assert(meRes.status === 200, '/me returns HTTP 200');
    assert(meData.data?.tenant?.shopName === 'Shree Ganesh Kirana', 'Tenant shop name matches');

    // -------------------------------------------------------------
    // TEST 4: Tenant A Catalog Query
    // -------------------------------------------------------------
    console.log('\n--- Test 4: Query Products as Tenant A ---');
    const prodResA = await fetch(`${baseUrl}/api/v1/products`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const prodDataA = await prodResA.json() as any;
    assert(prodResA.status === 200, 'Products query returns HTTP 200');
    assert(prodDataA.data.length >= 2, `Tenant A sees its products (found ${prodDataA.data.length})`);
    const hasTataSalt = prodDataA.data.some((p: any) => p.name.includes('Tata Salt'));
    assert(hasTataSalt, 'Tenant A catalog contains "Tata Salt"');

    // -------------------------------------------------------------
    // TEST 5: Tenant B Isolation Verification (CRITICAL RLS TEST)
    // -------------------------------------------------------------
    console.log('\n--- Test 5: Login as Tenant B & Verify Strict Tenant Isolation ---');
    const loginResB = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'pooja@saisupermarket.com',
        password: 'password123',
      }),
    });
    const loginDataB = await loginResB.json() as any;
    const tokenB = loginDataB.data?.token;

    const prodResB = await fetch(`${baseUrl}/api/v1/products`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const prodDataB = await prodResB.json() as any;

    const tenantBCanSeeTataSalt = prodDataB.data.some((p: any) => p.name.includes('Tata Salt'));
    const tenantBSeesRedBull = prodDataB.data.some((p: any) => p.name.includes('Red Bull'));

    assert(!tenantBCanSeeTataSalt, 'TENANT ISOLATION: Tenant B CANNOT see Tenant A products (Tata Salt)!');
    assert(tenantBSeesRedBull, 'Tenant B sees its own product (Red Bull)');

    // -------------------------------------------------------------
    // TEST 6: Role-Based Access Control (RBAC) Guard Test
    // -------------------------------------------------------------
    console.log('\n--- Test 6: Verify RBAC Restrictions for Cashier ---');
    const loginResCashier = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'suresh@ganeshkirana.com',
        password: 'password123',
      }),
    });
    const cashierToken = (await loginResCashier.json() as any).data?.token;

    // Cashier attempts to create a product (Only Owner/Admin allowed)
    const cashierCreateRes = await fetch(`${baseUrl}/api/v1/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cashierToken}`,
      },
      body: JSON.stringify({
        name: 'Unauthorized Cashier Product',
        sellingPrice: 100,
        costPrice: 80,
      }),
    });
    assert(cashierCreateRes.status === 403, 'Cashier product creation is rejected with HTTP 403 Forbidden');

    // -------------------------------------------------------------
    // TEST 7: Atomic Shop & Owner Registration (POST /api/v1/auth/register)
    // -------------------------------------------------------------
    console.log('\n--- Test 7: New Tenant Onboarding & Registration ---');
    const randomSuffix = Math.floor(Math.random() * 10000);
    const registerRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shopName: `New Test Kirana ${randomSuffix}`,
        gstinNumber: '27CCCCC0000C1Z9',
        address: 'MG Road, Pune',
        name: 'Test Owner',
        email: `owner_${randomSuffix}@newkirana.com`,
        password: 'securepassword123',
      }),
    });
    const registerData = await registerRes.json() as any;
    if (registerRes.status !== 201) {
      console.log('    [Debug Register Error]:', registerRes.status, registerData);
    }
    assert(registerRes.status === 201, 'Registration returns HTTP 201 Created');
    assert(registerData.data?.tenant?.shopName === `New Test Kirana ${randomSuffix}`, 'Tenant created with correct name');
    assert(typeof registerData.data?.token === 'string', 'JWT token issued upon registration');

    // -------------------------------------------------------------
    // TEST 8: Invalid Credentials & Tampered Tokens Rejection
    // -------------------------------------------------------------
    console.log('\n--- Test 8: Security Edge Cases (Invalid pass & tampered token) ---');
    const badLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ramesh@ganeshkirana.com',
        password: 'wrong_password_attempt',
      }),
    });
    assert(badLoginRes.status === 401, 'Wrong password returns HTTP 401 Unauthorized');

    const tamperedRes = await fetch(`${baseUrl}/api/v1/products`, {
      headers: { Authorization: `Bearer ${tokenA}tampered_suffix` },
    });
    assert(tamperedRes.status === 401, 'Tampered JWT returns HTTP 401 Unauthorized');

  } finally {
    server.close();
  }

  console.log('\n===============================================================');
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('===============================================================');
  if (failed > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error('[Test Error]:', e);
  process.exit(1);
});
