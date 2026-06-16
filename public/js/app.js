class TowerDefenseApp {
    constructor() {
        this.ui = null;
        this.editor = null;
    }
    
    async init() {
        console.log('[App] Инициализация приложения...');
        
        this.ui = new UIManager();
        await this.ui.init();
        
        this.editor = new CodeEditor();
        await this.editor.init();
        
        window.ui = this.ui;
        window.editor = this.editor;
        window.GameEngine = GameEngine;
        
        this.setupGlobalHandlers();
        
        console.log('[App] Приложение успешно инициализировано');
    }
    
    setupGlobalHandlers() {
        window.addEventListener('resize', () => {
            if (window.game && window.game.canvas) {
                window.game.resizeCanvas();
            }
            if (window.editor && window.editor.editor) {
                setTimeout(() => window.editor.editor.refresh(), 100);
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && window.game && document.querySelector('.container').style.display !== 'none') {
                if (window.ui) window.ui.returnToMenu();
            }
        });
    }
}

window.updateGameUI = function(stats) {
    if (window.ui) window.ui.updateGameUI(stats);
};

window.updateMouseCoords = function(x, y) {
    if (window.ui) window.ui.updateMouseCoords(x, y);
};

window.showGameOver = function(result) {
    if (window.ui) window.ui.showGameOver(result);
};

window.showGameWin = function(result) {
    if (window.ui) window.ui.showGameWin(result);
};

window.log = function(message) {
    if (window.editor) window.editor.log(message);
};

document.addEventListener('DOMContentLoaded', () => {
    window.app = new TowerDefenseApp();
    window.app.init();
});