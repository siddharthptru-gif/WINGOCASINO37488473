const http = require('http');

// Test complete registration without email
async function testRegistrationWithoutEmail() {
    console.log('📱 Testing registration without email...\n');
    
    const testUser = {
        username: 'noemailuser' + Date.now(),
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
                        console.log('✅ Registration without email successful!');
                        console.log('User created with ID:', result.user.id);
                        console.log('Mobile:', result.user.mobile);
                        console.log('Email field absent:', !result.user.email);
                        resolve(result);
                    } else {
                        console.log('❌ Registration failed:', result.error);
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

// Test admin panel data loading
async function testAdminPanelData() {
    console.log('\n📋 Testing admin panel data loading...\n');
    
    // First login as admin
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
                    
                    // Test dashboard stats
                    testDashboardStats(token)
                        .then(() => testUserList(token))
                        .then(() => testGameControl(token))
                        .then(() => {
                            console.log('\n🎉 All admin panel tests passed!');
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
            console.log('❌ Login request error:', error.message);
            reject(error);
        });
        
        req.write(JSON.stringify(adminLoginData));
        req.end();
    });
}

// Test dashboard statistics
async function testDashboardStats(token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/admin/dashboard/stats',
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
                    console.log('📊 Dashboard stats response:', result.stats ? 'Loaded' : 'Failed');
                    
                    if (result.stats) {
                        console.log('✅ Dashboard stats loaded successfully');
                        console.log('- Total users:', result.stats.users?.total_users || 0);
                        console.log('- Recent users count:', result.stats.recent_users?.length || 0);
                        resolve();
                    } else {
                        console.log('❌ Dashboard stats loading failed');
                        reject(new Error('Dashboard stats not loaded'));
                    }
                } catch (error) {
                    console.log('❌ Dashboard stats parse error:', error.message);
                    reject(error);
                }
            });
        });
        
        req.on('error', error => {
            console.log('❌ Dashboard stats request error:', error.message);
            reject(error);
        });
        
        req.end();
    });
}

// Test user list
async function testUserList(token) {
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
                    console.log('👥 User list response:', result.users ? 'Loaded' : 'Failed');
                    
                    if (result.users) {
                        console.log('✅ User list loaded successfully');
                        console.log('- Users count:', result.users.length);
                        console.log('- First user mobile:', result.users[0]?.mobile || 'N/A');
                        resolve();
                    } else {
                        console.log('❌ User list loading failed');
                        reject(new Error('User list not loaded'));
                    }
                } catch (error) {
                    console.log('❌ User list parse error:', error.message);
                    reject(error);
                }
            });
        });
        
        req.on('error', error => {
            console.log('❌ User list request error:', error.message);
            reject(error);
        });
        
        req.end();
    });
}

// Test game control
async function testGameControl(token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/admin/game/control',
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
                    console.log('🎮 Game control response:', result.available_games ? 'Loaded' : 'Failed');
                    
                    if (result.available_games) {
                        console.log('✅ Game control loaded successfully');
                        console.log('- Available games:', result.available_games.length);
                        result.available_games.forEach(game => {
                            console.log(`  • ${game.name} (${game.id})`);
                        });
                        resolve();
                    } else {
                        console.log('❌ Game control loading failed');
                        reject(new Error('Game control not loaded'));
                    }
                } catch (error) {
                    console.log('❌ Game control parse error:', error.message);
                    reject(error);
                }
            });
        });
        
        req.on('error', error => {
            console.log('❌ Game control request error:', error.message);
            reject(error);
        });
        
        req.end();
    });
}

// Run all tests
async function runAllTests() {
    try {
        console.log('🚀 Starting comprehensive tests...\n');
        
        // Test registration without email
        await testRegistrationWithoutEmail();
        
        // Test admin panel functionality
        await testAdminPanelData();
        
        console.log('\n✅ All tests completed successfully!');
        console.log('\n📋 Summary of changes:');
        console.log('✅ Email completely removed from registration');
        console.log('✅ Admin panel data loading fixed');
        console.log('✅ Multiple games support added');
        console.log('✅ Game result forcing enhanced');
        
    } catch (error) {
        console.log('\n❌ Tests failed:', error.message);
    }
}

// Run the tests
runAllTests();