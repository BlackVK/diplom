const db = require('../config/database');

class GameStats {
    static async saveGameResult(userId, username, gameData, ip) {
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
                gameData.kills, gameData.wave, gameData.towersBuilt,
                gameData.upgrades, gameData.won ? 1 : 0, gameData.won ? 0 : 1,
                gameData.wave, gameData.score, gameData.playTime, userId
            ]
        );
        
        if (gameData.won && gameData.gameMode === 'campaign') {
            await db.query(
                'UPDATE user_profiles SET experience_points = experience_points + ?, coins = coins + ? WHERE user_id = ?',
                [gameData.wave * 10, gameData.score, userId]
            );
            
            await db.query(
                'UPDATE user_profiles SET level = FLOOR(experience_points / 100) + 1 WHERE user_id = ?',
                [userId]
            );
        }
        
        await db.query(
            `INSERT INTO leaderboards (user_id, username, map_id, wave, score, kills, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE 
             wave = GREATEST(wave, VALUES(wave)),
             score = GREATEST(score, VALUES(score))`,
            [userId, username, gameData.mapId, gameData.wave, gameData.score, gameData.kills]
        );
        
        return { success: true };
    }
    
    static async getLeaderboard(mapId, limit = 10) {
        const [rows] = await db.query(
            'SELECT username, wave, score, kills, created_at FROM leaderboards WHERE map_id = ? ORDER BY wave DESC LIMIT ?',
            [mapId, limit]
        );
        return rows;
    }
}

module.exports = GameStats;