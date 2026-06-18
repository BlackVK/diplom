const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.post('/save', authMiddleware, async (req, res) => {
    try {
        const gameData = req.body;
        const userId = req.userId;
        const username = gameData.username || 'Player';

        await db.query(
            `UPDATE user_game_stats SET 
                total_kills = total_kills + ?,
                total_waves = total_waves + ?,
                total_towers_built = total_towers_built + ?,
                total_upgrades = total_upgrades + ?,
                games_played = games_played + 1,
                wins = wins + ?,
                losses = losses + ?,
                best_wave = GREATEST(best_wave, ?),
                best_score = GREATEST(best_score, ?),
                play_time = play_time + ?,
                last_game_date = NOW()
            WHERE user_id = ?`,
            [
                gameData.kills || 0,
                gameData.wave || 0,
                gameData.towersBuilt || 0,
                gameData.upgrades || 0,
                gameData.won ? 1 : 0,
                gameData.won ? 0 : 1,
                gameData.wave || 0,
                gameData.score || 0,
                gameData.playTime || 0,
                userId
            ]
        );
        
        if (gameData.gameMode === 'campaign' && gameData.won && gameData.levelCompleted) {
            const newProgress = Math.min(gameData.levelCompleted + 1, 6);
            await db.query('UPDATE users SET campaign_progress = ? WHERE id = ?', [newProgress, userId]);
        }
        
        if (gameData.gameMode === 'sandbox' && gameData.wave > 0) {
            const [existing] = await db.query('SELECT id FROM leaderboards WHERE user_id = ? AND map_id = ?', [userId, gameData.mapId]);
            
            if (existing.length === 0) {
                await db.query(`INSERT INTO leaderboards (user_id, username, map_id, wave, score, kills) VALUES (?, ?, ?, ?, ?, ?)`, [userId, username, gameData.mapId, gameData.wave, gameData.score, gameData.kills]);
            } else {
                await db.query(`UPDATE leaderboards SET wave = GREATEST(wave, ?), score = GREATEST(score, ?), kills = GREATEST(kills, ?) WHERE user_id = ? AND map_id = ?`, [gameData.wave, gameData.score, gameData.kills, userId, gameData.mapId]);
            }
        }
        
        res.json({ success: true, message: 'Игра сохранена' });
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;