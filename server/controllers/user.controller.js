const { query } = require('../db');

// Get user profile
async function getProfile(req, res) {
    try {
        const userId = req.user.id;

        const users = await query(
            `SELECT u.id, u.username, u.email, u.phone, u.created_at, u.last_login,
                    w.balance
             FROM users u
             JOIN wallets w ON u.id = w.user_id
             WHERE u.id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];

        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                balance: user.balance,
                created_at: user.created_at,
                last_login: user.last_login
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
}

// Update user profile
async function updateProfile(req, res) {
    try {
        const userId = req.user.id;
        const { email, phone } = req.body;

        // Validate input
        if (!email && !phone) {
            return res.status(400).json({ error: 'Email or phone required' });
        }

        // Check if email already exists (if updating email)
        if (email) {
            const existingUsers = await query(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [email, userId]
            );

            if (existingUsers.length > 0) {
                return res.status(409).json({ error: 'Email already exists' });
            }
        }

        // Update user
        const updateFields = [];
        const updateValues = [];

        if (email) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }

        if (phone !== undefined) {
            updateFields.push('phone = ?');
            updateValues.push(phone);
        }

        updateValues.push(userId);

        await query(
            `UPDATE users SET ${updateFields.join(', ')}, updated_at = datetime("now") WHERE id = ?`,
            updateValues
        );

        // Get updated user
        const users = await query(
            `SELECT u.id, u.username, u.email, u.phone, u.created_at, u.last_login,
                    w.balance
             FROM users u
             JOIN wallets w ON u.id = w.user_id
             WHERE u.id = ?`,
            [userId]
        );

        res.json({
            message: 'Profile updated successfully',
            user: users[0]
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
}

module.exports = {
    getProfile,
    updateProfile
};