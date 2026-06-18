const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const isAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Не авторизован' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [users] = await db.query('SELECT role_id FROM users WHERE id = ?', [decoded.userId]);
        
        if (users.length === 0 || users[0].role_id !== 1) {
            return res.status(403).json({ success: false, message: 'Доступ запрещён' });
        }
        
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Неверный токен' });
    }
};

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Заполните все поля' });
        }
        
        const [users] = await db.query(
            'SELECT * FROM users WHERE username = ? AND role_id = 1 AND is_active = 1',
            [username]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Доступ запрещён' });
        }
        
        const user = users[0];
        const isValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Неверный пароль' });
        }
        
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        
        res.json({ success: true, token });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/users', isAdmin, async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT 
                u.id, 
                u.username, 
                u.email, 
                u.campaign_progress,
                COALESCE(s.total_kills, 0) as total_kills,
                COALESCE(s.total_waves, 0) as total_waves,
                COALESCE(s.best_wave, 0) as best_wave,
                COALESCE(s.best_score, 0) as best_score,
                COALESCE(s.games_played, 0) as games_played,
                COALESCE(s.wins, 0) as wins,
                COALESCE(s.losses, 0) as losses,
                COALESCE(s.total_towers_built, 0) as total_towers_built
            FROM users u
            LEFT JOIN user_game_stats s ON u.id = s.user_id
            WHERE u.role_id = 2
            ORDER BY u.id ASC
        `);
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/users/:id', isAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        
        const [check] = await db.query('SELECT id FROM users WHERE id = ? AND role_id = 2', [userId]);
        if (check.length === 0) {
            return res.status(404).json({ success: false, message: 'Пользователь не найден' });
        }
        
        await db.query('DELETE FROM users WHERE id = ?', [userId]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;