const jwt = require('jsonwebtoken');
const db = require('../config/database');

module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Требуется авторизация' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const [sessions] = await db.query(
            'SELECT user_id FROM user_sessions WHERE session_token = ? AND expires_at > NOW()',
            [token]
        );
        
        if (sessions.length === 0) {
            return res.status(401).json({ success: false, message: 'Сессия истекла' });
        }
        
        req.userId = decoded.userId;
        req.token = token;
        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Неверный токен' });
    }
};