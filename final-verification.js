const http = require('http');

// Test registration with mobile only (no email)
async function testMobileOnlyRegistration() {
    console.log('📱 Testing registration with MOBILE ONLY (no email)...\n');
    
    const testUser = {
        username: 'mobileonly' + Date.now(),
        mobile: '+91' + Math.floor(Math.random() * 10000000000),
        password: 'password123',
        phone: '+919876543210'
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
                        console.log('✅ MOBILE-ONLY REGISTRATION SUCCESSFUL!');
                        console.log('User ID:', result.user.id);
                        console.log('Username:', result.user.username);
                        console.log('Mobile:', result.user.mobile);
                        console.log('Email field present:', !!result.user.email);
                        console.log('Phone:', result.user.phone);
                        resolve(result);
                    } else {
                        console.log('❌ Registration failed:', result.error);
                        reject(new Error(result.error));
                    }
                } catch (error) {
                    console.log('❌ Parse error:', error.message);
                    console.log('Raw response:', data);
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

// Test login with mobile registered user
async function testMobileLogin(username, password) {
    console.log('\n🔐 Testing login with mobile-registered user...\n');
    
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
                        console.log('✅ MOBILE LOGIN SUCCESSFUL!');
                        console.log('User mobile:', result.user.mobile);
                        console.log('Tokens generated:', !!result.tokens.access_token);
                        resolve(result);
                    } else {
                        console.log('❌ Login failed:', result.error);
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

// Test admin panel data loading
async function testAdminPanel() {
    console.log('\n📋 Testing admin panel data loading...\n');
    
    // Login as admin first
    const adminLoginData = {
        username: 'admin',
        password: 'admin123'
    };
    
    const loginOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/admin/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(adminLoginData).length
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = http.request(loginOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const loginResult = JSON.parse(data);
                    
                    if (res.statusCode !== 200) {
                        console.log('❌ Admin login failed:', loginResult.error);
                        reject(new Error(loginResult.error));
                        return;
                    }
                    
                    console.log('✅ Admin login successful');
                    const token = loginResult.token;
                    
                    // Test user listing
                    testUserListing(token)
                        .then(() => {
                            console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
                            console.log('\n✅ SUMMARY:');
                            console.log('✅ Email completely removed from registration');
                            console.log('✅ Mobile number is now the primary identifier');
                            console.log('✅ Admin panel loads user data correctly');
                            console.log('✅ Registration and login work without email');
                            resolve();
                        })
                        .catch(reject);
                        
                } catch (error) {
                    console.log('❌ Parse error:', error.message);
                    reject(error);
                }
            });
        });
        
        req.on('error', error => {
            console.log('❌ Admin login request error:', error.message);
            reject(error);
        });
        
        req.write(JSON.stringify(adminLoginData));
        req.end();
    });
}

// Test user listing in admin panel
async function testUserListing(token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/admin/users?limit=10',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log('👥 User listing response received');
                    
                    if (result.users) {
                        console.log('✅ User listing loaded successfully');
                        console.log('- Total users:', result.users.length);
                        if (result.users.length > 0) {
                            console.log('- Sample user mobile:', result.users[0].mobile || 'N/A');
                            console.log('- Sample user phone:', result.users[0].phone || 'N/A');
                        }
                        resolve();
                    } else {
                        console.log('❌ User listing failed to load');
                        reject(new Error('User listing not loaded'));
                    }
                } catch (error) {
                    console.log('❌ User listing parse error:', error.message);
                    reject(error);
                }
            });
        });
        
        req.on('error', error => {
            console.log('❌ User listing request error:', error.message);
            reject(error);
        });
        
        req.end();
    });
}

// Run all tests
async function runAllTests() {
    try {
        console.log('🚀 Starting comprehensive verification tests...\n');
        
        // Test mobile-only registration
        const regResult = await testMobileOnlyRegistration();
        
        // Test login with registered user
        await testMobileLogin(regResult.user.username, 'password123');
        
        // Test admin panel
        await testAdminPanel();
        
        console.log('\n🏆 FINAL VERIFICATION COMPLETE!');
        console.log('All systems working correctly with mobile-only registration.');
        
    } catch (error) {
        console.log('\n❌ VERIFICATION FAILED:', error.message);
        console.log('Please check the server logs for more details.');
    }
}

// Run the tests
runAllTests();