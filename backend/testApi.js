const http = require('http');

const data = JSON.stringify({
  firebaseUid: 'test123456789',
  email: 'testtest@gmail.com',
  name: 'Test Test Name',
  role: 'ShopOwner',
  shopName: 'My Shop Test'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/sync',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseBody = '';
  res.on('data', (chunk) => responseBody += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'RESPONSE:', responseBody));
});

req.on('error', (e) => console.error(`problem with request: ${e.message}`));
req.write(data);
req.end();
