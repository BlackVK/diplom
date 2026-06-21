class UIManager {
    constructor() {
        this.currentUser = null;
        this.gameMode = null;
        this.currentMap = 'wave';
        this.selectedCampaignLevel = 1;
        this.campaignLevels = {};
    }

    async init() {
        console.log('[UI] Инициализация интерфейса...');
        this.loadMenuTemplates();
        await this.loadCampaignLevels();
        this.setupEventListeners();
        this.checkSavedUser();
    }

    async loadCampaignLevels() {
        try {
            const result = await TD_API.getCampaignLevels();
            if (result.success && result.levels && result.levels.length > 0) {
                const levels = {};
                result.levels.forEach(level => {
                    levels[level.level_number] = {
                        title: level.title,
                        map: level.map,
                        objective: level.objective,
                        description: level.description || '',
                        tips: level.tips || [],
                        rewards: level.rewards || '',
                        wavesToWin: level.waves_to_win,
                        startingMoney: level.starting_money,
                        startingLives: level.starting_lives
                    };
                });
                this.campaignLevels = levels;
                console.log('[UI] Уровни загружены, количество:', Object.keys(levels).length);
            } else {
                console.warn('[UI] API не вернул уровни');
                this.campaignLevels = {};
            }
        } catch (error) {
            console.error('[UI] Ошибка загрузки уровней:', error);
            this.campaignLevels = {};
        }
        this.renderCampaignLevels();
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
                    <div id="campaignLevelsList" class="map-selection"></div>
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

        this.attachMenuEvents();
    }

    renderCampaignLevels() {
        const container = document.getElementById('campaignLevelsList');
        if (!container) {
            console.error('[UI] Контейнер #campaignLevelsList не найден');
            return;
        }

        console.log('[UI] Рендеринг уровней, данные:', this.campaignLevels);

        const progress = this.currentUser ? (this.currentUser.campaignProgress || 1) : 1;
        container.innerHTML = '';

        const levelKeys = Object.keys(this.campaignLevels);
        if (levelKeys.length === 0) {
            container.innerHTML = '<p style="color: #9fb0c2;">Уровни не загружены</p>';
            return;
        }

        for (let i = 1; i <= 5; i++) {
            const level = this.campaignLevels[i];
            if (!level) continue;

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
        const token = localStorage.getItem('api_token');

        if (savedUser && token) {
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

        setTimeout(() => {
            this.loadUserStats();
        }, 300);
    }

    showSandboxMaps() {
        this.showSection('sandboxMapSection');
        this.currentMap = 'wave';

        document.querySelectorAll('.map-card[data-map]').forEach(card => {
            card.classList.remove('selected');
            if (card.dataset.map === 'wave') {
                card.classList.add('selected');
            }
        });

        this.updateMapInfo();
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
            const response = await fetch(`${API_URL}leaderboard/${mapId}?sort=${sort}`);
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
        if (!this.currentUser || this.currentUser.username === 'Гость') {
            document.getElementById('userBestWave').textContent = '0';
            document.getElementById('userTotalKills').textContent = '0';
            return;
        }

        const token = localStorage.getItem('api_token');
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}user/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
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
            document.getElementById('userBestWave').textContent = '0';
            document.getElementById('userTotalKills').textContent = '0';
        }
    }

    updateMapInfo() {
        const mapInfo = document.getElementById('mapInfo');
        if (mapInfo) {
            mapInfo.textContent = `Карта: ${this.getMapName(this.currentMap)}`;
        }
    }

    selectMap(mapId) {
        this.currentMap = mapId;
        document.querySelectorAll('.map-card[data-map]').forEach(card => {
            card.classList.remove('selected');
            if (card.dataset.map === mapId) card.classList.add('selected');
        });
        this.updateMapInfo();
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

        if (!email || !email.includes('@') || !email.includes('.')) {
            alert('Введите корректный email (пример: user@mail.ru)');
            return;
        }

        if (/[а-яА-ЯёЁ]/.test(email)) {
            alert('Email должен содержать только латинские символы');
            return;
        }

        if (window.TD_API) {
            try {
                const result = await window.TD_API.register(username, email, password);

                if (result.success) {
                    this.currentUser = {
                        id: result.user.id,
                        username: result.user.username,
                        email: result.user.email,
                        campaignProgress: result.user.campaign_progress || 1
                    };

                    sessionStorage.setItem('td_current_user', JSON.stringify(this.currentUser));

                    const loginResult = await window.TD_API.login(username, password);
                    if (loginResult.success && loginResult.token) {
                        console.log('Автовход выполнен');
                    }

                    const userNameSpan = document.getElementById('currentUserName');
                    if (userNameSpan) userNameSpan.textContent = this.currentUser.username;

                    this.showMainMenu();
                } else {
                    alert(result.message || 'Ошибка регистрации');
                }
            } catch (error) {
                console.error('Ошибка регистрации:', error);
                alert('Ошибка при регистрации');
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
            if (!levelData) {
                alert('Данные уровня не найдены');
                return;
            }
            window.game.init('campaign', levelData.map, levelData);
            const titleEl = document.getElementById('gameTitle');
            if (titleEl) titleEl.textContent = levelData.title;
            this.showLevelDescription();
        } else {
            window.game.init('sandbox', this.currentMap);
            const titleEl = document.getElementById('gameTitle');
            if (titleEl) titleEl.textContent = `∞ Бесконечный режим: ${this.getMapName(this.currentMap)}`;
            this.updateMapInfo();
        }

        window.game.start();
    }

    showLevelDescription() {
        const levelData = this.campaignLevels[this.selectedCampaignLevel];
        if (!levelData) return;

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