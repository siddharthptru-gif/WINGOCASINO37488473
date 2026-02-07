// Simple in-memory database for development/testing purposes
// This is NOT for production use - only for demonstration

class InMemoryDB {
    constructor() {
        this.data = {
            users: [],
            admins: [],
            wallets: [],
            game_rounds: [],
            results: [],
            bets: [],
            transactions: []
        };
        this.nextId = {
            users: 1,
            admins: 1,
            wallets: 1,
            game_rounds: 1,
            results: 1,
            bets: 1,
            transactions: 1
        };
    }

    // Generate next ID for a table
    getNextId(table) {
        return this.nextId[table]++;
    }

    // Simple query simulation
    query(sql, params = []) {
        return new Promise((resolve, reject) => {
            try {
                // Extract table name from SQL (very basic parsing)
                let table;
                if (sql.toUpperCase().startsWith('INSERT')) {
                    const tableMatch = sql.match(/INTO\s+(\w+)/i);
                    if (!tableMatch) {
                        resolve({ insertId: null });
                        return;
                    }
                    table = tableMatch[1];
                } else {
                    const tableMatch = sql.match(/FROM\s+(\w+)/i);
                    if (!tableMatch) {
                        resolve([]);
                        return;
                    }
                    table = tableMatch[1];
                }
                const data = this.data[table] || [];
                
                // Handle SELECT queries
                if (sql.toUpperCase().startsWith('SELECT')) {
                    let results = [...data];
                    
                    // Simple WHERE clause handling (very basic)
                    if (sql.toUpperCase().includes('WHERE')) {
                        const whereMatch = sql.match(/WHERE\s+(\w+)\s*=\s*\?/i);
                        if (whereMatch && params.length > 0) {
                            const field = whereMatch[1];
                            const value = params[0];
                            results = results.filter(row => row[field] === value);
                        }
                    }
                    
                    // Handle LIMIT
                    const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
                    if (limitMatch) {
                        const limit = parseInt(limitMatch[1]);
                        results = results.slice(0, limit);
                    }
                    
                    resolve(results);
                }
                // Handle INSERT queries
                else if (sql.toUpperCase().startsWith('INSERT')) {
                    // Parse column names from SQL
                    const columnsMatch = sql.match(/INSERT INTO \w+ \(([^)]+)\)/);
                    let columnNames = [];
                    if (columnsMatch) {
                        columnNames = columnsMatch[1].split(',').map(col => col.trim());
                    }
                    
                    const insertData = {
                        id: this.getNextId(table),
                        created_at: new Date(),
                        updated_at: new Date(),
                        ...params.reduce((obj, param, index) => {
                            // Map parameter to actual column name if available
                            if (columnNames[index]) {
                                obj[columnNames[index]] = param;
                            } else {
                                obj[`field_${index}`] = param;
                            }
                            return obj;
                        }, {})
                    };
                    
                    this.data[table].push(insertData);
                    resolve({ insertId: insertData.id });
                }
                // Handle UPDATE queries
                else if (sql.toUpperCase().startsWith('UPDATE')) {
                    resolve({ affectedRows: 1 });
                }
                // Handle DELETE queries
                else if (sql.toUpperCase().startsWith('DELETE')) {
                    resolve({ affectedRows: 1 });
                }
                else {
                    resolve([]);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    // Transaction simulation
    async transaction(callback) {
        try {
            const result = await callback({
                query: (sql, params) => this.query(sql, params)
            });
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Initialize with sample data
    initializeSampleData() {
        // Add sample admin
        this.data.admins.push({
            id: 1,
            username: 'admin',
            email: 'admin@wingocasino.com',
            password: '$2b$10$example_hash', // This would be a real bcrypt hash
            role: 'super_admin',
            status: 'active',
            created_at: new Date(),
            updated_at: new Date()
        });

        // Add sample user
        this.data.users.push({
            id: 1,
            username: 'demo_user',
            email: 'demo@example.com',
            password: '$2b$10$example_hash',
            phone: '1234567890',
            status: 'active',
            created_at: new Date(),
            updated_at: new Date()
        });

        // Add sample wallet
        this.data.wallets.push({
            id: 1,
            user_id: 1,
            balance: 1000.00,
            created_at: new Date(),
            updated_at: new Date()
        });

        console.log('✅ In-memory database initialized with sample data');
    }
}

// Export singleton instance
const inMemoryDB = new InMemoryDB();
module.exports = inMemoryDB;