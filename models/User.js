const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
    static async register(username, email, password) {
        const passwordHash = await bcrypt.hash(password, 10);
        
        const [result] = await db.query(
            'INSERT INTO users (username, email, password_hash, role_id) VALUES (?, ?, ?, 2)',
            [username, email, passwordHash]
        );
        
        const userId = result.insertId;
        
        await db.query(
            'INSERT INTO user_profiles (user_id, experience_points, level, coins) VALUES (?, 0, 1, 100)',
            [userId]
        );
        
        await db.query(
            'INSERT INTO user_game_stats (user_id) VALUES (?)',
            [userId]
        );
        
        return {
            id: userId,
            username,
            email,
            level: 1,
            experience: 0,
            coins: 100
        };
    }
    
    static async login(username, password, ip, userAgent) {
        const [users] = await db.query(
            'SELECT u.*, up.level as user_level, up.experience_points, up.coins FROM users u LEFT JOIN user_profiles up ON u.id = up.user_id WHERE u.username = ? AND u.is_active = 1 AND u.is_banned = 0',
            [username]
        );
        
        if (users.length === 0) {
            throw new Error('Пользователь не найден');
        }
        
        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!isValidPassword) {
            throw new Error('Неверный пароль');
        }
        
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        await db.query(
            'INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
            [user.id, token, ip, userAgent]
        );
        
        await db.query(
            'UPDATE users SET last_login = NOW(), last_ip = ? WHERE id = ?',
            [ip, user.id]
        );
        
        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                level: user.user_level || 1,
                experience: user.experience_points || 0,
                coins: user.coins || 100
            },
            token
        };
    }
    
    static async logout(token) {
        await db.query('DELETE FROM user_sessions WHERE session_token = ?', [token]);
        return true;
    }
}

module.exports = User;