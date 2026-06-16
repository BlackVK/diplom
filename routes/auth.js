const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return emailRegex.test(email);
}

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: 'Заполните все поля' });
        }
        
        if (username.length < 3) {
            return res.status(400).json({ success: false, message: 'Имя пользователя минимум 3 символа' });
        }
        
        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'Введите корректный email' });
        }
        
        if (password.length < 4) {
            return res.status(400).json({ success: false, message: 'Пароль минимум 4 символа' });
        }
        
        const [existing] = await db.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Пользователь уже существует' });
        }
        
        const passwordHash = await bcrypt.hash(password, 10);
        
        const [result] = await db.query(
            'INSERT INTO users (username, email, password_hash, role_id, campaign_progress) VALUES (?, ?, ?, 2, 1)',
            [username, email, passwordHash]
        );
        
        const userId = result.insertId;
        
        await db.query(
            `INSERT INTO user_game_stats (user_id, total_kills, total_waves, total_towers_built, total_upgrades, games_played, wins, losses, best_wave, best_score, play_time) 
             VALUES (?, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)`,
            [userId]
        );
        
        res.json({ 
            success: true, 
            user: { 
                id: userId, 
                username, 
                email, 
                campaign_progress: 1 
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];
        
        const [users] = await db.query(
            'SELECT id, username, email, password_hash, campaign_progress FROM users WHERE username = ? AND is_active = 1 AND is_banned = 0',
            [username]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Пользователь не найден' });
        }
        
        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: 'Неверный пароль' });
        }
        
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        await db.query('DELETE FROM user_sessions WHERE user_id = ?', [user.id]);
        
        await db.query(
            'INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
            [user.id, token, ip, userAgent]
        );
        
        await db.query('UPDATE users SET last_login = NOW(), last_ip = ? WHERE id = ?', [ip, user.id]);
        
        res.json({ 
            success: true, 
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                campaign_progress: user.campaign_progress || 1
            },
            token
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            await db.query('DELETE FROM user_sessions WHERE session_token = ?', [token]);
        }
        res.json({ success: true, message: 'Выход выполнен' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;