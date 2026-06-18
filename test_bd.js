require('dotenv').config();
const mysql = require('mysql2');

console.log('=== ПРОВЕРКА ПОДКЛЮЧЕНИЯ ===');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Ошибка:', err.message);
    } else {
        console.log('✅ Подключение успешно!');
        connection.query('SELECT 1', (err) => {
            if (err) console.error('❌ Ошибка запроса:', err.message);
            else console.log('✅ Запрос выполнен');
            connection.end();
        });
    }
});