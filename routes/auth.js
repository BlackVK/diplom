const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

function isValidEmail(email) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

function hasRussianLetters(text) {
    return /[а-яА-ЯёЁ]/.test(text);
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
        
        if (hasRussianLetters(email)) {
            return res.status(400).json({ success: false, message: 'Email должен содержать только латинские символы' });
        }
        
        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'Неверный формат email' });
        }
        
        if (password.length < 4) {
            return res.status(400).json({ success: false, message: 'Пароль минимум 4 символа' });
        }
        
        const [existingEmail] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            return res.status(400).json({ success: false, message: 'Этот email уже зарегистрирован' });
        }
        
        const passwordHash = await bcrypt.hash(password, 10);
        
        const [result] = await db.query(
            'INSERT INTO users (username, email, password_hash, role_id, campaign_progress) VALUES (?, ?, ?, 2, 1)',
            [username, email, passwordHash]
        );
        
        const userId = result.insertId;
        
        await db.query('INSERT INTO user_game_stats (user_id) VALUES (?)', [userId]);
        
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
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];
        
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Заполните все поля' });
        }
        
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Пользователь не найден' });
        }
        
        const user = users[0];
        
        if (user.is_banned === 1) {
            const reason = user.ban_reason || 'Нарушение правил';
            return res.status(403).json({ 
                success: false, 
                message: `Ваш аккаунт заблокирован. Причина: ${reason}` 
            });
        }
        
        if (user.is_active === 0) {
            return res.status(403).json({ success: false, message: 'Аккаунт деактивирован' });
        }
        
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
        console.error('Ошибка входа:', error);
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