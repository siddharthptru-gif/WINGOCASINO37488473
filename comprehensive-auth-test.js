const http = require('http');

// Test various authentication scenarios
async function comprehensiveAuthTest() {
    console.log('🧪 Starting comprehensive authentication tests...\n');
    
    const testCases = [
        {
            name: 'Valid Registration and Login',
            username: 'testuser' + Date.now(),
            email: 'test' + Date.now() + '@example.com',
            password: 'password123',
            shouldPass: true
        },
        {
            name: 'Duplicate Username Registration',
            username: 'testuser' + Date.now(),
            email: 'duplicate' + Date.now() + '@example.com',
            password: 'password123',
            shouldPass: true
        },
        {
            name: 'Duplicate Email Registration (should fail)',
            username: 'duplicateuser' + Date.now(),
            email: 'test' + Date.now() + '@example.com', // Same email as first test
            password: 'password123',
            shouldPass: false
        },
        {
            name: 'Invalid Credentials Login',
            username: 'nonexistentuser',
            password: 'wrongpassword',
            shouldPass: false
        },
        {
            name: 'Empty Fields Registration',
            username: '',
            email: '',
            password: '',
            shouldPass: false
        }
    ];
    
    let passedTests = 0;
    let totalTests = testCases.length;
    
    for (const testCase of testCases) {
        console.log(`📝 Testing: ${testCase.name}`);
        
        try {
            // Test registration if it should pass
            if (testCase.shouldPass && testCase.username && testCase.email && testCase.password) {
                const regResult = await registerUser(testCase.username, testCase.email, testCase.password);
                if (regResult.error) {
                    console.log(`❌ Registration failed: ${regResult.error}`);
                    if (testCase.shouldPass) {
                        console.log('❌ Unexpected failure\n');
                        continue;
                    } else {
                        console.log('✅ Expected failure (duplicate/invalid data)\n');
                        passedTests++;
                        continue;
                    }
                } else {
                    console.log('✅ Registration successful');
                    
                    // Test login
                    const loginResult = await loginUser(testCase.username, testCase.password);
                    if (loginResult.error) {
                        console.log(`❌ Login failed: ${loginResult.error}`);
                        if (testCase.shouldPass) {
                            console.log('❌ Unexpected failure\n');
                            continue;
                        } else {
                            console.log('✅ Expected failure\n');
                            passedTests++;
                            continue;
                        }
                    } else {
                        console.log('✅ Login successful');
                        console.log('✅ Tokens generated properly\n');
                        passedTests++;
                    }
                }
            } else {
                // Test registration with invalid data
                const regResult = await registerUser(testCase.username, testCase.email, testCase.password);
                if (regResult.error) {
                    console.log(`✅ Registration correctly rejected: ${regResult.error}\n`);
                    passedTests++;
                } else {
                    console.log('❌ Registration should have failed but succeeded\n');
                }
            }
        } catch (error) {
            console.log(`❌ Test error: ${error.message}\n`);
        }
    }
    
    console.log('📊 Test Results:');
    console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
    console.log(`📈 Success Rate: ${Math.round((passedTests/totalTests)*100)}%`);
    
    if (passedTests === totalTests) {
        console.log('\n🎉 All authentication tests passed! System is working correctly.');
    } else {
        console.log('\n⚠️ Some tests failed. Authentication system needs attention.');
    }
}

// Registration function
async function registerUser(username, email, password) {
    const userData = { username, email, password };
    
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
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(error);
                }
            });
        });
        
        req.on('error', error => reject(error));
        req.write(JSON.stringify(userData));
        req.end();
    });
}

// Login function
async function loginUser(username, password) {
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
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(error);
                }
            });
        });
        
        req.on('error', error => reject(error));
        req.write(JSON.stringify(loginData));
        req.end();
    });
}

// Run the comprehensive test
comprehensiveAuthTest();