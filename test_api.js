import http from 'http';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function test() {
  console.log('Testing API endpoints...\n');
  
  try {
    console.log('1️⃣  Testing GET /api/health');
    const health = await makeRequest('/api/health');
    console.log('   Status:', health.status);
    console.log('   Response:', health.data, '\n');
  } catch (e) {
    console.log('   Error:', e.message, '\n');
  }

  try {
    console.log('2️⃣  Testing GET /api/admin/transactions/deposits');
    const deposits = await makeRequest('/api/admin/transactions/deposits');
    console.log('   Status:', deposits.status);
    console.log('   Response:', deposits.data, '\n');
  } catch (e) {
    console.log('   Error:', e.message, '\n');
  }

  try {
    console.log('3️⃣  Testing GET /api/admin/transactions/withdrawals');
    const withdrawals = await makeRequest('/api/admin/transactions/withdrawals');
    console.log('   Status:', withdrawals.status);
    console.log('   Response:', withdrawals.data, '\n');
  } catch (e) {
    console.log('   Error:', e.message, '\n');
  }

  process.exit(0);
}

test();
