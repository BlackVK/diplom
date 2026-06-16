const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        
        const [stats] = await db.query(
            'SELECT total_kills, best_wave, best_score, games_played, wins, losses FROM user_game_stats WHERE user_id = ?',
            [userId]
        );
        
        const [user] = await db.query(
            'SELECT campaign_progress, username, email FROM users WHERE id = ?',
            [userId]
        );
        
        res.json({
            success: true,
            stats: stats[0] || { 
                total_kills: 0, 
                best_wave: 0, 
                best_score: 0,
                games_played: 0,
                wins: 0,
                losses: 0
            },
            user: user[0] || { username: 'Unknown', campaign_progress: 1 }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/progress', authMiddleware, async (req, res) => {
    try {
        const { level } = req.body;
        await db.query('UPDATE users SET campaign_progress = ? WHERE id = ?', [level, req.userId]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;