const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.put('/progress', authMiddleware, async (req, res) => {
    try {
        const { level } = req.body;
        
        await db.query(
            'UPDATE users SET campaign_progress = ? WHERE id = ?',
            [level, req.userId]
        );
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;