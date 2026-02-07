const http = require('http');

// Test registration with mobile number
async function testMobileRegistration() {
    console.log('📱 Testing registration with mobile number...\n');
    
    const testUser = {
        username: 'mobileuser' + Date.now(),
        mobile: '+91' + Math.floor(Math.random() * 10000000000),
        email: 'mobile' + Date.now() + '@example.com',
        password: 'password123'
    };
    
    console.log('Test user data:', testUser);
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(testUser).length
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
                    
                    if (res.statusCode === 201) {
                        console.log('✅ Mobile registration successful!');
                        console.log('User created with ID:', result.user.id);
                        console.log('Mobile:', result.user.mobile);
                        resolve(result);
                    } else {
                        console.log('❌ Mobile registration failed:', result.error);
                        reject(new Error(result.error));
                    }
                } catch (error) {
                    console.log('❌ Parse error:', error.message);
                    reject(error);
                }
            });
        });
        
        req.on('error', error => {
            console.log('❌ Request error:', error.message);
            reject(error);
        });
        
        req.write(JSON.stringify(testUser));
        req.end();
    });
}

// Test login with the registered user
async function testMobileLogin(username, password) {
    console.log('\n🔐 Testing login with mobile registered user...\n');
    
    const loginData = { username, password };
    
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
                    
                    if (res.statusCode === 200) {
                        console.log('✅ Mobile login successful!');
                        console.log('Access token generated:', result.tokens.access_token ? 'Yes' : 'No');
                        resolve(result);
                    } else {
                        console.log('❌ Mobile login failed:', result.error);
                        reject(new Error(result.error));
                    }
                } catch (error) {
                    console.log('❌ Parse error:', error.message);
                    reject(error);
                }
            });
        });
        
        req.on('error', error => {
            console.log('❌ Request error:', error.message);
            reject(error);
        });
        
        req.write(JSON.stringify(loginData));
        req.end();
    });
}

// Run the tests
async function runTests() {
    try {
        console.log('🚀 Starting mobile registration tests...\n');
        
        // Test registration
        const regResult = await testMobileRegistration();
        
        // Test login with the same credentials
        await testMobileLogin(regResult.user.username, 'password123');
        
        console.log('\n🎉 All mobile registration tests passed!');
        console.log('✅ Registration with mobile number is working correctly');
        console.log('✅ Login with mobile registered user is working correctly');
        
    } catch (error) {
        console.log('\n❌ Tests failed:', error.message);
    }
}

// Run the tests
runTests();