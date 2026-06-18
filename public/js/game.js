class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        
        this.enemies = [];
        this.towers = [];
        this.bullets = [];
        this.particles = [];
        
        this.lives = 10;
        this.wave = 0;
        this.money = 100;
        this.score = 0;
        this.kills = 0;
        this.towersBuilt = 0;
        this.upgradesDone = 0;
        this.totalTowersBuilt = 0;
        this.totalUpgrades = 0;
        
        this.waypoints = [];
        this.pathMode = 'wave';
        this.enemySpawnQueue = [];
        this.lastSpawnTime = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.gameWin = false;
        this.gameStartTime = 0;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.animationTime = 0;
        this.requiredWaves = 0;
        this.waypointPath = [];
        
        this.config = {
            towerCost: 50,
            upgradeCost: 30,
            killReward: 10,
            startingLives: 10,
            startingMoney: 100
        };
        
        this.gameLoop = this.gameLoop.bind(this);
    }
    
    init(gameMode, mapId, levelData = null) {
        console.log('[Game] Инициализация игры...');
        this.gameMode = gameMode;
        this.mapId = mapId;
        this.levelData = levelData;
        this.pathMode = mapId;
        
        this.resizeCanvas();
        this.updateWaypoints();
        
        if (gameMode === 'campaign' && levelData) {
            this.lives = levelData.startingLives || 10;
            this.money = levelData.startingMoney || 100;
            this.requiredWaves = levelData.wavesToWin || 5;
        } else {
            this.lives = this.config.startingLives;
            this.money = this.config.startingMoney;
            this.requiredWaves = 0;
        }
        
        this.wave = 0;
        this.score = 0;
        this.kills = 0;
        this.towersBuilt = 0;
        this.upgradesDone = 0;
        this.totalTowersBuilt = 0;
        this.totalUpgrades = 0;
        
        this.enemies = [];
        this.towers = [];
        this.bullets = [];
        this.particles = [];
        this.enemySpawnQueue = [];
        
        this.gameStarted = true;
        this.gameOver = false;
        this.gameWin = false;
        this.gameStartTime = Date.now();
        this.lastFrameTime = 0;
        this.animationTime = 0;
        
        this.updateUI();
        console.log(`[Game] Игра начата в режиме: ${gameMode}, карта: ${mapId}`);
    }
    
    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * this.dpr;
        this.canvas.height = rect.height * this.dpr;
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.updateWaypoints();
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (this.canvas.width / this.dpr / rect.width);
            const y = (e.clientY - rect.top) * (this.canvas.height / this.dpr / rect.height);
            if (window.updateMouseCoords) {
                window.updateMouseCoords(Math.round(x), Math.round(y));
            }
        });
    }
    
    updateWaypoints() {
        const w = this.canvas.width / this.dpr;
        const h = this.canvas.height / this.dpr;
        this.waypoints = [];
        this.waypointPath = [];
        
        if (this.pathMode === 'straight') {
            this.waypoints = [
                { x: -40, y: h / 2 },
                { x: w + 40, y: h / 2 }
            ];
        } else if (this.pathMode === 'wave') {
            const segments = 12;
            const segmentWidth = w / segments;
            for (let i = 0; i <= segments; i++) {
                const x = i * segmentWidth;
                const y = h / 2 + Math.sin(i * 0.8) * (h / 4);
                this.waypoints.push({ x, y });
            }
            this.waypoints[0].x = -40;
            this.waypoints[this.waypoints.length - 1].x = w + 40;
        } else if (this.pathMode === 'curve') {
            const centerY = h / 2;
            const amplitude = h / 3;
            for (let i = 0; i <= 20; i++) {
                const progress = i / 20;
                const x = progress * w;
                const curve = Math.sin(progress * Math.PI);
                const y = centerY + curve * amplitude;
                this.waypoints.push({ x, y });
            }
            this.waypoints[0].x = -40;
            this.waypoints[this.waypoints.length - 1].x = w + 40;
        } else if (this.pathMode === 'zigzag') {
            const segments = 6;
            const segmentWidth = w / segments;
            for (let i = 0; i <= segments; i++) {
                const x = i * segmentWidth;
                const y = h / 2 + (i % 2 === 0 ? -h / 4 : h / 4);
                this.waypoints.push({ x, y });
            }
            this.waypoints[0].x = -40;
            this.waypoints[this.waypoints.length - 1].x = w + 40;
        }
        
        for (let i = 0; i < this.waypoints.length - 1; i++) {
            const steps = 20;
            for (let j = 0; j <= steps; j++) {
                const t = j / steps;
                const x = this.waypoints[i].x + (this.waypoints[i + 1].x - this.waypoints[i].x) * t;
                const y = this.waypoints[i].y + (this.waypoints[i + 1].y - this.waypoints[i].y) * t;
                this.waypointPath.push({ x, y });
            }
        }
    }
    
    isOnPath(x, y) {
        const pathRadius = 35;
        for (let point of this.waypointPath) {
            const distance = Math.hypot(x - point.x, y - point.y);
            if (distance < pathRadius) {
                return true;
            }
        }
        return false;
    }
    
    spawn_wave() {
        this.wave++;
        const count = 5 + this.wave * 2;
        const hp = 20 + this.wave * 2;
        const speed = 25 + this.wave * 1.5;
        
        this.enemySpawnQueue = [];
        for (let i = 0; i < count; i++) {
            this.enemySpawnQueue.push({
                hp: hp,
                speed: speed,
                delay: i * 0.3
            });
        }
        
        this.lastSpawnTime = 0;
        this.updateUI();
        
        if (window.log) {
            window.log(`🌀 Волна ${this.wave} (${count} врагов, HP: ${hp})`);
        }
        
        return true;
    }
    
    build_tower(name, x, y) {
        if (x < 0 || x > this.canvas.width / this.dpr || y < 0 || y > this.canvas.height / this.dpr) {
            if (window.log) window.log('❌ Координаты за пределами карты');
            return false;
        }
        
        if (this.isOnPath(x, y)) {
            if (window.log) window.log('❌ Нельзя ставить башню на дорогу!');
            return false;
        }
        
        if (this.towers.some(t => t.name === name)) {
            if (window.log) window.log(`❌ Башня с именем "${name}" уже существует`);
            return false;
        }
        
        const minDistance = 60;
        for (let tower of this.towers) {
            const distance = Math.hypot(tower.x - x, tower.y - y);
            if (distance < minDistance) {
                if (window.log) window.log('❌ Слишком близко к другой башне (мин. 60px)');
                return false;
            }
        }
        
        const baseCost = 50;
        const costMultiplier = 1.2;
        const towerCost = Math.floor(baseCost * Math.pow(costMultiplier, this.totalTowersBuilt));
        
        if (this.money < towerCost) {
            if (window.log) window.log(`❌ Недостаточно денег. Нужно: ${towerCost}`);
            return false;
        }
        
        this.towers.push(new Tower(x, y, name));
        this.money -= towerCost;
        this.totalTowersBuilt++;
        this.towersBuilt++;
        this.updateUI();
        this.createExplosion(x, y, '#00c2ff', 12);
        
        if (window.log) {
            window.log(`🏗️ Построена башня "${name}" в (${x}, ${y}) (-${towerCost})`);
        }
        
        return true;
    }
    
    upgrade_tower(name) {
        const tower = this.towers.find(t => t.name === name);
        if (!tower) {
            if (window.log) window.log(`❌ Башня с именем "${name}" не найдена`);
            return false;
        }
        
        const baseUpgradeCost = 30;
        const upgradeMultiplier = 1.3;
        const upgradeCost = Math.floor(baseUpgradeCost * Math.pow(upgradeMultiplier, this.totalUpgrades));
        
        if (this.money < upgradeCost) {
            if (window.log) window.log(`❌ Нужно ${upgradeCost} денег для улучшения`);
            return false;
        }
        
        tower.level++;
        tower.damage += 15;
        tower.reloadTime = Math.max(0.2, tower.reloadTime * 0.9);
        tower.range += 10;
        tower.color = this.getTowerColor(tower.level);
        
        this.money -= upgradeCost;
        this.totalUpgrades++;
        this.upgradesDone++;
        this.score += 5;
        this.updateUI();
        this.createExplosion(tower.x, tower.y, '#ffd166', 8);
        
        if (window.log) {
            window.log(`⚡ Улучшена башня "${name}" → L${tower.level} (-${upgradeCost})`);
        }
        
        return true;
    }
    
    getTowerColor(level) {
        const colors = ['#0ea5ff', '#2ef27b', '#ffd166', '#c084fc', '#ff6b6b'];
        return colors[Math.min(level - 1, colors.length - 1)] || '#0ea5ff';
    }
    
    get_towers() {
        return this.towers.map(t => ({
            name: t.name,
            x: Math.round(t.x),
            y: Math.round(t.y),
            level: t.level,
            damage: t.damage,
            range: Math.round(t.range)
        }));
    }
    
    reset_game() {
        this.enemies = [];
        this.bullets = [];
        this.towers = [];
        this.particles = [];
        this.enemySpawnQueue = [];
        this.totalTowersBuilt = 0;
        this.totalUpgrades = 0;
        
        if (this.gameMode === 'campaign' && this.levelData) {
            this.lives = this.levelData.startingLives || 10;
            this.money = this.levelData.startingMoney || 100;
        } else {
            this.lives = this.config.startingLives;
            this.money = this.config.startingMoney;
        }
        
        this.wave = 0;
        this.score = 0;
        this.kills = 0;
        this.towersBuilt = 0;
        this.upgradesDone = 0;
        
        this.gameOver = false;
        this.gameWin = false;
        
        this.updateUI();
        
        if (window.log) {
            window.log('🔄 Игра сброшена');
        }
    }
    
    loseLife() {
        this.lives = Math.max(0, this.lives - 1);
        this.updateUI();
        
        if (this.lives <= 0) {
            this.gameOver = true;
            this.gameWin = false;
            const result = this.getGameResult();
            result.won = false;
            
            if (window.showGameOver) {
                window.showGameOver(result);
            }
        }
    }
    
    winGame() {
        this.gameOver = true;
        this.gameWin = true;
        const result = this.getGameResult();
        result.won = true;
        
        if (window.showGameWin) {
            window.showGameWin(result);
        }
    }
    
    getGameResult() {
        const playTime = (Date.now() - this.gameStartTime) / 1000;
        return {
            wave: this.wave,
            score: this.score,
            kills: this.kills,
            towersBuilt: this.towersBuilt,
            upgrades: this.upgradesDone,
            playTime: playTime,
            mapId: this.mapId,
            gameMode: this.gameMode,
            won: this.gameWin
        };
    }
    
    updateUI() {
        if (window.updateGameUI) {
            window.updateGameUI({
                lives: this.lives,
                wave: this.wave,
                money: this.money,
                score: this.score
            });
        }
    }
    
    update(deltaTime) {
        if (!this.gameStarted || this.gameOver) return;
        
        this.animationTime += deltaTime;
        this.frameCount++;
        
        if (this.enemySpawnQueue.length > 0) {
            this.lastSpawnTime += deltaTime;
            while (this.enemySpawnQueue.length > 0 && this.enemySpawnQueue[0].delay <= this.lastSpawnTime) {
                const enemyData = this.enemySpawnQueue.shift();
                const enemy = new Enemy(enemyData.hp, enemyData.speed);
                enemy.progress = 0.01;
                this.enemies.push(enemy);
            }
        }
        
        this.enemies.forEach(enemy => {
            if (enemy.alive) {
                enemy.update(deltaTime, this.waypoints);
                if (enemy.progress >= 1) {
                    enemy.alive = false;
                    this.loseLife();
                    this.createExplosion(enemy.x, enemy.y, '#ff6b6b', 16);
                }
            }
        });
        
        this.towers.forEach(tower => {
            tower.update(deltaTime, this.enemies, this.bullets);
        });
        
        this.bullets.forEach(bullet => {
            if (bullet.alive) {
                const result = bullet.update(deltaTime);
                if (result.hit && result.enemy) {
                    result.enemy.hp -= bullet.damage;
                    this.createExplosion(bullet.x, bullet.y, bullet.color, 8);
                    
                    if (result.enemy.hp <= 0) {
                        result.enemy.alive = false;
                        const reward = 10 + Math.floor(this.wave * 1.5);
                        this.money += reward;
                        this.score += reward;
                        this.kills++;
                        this.updateUI();
                        this.createExplosion(result.enemy.x, result.enemy.y, '#ff6b6b', 20);
                    }
                }
            }
        });
        
        this.enemies = this.enemies.filter(e => e.alive);
        this.bullets = this.bullets.filter(b => b.alive);
        this.particles = this.particles.filter(p => p.update(deltaTime));
        
        if (this.gameMode === 'campaign' && this.wave >= this.requiredWaves && !this.gameOver) {
            this.winGame();
        }
    }
    
    createExplosion(x, y, color, count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 150;
            const size = 2 + Math.random() * 5;
            const life = 0.3 + Math.random() * 0.5;
            this.particles.push(new Particle(x, y, color, size, {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            }, life));
        }
    }
    
    draw() {
        if (!this.gameStarted) return;
        
        const ctx = this.ctx;
        const w = this.canvas.width / this.dpr;
        const h = this.canvas.height / this.dpr;
        
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#081522');
        gradient.addColorStop(1, '#06121a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        
        this.drawPath();
        this.particles.forEach(p => p.draw(ctx));
        this.towers.forEach(t => t.draw(ctx, this.animationTime));
        this.enemies.forEach(e => e.draw(ctx, this.animationTime));
        this.bullets.forEach(b => b.draw(ctx));
    }
    
    drawPath() {
        const ctx = this.ctx;
        if (this.waypoints.length < 2) return;
        
        ctx.lineWidth = 40;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(46, 242, 123, 0.15)';
        
        ctx.beginPath();
        ctx.moveTo(this.waypoints[0].x, this.waypoints[0].y);
        for (let i = 1; i < this.waypoints.length; i++) {
            ctx.lineTo(this.waypoints[i].x, this.waypoints[i].y);
        }
        ctx.stroke();
        
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(46, 242, 123, 0.4)';
        ctx.setLineDash([15, 20]);
        
        ctx.beginPath();
        ctx.moveTo(this.waypoints[0].x, this.waypoints[0].y);
        for (let i = 1; i < this.waypoints.length; i++) {
            ctx.lineTo(this.waypoints[i].x, this.waypoints[i].y);
        }
        ctx.stroke();
        
        ctx.setLineDash([]);
    }
    
    gameLoop(timestamp) {
        if (!this.lastFrameTime) this.lastFrameTime = timestamp;
        const deltaTime = Math.min((timestamp - this.lastFrameTime) / 1000, 0.1);
        this.lastFrameTime = timestamp;
        
        this.update(deltaTime);
        this.draw();
        
        if (this.gameStarted && !this.gameOver) {
            requestAnimationFrame(this.gameLoop);
        }
    }
    
    start() {
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.animationTime = 0;
        requestAnimationFrame(this.gameLoop);
        console.log('[Game] Игровой цикл запущен');
    }
    
    stop() {
        this.gameStarted = false;
        console.log('[Game] Игра остановлена');
    }
}

class Enemy {
    constructor(hp, speed, delay = 0) {
        this.hp = this.maxHp = hp;
        this.speed = speed;
        this.progress = 0;
        this.delay = delay;
        this.alive = true;
        this.radius = 12;
        this.x = 0;
        this.y = 0;
        this.animationOffset = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 2 + Math.random() * 2;
        this.wobbleAmount = 2 + Math.random() * 2;
    }
    
    getPosition(waypoints) {
        if (!waypoints || waypoints.length < 2) return { x: 0, y: 0 };
        
        let totalLength = 0;
        for (let i = 0; i < waypoints.length - 1; i++) {
            totalLength += Math.hypot(waypoints[i + 1].x - waypoints[i].x, waypoints[i + 1].y - waypoints[i].y);
        }
        
        let distance = this.progress * totalLength;
        
        for (let i = 0; i < waypoints.length - 1; i++) {
            const dx = waypoints[i + 1].x - waypoints[i].x;
            const dy = waypoints[i + 1].y - waypoints[i].y;
            const segmentLength = Math.hypot(dx, dy);
            
            if (distance <= segmentLength) {
                const t = distance / segmentLength;
                return { x: waypoints[i].x + dx * t, y: waypoints[i].y + dy * t };
            }
            distance -= segmentLength;
        }
        return waypoints[waypoints.length - 1];
    }
    
    update(deltaTime, waypoints) {
        if (this.delay > 0) {
            this.delay -= deltaTime;
            return;
        }
        this.progress += deltaTime * this.speed / 100;
        if (this.progress > 1) this.progress = 1;
        const pos = this.getPosition(waypoints);
        this.x = pos.x;
        this.y = pos.y;
    }
    
    draw(ctx, time) {
        if (!this.alive) return;
        
        const pulse = 1 + Math.sin(time * 10 + this.animationOffset) * 0.05;
        const wobbleX = Math.sin(time * this.wobbleSpeed + this.animationOffset) * this.wobbleAmount;
        const wobbleY = Math.cos(time * this.wobbleSpeed + this.animationOffset) * this.wobbleAmount;
        const x = this.x + wobbleX;
        const y = this.y + wobbleY;
        const radius = this.radius * pulse;
        
        const gradient = ctx.createRadialGradient(x - 3, y - 3, 2, x, y, radius * 1.5);
        const healthPercent = this.hp / this.maxHp;
        const green = Math.floor(100 + 155 * healthPercent);
        gradient.addColorStop(0, `rgba(255, ${green}, ${green}, 0.95)`);
        gradient.addColorStop(0.7, `rgba(255, 80, 80, 0.7)`);
        gradient.addColorStop(1, 'rgba(255, 40, 40, 0)');
        
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x - 4, y - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 4, y - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#0a0a0a';
        ctx.beginPath();
        ctx.arc(x - 4 + Math.sin(time * 5) * 1, y - 4, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 4 + Math.sin(time * 5 + 2) * 1, y - 4, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(x - 20, y - 25, 40, 6);
        const healthWidth = 38 * (this.hp / this.maxHp);
        ctx.fillStyle = '#2ef27b';
        ctx.fillRect(x - 19, y - 24, healthWidth, 4);
    }
}

class Tower {
    constructor(x, y, name) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.range = 170;
        this.reload = 0;
        this.reloadTime = 0.55;
        this.damage = 40;
        this.level = 1;
        this.color = '#0ea5ff';
        this.rotation = Math.random() * Math.PI * 2;
        this.pulsePhase = Math.random() * Math.PI * 2;
    }
    
    update(deltaTime, enemies, bullets) {
        this.reload -= deltaTime;
        this.rotation += deltaTime * 2;
        
        if (this.reload <= 0) {
            let target = null;
            let minDistance = this.range;
            
            for (let enemy of enemies) {
                if (enemy.alive) {
                    const distance = Math.hypot(enemy.x - this.x, enemy.y - this.y);
                    if (distance < minDistance) {
                        minDistance = distance;
                        target = enemy;
                    }
                }
            }
            
            if (target) {
                bullets.push(new Bullet(this.x, this.y, target, this.damage, this.color));
                this.reload = this.reloadTime;
            }
        }
    }
    
    draw(ctx, time) {
        ctx.fillStyle = 'rgba(30, 40, 50, 0.9)';
        ctx.beginPath();
        this.roundRect(ctx, this.x - 24, this.y - 24, 48, 48, 8);
        ctx.fill();
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        this.roundRect(ctx, this.x - 20, this.y - 20, 40, 40, 6);
        ctx.fill();
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, -5, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, -5, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        ctx.fillStyle = '#dbeafe';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.name, this.x, this.y - 30);
        
        ctx.fillStyle = '#ffd166';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('L' + this.level, this.x, this.y + 32);
    }
    
    roundRect(ctx, x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
    }
}

class Bullet {
    constructor(x, y, target, damage, color = '#0ea5ff') {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.speed = 800;
        this.color = color;
        this.size = 6;
        this.alive = true;
        this.trail = [];
        this.age = 0;
    }
    
    update(deltaTime) {
        this.age += deltaTime;
        if (!this.target || !this.target.alive) {
            this.alive = false;
            return { hit: false };
        }
        
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.hypot(dx, dy);
        
        this.trail.push({ x: this.x, y: this.y, age: 0.2 });
        this.trail = this.trail.filter(t => { t.age -= deltaTime; return t.age > 0; });
        
        if (distance < 15) {
            this.alive = false;
            return { hit: true, enemy: this.target, x: this.target.x, y: this.target.y };
        }
        
        const moveX = (dx / distance) * this.speed * deltaTime;
        const moveY = (dy / distance) * this.speed * deltaTime;
        const newDistance = Math.hypot(this.target.x - (this.x + moveX), this.target.y - (this.y + moveY));
        
        if (newDistance > distance) {
            this.x = this.target.x;
            this.y = this.target.y;
        } else {
            this.x += moveX;
            this.y += moveY;
        }
        
        return { hit: false };
    }
    
    draw(ctx) {
        for (let t of this.trail) {
            ctx.globalAlpha = (t.age / 0.2) * 0.5;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(t.x, t.y, this.size * 0.7, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Particle {
    constructor(x, y, color, size, velocity, life = 0.8) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.vx = velocity.x;
        this.vy = velocity.y;
        this.life = life;
        this.maxLife = life;
    }
    
    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.life -= deltaTime * 1.5;
        this.vx *= 0.95;
        this.vy *= 0.95;
        this.size *= 0.98;
        return this.life > 0;
    }
    
    draw(ctx) {
        const alpha = Math.min(this.life / this.maxLife, 0.8);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

window.GameEngine = GameEngine;