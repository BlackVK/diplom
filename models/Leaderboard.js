const db = require('../config/database');

class Leaderboard {
    static async getTop(mapId, limit = 10) {
        const [rows] = await db.query(
            'SELECT username, wave, score, kills, created_at FROM leaderboards WHERE map_id = ? ORDER BY wave DESC LIMIT ?',
            [mapId, limit]
        );
        return rows;
    }
}

module.exports = Leaderboard;