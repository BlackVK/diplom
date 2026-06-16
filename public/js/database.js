const TD_DB = {
    getDB() {
        const defaultDB = {
            users: [],
            userStats: {},
            scripts: {},
            achievements: {},
            leaderboard: {
                wave: [],
                zigzag: [],
                curve: [],
                straight: []
            },
            nextUserId: 1
        };
        
        const saved = localStorage.getItem('td_database');
        if (saved) {
            return JSON.parse(saved);
        }
        return defaultDB;
    },
    
    saveDB(db) {
        localStorage.setItem('td_database', JSON.stringify(db));
    },
    
    hashPassword(username, password) {
        return btoa(username + ':' + password);
    },
    
    register(username, password) {
        const db = this.getDB();
        
        if (db.users.find(u => u.username === username)) {
            return { success: false, message: 'Пользователь уже существует' };
        }
        
        if (username.length < 3) {
            return { success: false, message: 'Имя пользователя должно содержать минимум 3 символа' };
        }
        
        if (password.length < 4) {
            return { success: false, message: 'Пароль должен содержать минимум 4 символа' };
        }
        
        const user = {
            id: db.nextUserId++,
            username: username,
            password: this.hashPassword(username, password),
            level: 1,
            experience: 0,
            coins: 100,
            campaignProgress: 1,
            createdAt: new Date().toISOString()
        };
        
        db.users.push(user);
        db.userStats[user.id] = {
            totalKills: 0,
            totalWaves: 0,
            totalTowersBuilt: 0,
            totalUpgrades: 0,
            totalPlayTime: 0,
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            bestWave: 0,
            bestScore: 0,
            mapsPlayed: {}
        };
        
        db.scripts[user.id] = [];
        db.achievements[user.id] = [];
        
        this.saveDB(db);
        
        return { 
            success: true, 
            user: {
                id: user.id,
                username: user.username,
                level: user.level,
                experience: user.experience,
                coins: user.coins,
                campaignProgress: user.campaignProgress
            }
        };
    },
    
    login(username, password) {
        const db = this.getDB();
        const hashedPassword = this.hashPassword(username, password);
        const user = db.users.find(u => u.username === username && u.password === hashedPassword);
        
        if (!user) {
            return { success: false, message: 'Неверное имя пользователя или пароль' };
        }
        
        return { 
            success: true, 
            user: {
                id: user.id,
                username: user.username,
                level: user.level,
                experience: user.experience,
                coins: user.coins,
                campaignProgress: user.campaignProgress
            }
        };
    },
    
    getUserStats(userId) {
        const db = this.getDB();
        return db.userStats[userId] || {
            totalKills: 0,
            totalWaves: 0,
            totalTowersBuilt: 0,
            totalUpgrades: 0,
            totalPlayTime: 0,
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            bestWave: 0,
            bestScore: 0,
            mapsPlayed: {}
        };
    },
    
    updateUserStats(userId, gameResult) {
        const db = this.getDB();
        const stats = db.userStats[userId] || this.getUserStats(userId);
        
        stats.totalKills += gameResult.kills || 0;
        stats.totalWaves += gameResult.wave || 0;
        stats.totalTowersBuilt += gameResult.towersBuilt || 0;
        stats.totalUpgrades += gameResult.upgrades || 0;
        stats.totalPlayTime += gameResult.playTime || 0;
        stats.gamesPlayed += 1;
        
        if (gameResult.won) {
            stats.wins += 1;
        } else {
            stats.losses += 1;
        }
        
        if (gameResult.wave > stats.bestWave) {
            stats.bestWave = gameResult.wave;
        }
        
        if (gameResult.score > stats.bestScore) {
            stats.bestScore = gameResult.score;
        }
        
        if (gameResult.mapId && (!stats.mapsPlayed[gameResult.mapId] || 
            gameResult.wave > stats.mapsPlayed[gameResult.mapId].bestWave)) {
            stats.mapsPlayed[gameResult.mapId] = {
                bestWave: gameResult.wave,
                bestScore: gameResult.score,
                plays: (stats.mapsPlayed[gameResult.mapId]?.plays || 0) + 1
            };
        } else if (gameResult.mapId && stats.mapsPlayed[gameResult.mapId]) {
            stats.mapsPlayed[gameResult.mapId].plays += 1;
        }
        
        db.userStats[userId] = stats;
        this.saveDB(db);
        
        return stats;
    },
    
    updateCampaignProgress(userId, level) {
        const db = this.getDB();
        const user = db.users.find(u => u.id === userId);
        
        if (user && level > user.campaignProgress) {
            user.campaignProgress = Math.min(level, 5);
            this.saveDB(db);
        }
    },
    
    updateLeaderboard(userId, username, mapId, wave, score, kills) {
        const db = this.getDB();
        const leaderboard = db.leaderboard[mapId] || [];
        
        const existingIndex = leaderboard.findIndex(entry => entry.userId === userId);
        
        const newEntry = {
            userId: userId,
            username: username,
            wave: wave,
            score: score,
            kills: kills,
            date: new Date().toISOString()
        };
        
        if (existingIndex !== -1) {
            if (wave > leaderboard[existingIndex].wave) {
                leaderboard[existingIndex] = newEntry;
            }
        } else {
            leaderboard.push(newEntry);
        }
        
        leaderboard.sort((a, b) => b.wave - a.wave);
        db.leaderboard[mapId] = leaderboard.slice(0, 100);
        
        this.saveDB(db);
        
        return { isNewRecord: existingIndex === -1 || wave > leaderboard[existingIndex]?.wave };
    },
    
    getLeaderboard(mapId) {
        const db = this.getDB();
        return db.leaderboard[mapId] || [];
    },
    
    saveScript(userId, scriptData) {
        const db = this.getDB();
        const userScripts = db.scripts[userId] || [];
        
        const script = {
            id: Date.now(),
            name: scriptData.name,
            code: scriptData.code,
            description: scriptData.description || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        userScripts.push(script);
        db.scripts[userId] = userScripts;
        this.saveDB(db);
        
        return script;
    },
    
    getScripts(userId) {
        const db = this.getDB();
        return db.scripts[userId] || [];
    },
    
    grantAchievement(userId, achievementId) {
        const db = this.getDB();
        const userAchievements = db.achievements[userId] || [];
        
        if (!userAchievements.includes(achievementId)) {
            userAchievements.push(achievementId);
            db.achievements[userId] = userAchievements;
            this.saveDB(db);
            return true;
        }
        return false;
    },
    
    init() {
        const db = this.getDB();
        if (db.users.length === 0) {
            this.register('admin', 'admin123');
        }
        console.log('[DB] База данных инициализирована');
    }
};

window.TD_DB = TD_DB;