const http = require('http');

// Test registration with unique username
async function testRegistration() {
    console.log('Testing user registration...');
    
    const userData = {
        username: 'testuser' + Date.now(), // Unique username
        email: 'testuser' + Date.now() + '@example.com', // Unique email
        password: 'password123'
    };
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(userData).length
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log('Registration response:', result);
                    resolve(result);
                } catch (error) {
                    console.error('Error parsing response:', error);
                    reject(error);
                }
            });
        });
        
        req.on('error', error => {
            console.error('Request error:', error);
            reject(error);
        });
        
        req.write(JSON.stringify(userData));
        req.end();
    });
}

// Test login
async function testLogin(username) {
    console.log('Testing user login...');
    
    const loginData = {
        username: username,
        password: 'password123'
    };
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(loginData).length
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log('Login response:', result);
                    resolve(result);
                } catch (error) {
                    console.error('Error parsing response:', error);
                    reject(error);
                }
            });
        });
        
        req.on('error', error => {
            console.error('Request error:', error);
            reject(error);
        });
        
        req.write(JSON.stringify(loginData));
        req.end();
    });
}

// Run tests
async function runTests() {
    try {
        console.log('🚀 Starting authentication tests...\n');
        
        // Test registration
        const regResult = await testRegistration();
        if (regResult.error) {
            console.log('❌ Registration failed:', regResult.error);
            return;
        }
        console.log('✅ Registration successful!\n');
        
        const username = regResult.user.username;
        
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test login
        const loginResult = await testLogin(username);
        if (loginResult.error) {
            console.log('❌ Login failed:', loginResult.error);
            return;
        }
        console.log('✅ Login successful!');
        console.log('User token:', loginResult.tokens?.access_token ? '✓ Token generated' : '✗ No token');
        
        console.log('\n🎉 All authentication tests passed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the tests
runTests();