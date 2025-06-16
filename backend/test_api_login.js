import fetch from 'node-fetch';

async function testApiLogin() {
  try {
    const response = await fetch('http://localhost:3000/api_v1/api-users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },      body: JSON.stringify({
        username: 'apiuser',
        password: 'apiuser123'
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.token) {
      console.log('\n🎉 Login successful!');
      console.log('User has roles:', data.user?.roles?.length || 0);
      console.log('User has permissions:', data.user?.permissions?.length || 0);
    } else {
      console.log('❌ Login failed');
    }
  } catch (error) {
    console.error('Error testing login:', error);
  }
}

testApiLogin();
