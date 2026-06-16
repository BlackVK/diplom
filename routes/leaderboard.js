const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/:mapId', async (req, res) => {
    try {
        const { mapId } = req.params;
        const sort = req.query.sort || 'waves';
        
        let orderBy = '';
        if (sort === 'kills') orderBy = 'kills DESC, wave DESC';
        else if (sort === 'score') orderBy = 'score DESC, wave DESC';
        else orderBy = 'wave DESC, score DESC';
        
        const [rows] = await db.query(
            `SELECT username, wave, score, kills, created_at 
             FROM leaderboards 
             WHERE map_id = ? 
             ORDER BY ${orderBy} 
             LIMIT 10`,
            [mapId]
        );
        
        res.json({ success: true, leaderboard: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;