async function testUpdateTrade() {
  try {
    // Login first
    const loginResponse = await fetch('http://localhost:4000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@cfdtradingpro.com',
        password: 'admin123'
      })
    });
    const loginData = await loginResponse.json();
    const token = loginData.token;

    console.log('✅ Login successful');

    // Test updating a trade
    const updateResponse = await fetch('http://localhost:4000/api/admin/trades/1', {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'closed',
        result: 'win',
        exitPrice: 120.50,
        adminNotes: 'Closed trade - test'
      })
    });

    console.log('Update response status:', updateResponse.status);
    const updateData = await updateResponse.json();
    console.log('Update response:', JSON.stringify(updateData, null, 2));

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testUpdateTrade();
