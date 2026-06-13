const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const dataStr = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataStr)
      }
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(dataStr);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'GET',
      headers
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  const email = `test_${Math.floor(Math.random() * 100000)}@study.com`;
  console.log('Registering user with email:', email);
  try {
    const regRes = await post('/api/auth/register', {
      name: 'Test Student',
      email: email,
      password: 'password123'
    });
    console.log('Register status:', regRes.status, regRes.body);
    const regData = JSON.parse(regRes.body);
    const token = regData.token;

    console.log('Fetching progress with token:', token);
    const progRes = await get('/api/progress', token);
    console.log('Progress status:', progRes.status, progRes.body);
  } catch (err) {
    console.error('Error during run:', err);
  }
}

run();
