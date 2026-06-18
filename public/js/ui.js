class UIManager {
    constructor() {
        this.currentUser = null;
        this.gameMode = null;
        this.currentMap = 'wave';
        this.selectedCampaignLevel = 1;
        
        this.campaignLevels = {
            1: {
                title: "Уровень 1: Основы",
                map: "wave",
                objective: "Пройдите 5 волн врагов",
                description: "В этом уровне вы научитесь основам игры",
                tips: ["Начните с построения башен на ключевых точках", "Используйте build_tower('имя', x, y)", "Размещайте башни на изгибах пути"],
                rewards: "Откроется Уровень 2",
                wavesToWin: 5,
                startingMoney: 150,
                startingLives: 10
            },
            2: {
                title: "Уровень 2: Улучшения",
                map: "curve",
                objective: "Пройдите 8 волн",
                tips: ["Постройте минимум 3 башни", "Улучшайте башни с помощью upgrade_tower()", "Балансируйте между строительством и улучшением"],
                rewards: "Откроется Уровень 3",
                wavesToWin: 8,
                startingMoney: 200,
                startingLives: 10
            },
            3: {
                title: "Уровень 3: Лабиринт",
                map: "zigzag",
                objective: "Пройдите 10 волн",
                tips: ["Размещайте башни в точках смены направления", "Используйте башни с максимальной дальностью"],
                rewards: "Откроется Уровень 4",
                wavesToWin: 10,
                startingMoney: 250,
                startingLives: 10
            },
            4: {
                title: "Уровень 4: Зигзаг",
                map: "zigzag",
                objective: "Пройдите 12 волн",
                tips: ["Экономьте деньги", "Сначала улучшайте ключевые башни"],
                rewards: "Откроется Уровень 5",
                wavesToWin: 12,
                startingMoney: 200,
                startingLives: 8
            },
            5: {
                title: "Уровень 5: Финальный",
                map: "straight",
                objective: "Пройдите 15 волн",
                tips: ["Стройте башни близко к пути", "Создайте несколько линий защиты"],
                rewards: "Завершение кампании",
                wavesToWin: 15,
                startingMoney: 300,
                startingLives: 10
            }
        };
    }
    
    async init() {
        console.log('[UI] Инициализация интерфейса...');
        this.loadMenuTemplates();
        this.setupEventListeners();
        this.checkSavedUser();
    }
    
    loadMenuTemplates() {
        const mainMenu = document.getElementById('mainMenu');
        if (!mainMenu) return;
        
        mainMenu.innerHTML = `
            <div class="menu-container">
                <div id="loginSection" class="menu-section active">
                    <h1 class="menu-title">🚀 Tower Defense Python</h1>
                    <p class="menu-subtitle">Управляйте защитой с помощью Python кода</p>
                    <div class="input-group"><input type="text" id="loginUsername" placeholder="Имя пользователя"></div>
                    <div class="input-group"><input type="password" id="loginPassword" placeholder="Пароль"></div>
                    <button class="btn-menu" id="loginBtn">Войти</button>
                    <button class="btn-menu btn-secondary" id="showRegisterBtn">Регистрация</button>
                    <button class="btn-menu btn-secondary" id="guestBtn">Играть как гость</button>
                </div>
                
                <div id="registerSection" class="menu-section">
                    <h1 class="menu-title">📝 Регистрация</h1>
                    <div class="input-group"><input type="text" id="registerUsername" placeholder="Имя пользователя (мин. 3 символа)"></div>
                    <div class="input-group"><input type="email" id="registerEmail" placeholder="Email"></div>
                    <div class="input-group"><input type="password" id="registerPassword" placeholder="Пароль (мин. 4 символа)"></div>
                    <div class="input-group"><input type="password" id="registerConfirm" placeholder="Подтвердите пароль"></div>
                    <button class="btn-menu" id="registerBtn">Зарегистрироваться</button>
                    <button class="btn-menu btn-secondary" id="backToLoginBtn">Назад к входу</button>
                </div>
                
                <div id="mainMenuSection" class="menu-section">
                    <div class="user-info">
                        <h3>Добро пожаловать, <span id="currentUserName">Гость</span>!</h3>
                        <div class="user-stats">
                            <div class="stat-item"><span class="stat-value" id="userBestWave">0</span><span>Лучшая волна</span></div>
                            <div class="stat-item"><span class="stat-value" id="userTotalKills">0</span><span>Всего убито</span></div>
                        </div>
                    </div>
                    <button class="btn-menu" id="campaignBtn">🎮 Кампания</button>
                    <button class="btn-menu" id="sandboxBtn">∞ Бесконечный режим</button>
                    <button class="btn-menu btn-secondary" id="leaderboardBtn">🏆 Таблица лидеров</button>
                    <button class="btn-menu btn-secondary" id="logoutBtn">🚪 Выйти</button>
                </div>
                
                <div id="sandboxMapSection" class="menu-section">
                    <h1 class="menu-title">∞ Выбор карты</h1>
                    <div class="map-selection">
                        <div class="map-card" data-map="wave"><h4>🌊 Волновая</h4><span class="map-difficulty">Легкая</span></div>
                        <div class="map-card" data-map="zigzag"><h4>⚡ Зигзаг</h4><span class="map-difficulty">Средняя</span></div>
                        <div class="map-card" data-map="curve"><h4>🌀 Извилистая</h4><span class="map-difficulty">Сложная</span></div>
                        <div class="map-card" data-map="straight"><h4>➡️ Прямая</h4><span class="map-difficulty">Экстремальная</span></div>
                    </div>
                    <button class="btn-menu" id="startSandboxBtn">Начать игру</button>
                    <button class="btn-menu btn-secondary" id="backToMainFromSandboxBtn">← Назад</button>
                </div>
                
                <div id="campaignLevelsSection" class="menu-section">
                    <h1 class="menu-title">🎮 Кампания</h1>
                    <div class="map-selection" id="campaignLevelsList"></div>
                    <button class="btn-menu" id="startCampaignBtn" disabled>Начать уровень</button>
                    <button class="btn-menu btn-secondary" id="backToMainFromCampaignBtn">← Назад</button>
                </div>
                
                <div id="leaderboardSection" class="menu-section">
                    <h1 class="menu-title">🏆 Таблица лидеров</h1>
                    <select id="leaderboardMapSelect">
                        <option value="wave">🌊 Волновая</option>
                        <option value="zigzag">⚡ Зигзаг</option>
                        <option value="curve">🌀 Извилистая</option>
                        <option value="straight">➡️ Прямая</option>
                    </select>
                    <select id="leaderboardSortSelect">
                        <option value="waves">🏆 По волнам</option>
                        <option value="kills">💀 По убийствам</option>
                        <option value="score">⭐ По очкам</option>
                    </select>
                    <div class="leaderboard-container">
                        <table class="leaderboard-table">
                            <thead><tr><th>#</th><th>Игрок</th><th>Волна</th><th>Убийства</th><th>Очки</th></tr></thead>
                            <tbody id="leaderboardTable"></tbody>
                        </table>
                    </div>
                    <button class="btn-menu btn-secondary" id="backToMainFromLeaderboardBtn">← Назад</button>
                </div>
            </div>
        `;
        
        this.renderCampaignLevels();
        this.attachMenuEvents();
    }
    
    attachMenuEvents() {
        document.getElementById('loginBtn')?.addEventListener('click', () => this.login());
        document.getElementById('showRegisterBtn')?.addEventListener('click', () => this.showRegister());
        document.getElementById('guestBtn')?.addEventListener('click', () => this.playAsGuest());
        document.getElementById('registerBtn')?.addEventListener('click', () => this.register());
        document.getElementById('backToLoginBtn')?.addEventListener('click', () => this.showLogin());
        document.getElementById('campaignBtn')?.addEventListener('click', () => this.showCampaignLevels());
        document.getElementById('sandboxBtn')?.addEventListener('click', () => this.showSandboxMaps());
        document.getElementById('leaderboardBtn')?.addEventListener('click', () => this.showLeaderboard());
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
        document.getElementById('startSandboxBtn')?.addEventListener('click', () => this.startSandbox());
        document.getElementById('backToMainFromSandboxBtn')?.addEventListener('click', () => this.showMainMenu());
        document.getElementById('startCampaignBtn')?.addEventListener('click', () => this.startCampaign());
        document.getElementById('backToMainFromCampaignBtn')?.addEventListener('click', () => this.showMainMenu());
        document.getElementById('backToMainFromLeaderboardBtn')?.addEventListener('click', () => this.showMainMenu());
        
        document.getElementById('leaderboardMapSelect')?.addEventListener('change', () => this.loadLeaderboard());
        document.getElementById('leaderboardSortSelect')?.addEventListener('change', () => this.loadLeaderboard());
        
        document.querySelectorAll('.map-card[data-map]').forEach(card => {
            card.addEventListener('click', () => {
                const mapId = card.dataset.map;
                this.selectMap(mapId);
            });
        });
    }
    
    renderCampaignLevels() {
        const container = document.getElementById('campaignLevelsList');
        if (!container) return;
        
        const progress = this.currentUser ? (this.currentUser.campaignProgress || 1) : 1;
        
        container.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            const level = this.campaignLevels[i];
            const isLocked = i > progress;
            const isCompleted = i < progress;
            
            const div = document.createElement('div');
            div.className = `map-card campaign-level ${isLocked ? 'locked' : ''}`;
            div.setAttribute('data-level', i);
            div.innerHTML = `
                <h4>${isCompleted ? '✅' : (isLocked ? '🔒' : '🎯')} Уровень ${i}: ${level.title.split(': ')[1] || level.title}</h4>
                <span class="map-difficulty">${this.getDifficultyLabel(i)}</span>
                <p>${level.objective}</p>
            `;
            if (!isLocked) {
                div.addEventListener('click', () => this.selectCampaignLevel(i));
            }
            container.appendChild(div);
        }
    }
    
    getDifficultyLabel(level) {
        const labels = {1: 'Обучение', 2: 'Легкий', 3: 'Средний', 4: 'Сложный', 5: 'Экстремальный'};
        return labels[level];
    }
    
    setupEventListeners() {
        setTimeout(() => {
            const menuBtn = document.getElementById('menuBtn');
            if (menuBtn) menuBtn.addEventListener('click', () => this.returnToMenu());
            
            const resetBtn = document.getElementById('resetBtn');
            if (resetBtn) resetBtn.addEventListener('click', () => {
                if (window.game) window.game.reset_game();
            });
            
            const toggleRulerBtn = document.getElementById('toggleRulerBtn');
            if (toggleRulerBtn) {
                toggleRulerBtn.addEventListener('click', () => {
                    const ruler = document.getElementById('ruler');
                    if (ruler) {
                        const isVisible = ruler.style.display !== 'none';
                        ruler.style.display = isVisible ? 'none' : 'block';
                    }
                });
            }
        }, 100);
    }
    
    checkSavedUser() {
        const savedUser = sessionStorage.getItem('td_current_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                if (!this.currentUser.campaignProgress) this.currentUser.campaignProgress = 1;
                this.showMainMenu();
            } catch (e) {
                this.showLogin();
            }
        } else {
            this.showLogin();
        }
    }
    
    showSection(sectionId) {
        document.querySelectorAll('.menu-section').forEach(s => s.classList.remove('active'));
        const section = document.getElementById(sectionId);
        if (section) section.classList.add('active');
    }
    
    showLogin() {
        this.showSection('loginSection');
    }
    
    showRegister() {
        this.showSection('registerSection');
    }
    
    showMainMenu() {
        this.showSection('mainMenuSection');
        this.renderCampaignLevels();
        
        const userNameSpan = document.getElementById('currentUserName');
        if (userNameSpan) {
            if (this.currentUser && this.currentUser.username !== 'Гость') {
                userNameSpan.textContent = this.currentUser.username;
            } else {
                userNameSpan.textContent = 'Гость';
            }
        }
        
        this.loadUserStats();
    }
    
    showSandboxMaps() {
        this.showSection('sandboxMapSection');
        this.currentMap = 'wave';
    }
    
    showCampaignLevels() {
        this.showSection('campaignLevelsSection');
        this.renderCampaignLevels();
        const startBtn = document.getElementById('startCampaignBtn');
        if (startBtn) startBtn.disabled = true;
    }
    
    async showLeaderboard() {
        this.showSection('leaderboardSection');
        await this.loadLeaderboard();
    }
    
    async loadLeaderboard() {
        const mapId = document.getElementById('leaderboardMapSelect')?.value || 'wave';
        const sort = document.getElementById('leaderboardSortSelect')?.value || 'waves';
        const tbody = document.getElementById('leaderboardTable');
        if (!tbody) return;
        
        try {
            const response = await fetch(`http://localhost:3000/api/leaderboard/${mapId}?sort=${sort}`);
            const data = await response.json();
            
            tbody.innerHTML = '';
            if (data.leaderboard && data.leaderboard.length > 0) {
                data.leaderboard.forEach((entry, index) => {
                    tbody.innerHTML += `<tr><td>${index + 1}</td><td>${entry.username}</td><td>${entry.wave}</td><td>${entry.kills || 0}</td><td>${entry.score}</td></tr>`;
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Нет записей</td></tr>';
            }
        } catch (error) {
            console.error('Ошибка загрузки лидерборда:', error);
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Ошибка загрузки</td></tr>';
        }
    }
    
    async loadUserStats() {
        if (!this.currentUser || this.currentUser.username === 'Гость') return;
        
        try {
            const response = await fetch('http://localhost:3000/api/user/stats', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('api_token')}` }
            });
            const data = await response.json();
            
            if (data.success) {
                const bestWaveSpan = document.getElementById('userBestWave');
                const totalKillsSpan = document.getElementById('userTotalKills');
                if (bestWaveSpan) bestWaveSpan.textContent = data.stats?.best_wave || 0;
                if (totalKillsSpan) totalKillsSpan.textContent = data.stats?.total_kills || 0;
            }
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
        }
    }
    
    selectMap(mapId) {
        this.currentMap = mapId;
        document.querySelectorAll('.map-card[data-map]').forEach(card => {
            card.classList.remove('selected');
            if (card.dataset.map === mapId) card.classList.add('selected');
        });
    }
    
    selectCampaignLevel(level) {
        const progress = this.currentUser ? (this.currentUser.campaignProgress || 1) : 1;
        if (level > progress) return;
        
        this.selectedCampaignLevel = level;
        document.querySelectorAll('.campaign-level').forEach(card => {
            card.classList.remove('selected');
            if (parseInt(card.dataset.level) === level) card.classList.add('selected');
        });
        
        const startBtn = document.getElementById('startCampaignBtn');
        if (startBtn) startBtn.disabled = false;
    }
    
    async login() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!username || !password) {
            alert('Введите имя пользователя и пароль');
            return;
        }
        
        if (window.TD_API) {
            const result = await window.TD_API.login(username, password);
            
            if (result.success && result.user) {
                this.currentUser = {
                    id: result.user.id,
                    username: result.user.username,
                    email: result.user.email,
                    campaignProgress: result.user.campaign_progress || 1
                };
                sessionStorage.setItem('td_current_user', JSON.stringify(this.currentUser));
                
                const userNameSpan = document.getElementById('currentUserName');
                if (userNameSpan) userNameSpan.textContent = this.currentUser.username;
                
                this.showMainMenu();
            } else {
                alert(result.message || 'Ошибка входа');
            }
        }
    }
    
    async register() {
        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirm = document.getElementById('registerConfirm').value;
        
        if (password !== confirm) {
            alert('Пароли не совпадают');
            return;
        }
        
        if (window.TD_API) {
            const result = await window.TD_API.register(username, email, password);
            if (result.success) {
                this.currentUser = result.user;
                sessionStorage.setItem('td_current_user', JSON.stringify(this.currentUser));
                this.showMainMenu();
            } else {
                alert(result.message);
            }
        }
    }
    
    async logout() {
        if (window.TD_API) await window.TD_API.logout();
        this.currentUser = null;
        sessionStorage.removeItem('td_current_user');
        this.showLogin();
    }
    
    playAsGuest() {
        this.currentUser = { id: 'guest_' + Date.now(), username: 'Гость', campaignProgress: 1 };
        this.startSandbox();
    }
    
    startSandbox() {
        this.gameMode = 'sandbox';
        this.startGame();
    }
    
    startCampaign() {
        if (!this.selectedCampaignLevel) {
            alert('Выберите уровень');
            return;
        }
        const progress = this.currentUser ? (this.currentUser.campaignProgress || 1) : 1;
        if (this.selectedCampaignLevel > progress) {
            alert(`Уровень ${this.selectedCampaignLevel} ещё не открыт!`);
            return;
        }
        this.gameMode = 'campaign';
        this.startGame();
    }
    
    startGame() {
        const mainMenu = document.getElementById('mainMenu');
        const container = document.querySelector('.container');
        
        if (mainMenu) mainMenu.style.display = 'none';
        if (container) container.style.display = 'flex';
        
        if (!window.game) window.game = new GameEngine();
        
        if (this.gameMode === 'campaign') {
            const levelData = this.campaignLevels[this.selectedCampaignLevel];
            window.game.init('campaign', levelData.map, levelData);
            const titleEl = document.getElementById('gameTitle');
            if (titleEl) titleEl.textContent = levelData.title;
            this.showLevelDescription();
        } else {
            window.game.init('sandbox', this.currentMap);
            const titleEl = document.getElementById('gameTitle');
            if (titleEl) titleEl.textContent = `∞ Бесконечный режим: ${this.getMapName(this.currentMap)}`;
        }
        
        window.game.start();
    }
    
    showLevelDescription() {
        const levelData = this.campaignLevels[this.selectedCampaignLevel];
        const levelDescription = document.getElementById('levelDescription');
        if (!levelDescription) return;
        
        const titleEl = document.getElementById('levelDescriptionTitle');
        const objectiveEl = document.getElementById('levelObjectiveText');
        const rewardEl = document.getElementById('levelRewardText');
        const tipsList = document.getElementById('levelTipsList');
        
        if (titleEl) titleEl.textContent = levelData.title;
        if (objectiveEl) objectiveEl.textContent = levelData.objective;
        if (rewardEl) rewardEl.textContent = levelData.rewards;
        
        if (tipsList) {
            tipsList.innerHTML = '';
            levelData.tips.forEach(tip => {
                const li = document.createElement('li');
                li.textContent = tip;
                tipsList.appendChild(li);
            });
        }
        
        levelDescription.style.display = 'flex';
        const startBtn = levelDescription.querySelector('.start-level-btn');
        if (startBtn) startBtn.onclick = () => { levelDescription.style.display = 'none'; };
    }
    
    getMapName(mapId) {
        const names = { wave: 'Волновая', zigzag: 'Зигзаг', curve: 'Извилистая', straight: 'Прямая' };
        return names[mapId] || mapId;
    }
    
    returnToMenu() {
        if (window.game) { window.game.stop(); window.game = null; }
        const container = document.querySelector('.container');
        const mainMenu = document.getElementById('mainMenu');
        if (container) container.style.display = 'none';
        if (mainMenu) mainMenu.style.display = 'flex';
        this.showMainMenu();
    }
    
    updateGameUI(stats) {
        const livesEl = document.getElementById('lives');
        const waveEl = document.getElementById('wave');
        const moneyEl = document.getElementById('money');
        const scoreEl = document.getElementById('score');
        if (livesEl) livesEl.textContent = `Жизни: ${stats.lives}`;
        if (waveEl) waveEl.textContent = `Волна: ${stats.wave}`;
        if (moneyEl) moneyEl.textContent = `Деньги: ${stats.money}`;
        if (scoreEl) scoreEl.textContent = `Счёт: ${stats.score}`;
    }
    
    updateMouseCoords(x, y) {
        const mouseX = document.getElementById('mouseX');
        const mouseY = document.getElementById('mouseY');
        const canvasWidth = document.getElementById('canvasWidth');
        const canvasHeight = document.getElementById('canvasHeight');
        if (mouseX) mouseX.textContent = x;
        if (mouseY) mouseY.textContent = y;
        if (canvasWidth && window.game?.canvas) canvasWidth.textContent = Math.round(window.game.canvas.width / window.game.dpr);
        if (canvasHeight && window.game?.canvas) canvasHeight.textContent = Math.round(window.game.canvas.height / window.game.dpr);
    }
    
    async saveGameResult(result) {
        if (!this.currentUser || this.currentUser.username === 'Гость') return;
        
        try {
            const saveData = {
                wave: result.wave,
                score: result.score,
                kills: result.kills,
                towersBuilt: result.towersBuilt,
                upgrades: result.upgrades,
                playTime: result.playTime || 0,
                mapId: this.currentMap || 'wave',
                gameMode: this.gameMode,
                won: result.won || false,
                levelCompleted: this.selectedCampaignLevel || 1,
                username: this.currentUser.username
            };
            
            if (window.TD_API) {
                await window.TD_API.saveGame(saveData);
                
                if (result.won && this.gameMode === 'campaign') {
                    const nextLevel = (this.selectedCampaignLevel || 1) + 1;
                    if (nextLevel > (this.currentUser.campaignProgress || 1)) {
                        this.currentUser.campaignProgress = nextLevel;
                        sessionStorage.setItem('td_current_user', JSON.stringify(this.currentUser));
                        if (window.TD_API) {
                            await TD_API.updateProgress(nextLevel);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Ошибка сохранения:', error);
        }
    }
    
    showGameWin(result) {
        result.won = true;
        this.showGameOver(result);
    }
    
    showGameOver(result) {
        const gameOver = document.getElementById('gameOver');
        if (!gameOver) return;
        
        const isWin = result.won === true;
        
        if (isWin) {
            gameOver.innerHTML = `
                <div class="game-over-text" style="color: #2ef27b;">ПОБЕДА!</div>
                <div class="game-over-subtext">Уровень ${this.selectedCampaignLevel} пройден!</div>
                <div class="game-over-stats">
                    <div>🏆 Волна: ${result.wave}</div>
                    <div>⭐ Счёт: ${result.score}</div>
                    <div>💀 Убито: ${result.kills}</div>
                    <div>🏗️ Башен: ${result.towersBuilt}</div>
                </div>
                <div class="game-over-subtext pulse">Нажмите любую кнопку</div>
            `;
        } else {
            gameOver.innerHTML = `
                <div class="game-over-text" style="color: #ff6b6b;">ПОРАЖЕНИЕ!</div>
                <div class="game-over-subtext">Вы погибли на волне ${result.wave}</div>
                <div class="game-over-stats">
                    <div>😵 Волна: ${result.wave}</div>
                    <div>⭐ Счёт: ${result.score}</div>
                    <div>💀 Убито: ${result.kills}</div>
                    <div>🏗️ Башен: ${result.towersBuilt}</div>
                </div>
                <div class="game-over-subtext pulse">Нажмите любую кнопку</div>
            `;
        }
        
        gameOver.style.display = 'flex';
        this.saveGameResult(result);
        
        if (this.currentUser && this.currentUser.username !== 'Гость') {
            this.loadUserStats();
            this.renderCampaignLevels();
        }
        
        const continueHandler = () => {
            gameOver.style.display = 'none';
            this.returnToMenu();
            document.removeEventListener('keydown', continueHandler);
            document.removeEventListener('click', continueHandler);
        };
        document.addEventListener('keydown', continueHandler);
        document.addEventListener('click', continueHandler);
    }
}

window.UIManager = UIManager;