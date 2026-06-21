class CodeEditor {
    constructor() {
        this.editor = null;
        this.pyodide = null;
        this.pyodideReady = false;
        this.currentScript = null;
        this.savedScripts = [];
    }
    
    async init() {
        console.log('[Editor] Инициализация редактора...');
        this.setupEditor();
        await this.loadPyodide();
        this.setupEventListeners();
        this.loadGuideContent();
        console.log('[Editor] Редактор инициализирован');
    }
    
    setupEditor() {
        const editorContainer = document.getElementById('editor');
        editorContainer.innerHTML = '';
        
        this.editor = CodeMirror(editorContainer, {
            mode: 'python',
            theme: 'dracula',
            lineNumbers: true,
            lineWrapping: false,
            indentUnit: 4,
            tabSize: 4,
            indentWithTabs: false,
            electricChars: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            styleActiveLine: true,
            showCursorWhenSelecting: true,
            cursorBlinkRate: 530,
            value: '# Напишите код для управления башнями\n\n# Пример:\nbuild_tower("левая", 150, 200)\nbuild_tower("правая", 650, 200)\nbuild_tower("центр", 400, 350)\n\n# Запустите волну врагов\nspawn_wave()',
            extraKeys: {
                "Ctrl-Enter": () => this.runCode(),
                "Cmd-Enter": () => this.runCode(),
                "Tab": (cm) => {
                    if (cm.somethingSelected()) {
                        cm.indentSelection("add");
                    } else {
                        cm.replaceSelection("    ", "end");
                    }
                }
            }
        });
        
        this.editor.setSize("100%", "100%");
        setTimeout(() => {
            if (this.editor) {
                this.editor.focus();
                this.editor.refresh();
            }
        }, 100);
    }
    
    async loadPyodide() {
        try {
            console.log('[Editor] Загрузка Pyodide...');
            this.pyodide = await loadPyodide();
            this.pyodideReady = true;
            console.log('[Editor] Pyodide загружен успешно');
            this.setupPythonGlobals();
            this.log("✅ Python готов к использованию!");
        } catch (error) {
            console.error('[Editor] Ошибка загрузки Pyodide:', error);
            this.log("❌ Ошибка загрузки Python: " + error.message);
        }
    }
    
    setupPythonGlobals() {
        if (!this.pyodide) return;
        
        this.pyodide.globals.set("build_tower", (name, x, y) => {
            if (!window.game) return false;
            return window.game.build_tower(name, x, y);
        });
        
        this.pyodide.globals.set("upgrade_tower", (name) => {
            if (!window.game) return false;
            return window.game.upgrade_tower(name);
        });
        
        this.pyodide.globals.set("spawn_wave", () => {
            if (!window.game) return false;
            return window.game.spawn_wave();
        });
        
        this.pyodide.globals.set("reset_game", () => {
            if (!window.game) return false;
            return window.game.reset_game();
        });
        
        this.pyodide.globals.set("get_towers", () => {
            if (!window.game) return [];
            return window.game.get_towers();
        });
        
        this.pyodide.globals.set("print", (...args) => {
            const message = args.map(arg => String(arg)).join(' ');
            this.log("📝 " + message);
        });
        
        this.pyodide.globals.set("math", Math);
        
        console.log('[Editor] Глобальные функции Python установлены');
    }
    
    async runCode() {
        if (!this.pyodideReady) {
            this.log("⏳ Python ещё не готов...");
            return;
        }
        
        const code = this.editor.getValue();
        if (!code.trim()) {
            this.log("ℹ️ Введите код для выполнения");
            return;
        }
        
        this.log("🚀 Выполнение кода...");
        
        try {
            const startTime = performance.now();
            await this.pyodide.runPythonAsync(code);
            const endTime = performance.now();
            const executionTime = (endTime - startTime).toFixed(2);
            this.log(`✅ Код выполнен успешно за ${executionTime}мс`);
        } catch (error) {
            console.error('[Editor] Ошибка выполнения:', error);
            this.log(`❌ Ошибка Python: ${error.message}`);
        }
    }
    
    loadGuideContent() {
    const guideContent = document.getElementById('guideContent');
    if (!guideContent) return;
    
    guideContent.innerHTML = `
        <h3>Управление игрой через Python</h3>
        
        <h4>Основные функции:</h4>
        <ul>
            <li><code>build_tower("имя", x, y)</code> - построить именованную башню</li>
            <li><code>upgrade_tower("имя")</code> - улучшить башню по имени</li>
            <li><code>spawn_wave()</code> - запустить волну врагов</li>
            <li><code>reset_game()</code> - сбросить игру</li>
            <li><code>get_towers()</code> - получить список всех башен</li>
            <li><code>get_game_state()</code> - получить состояние игры</li>
            <li><code>wait_for_wave_end()</code> - ждать окончания волны</li>
        </ul>

        <h4>🔄 Цикл for</h4>
        <p>Выполняет блок кода для каждого элемента в последовательности.</p>
        <pre>
for i in range(5):
    build_tower(f"башня_{i}", 100 + i * 80, 250)</pre>

        <h4>🔄 Цикл while</h4>
        <p>Выполняет блок кода, пока условие истинно.</p>
        <pre>
while get_game_state()['lives'] > 0:
    spawn_wave()
    wait_for_wave_end()</pre>
        <h4>📊 get_game_state()</h4>
        <p>Возвращает состояние игры:</p>
        <ul>
            <li><code>wave</code> — номер волны</li>
            <li><code>enemies</code> — врагов на поле</li>
            <li><code>money</code> — доступные деньги</li>
            <li><code>lives</code> — оставшиеся жизни</li>
            <li><code>isWaveActive</code> — идёт ли битва</li>
        </ul>
        <pre>
get_game_state()['money']</pre>

        <h4>🏗️ get_towers()</h4>
        <p>Возвращает список башен:</p>
        <ul>
            <li><code>name</code> — имя башни</li>
            <li><code>level</code> — уровень (1-5)</li>
            <li><code>damage</code> — урон</li>
            <li><code>range</code> — радиус действия</li>
        </ul>
        <pre>
get_towers()[0]['name']</pre>

        <h4>💰 Экономика</h4>
        <ul>
            <li>Постройка башни: 50 + (каждая следующая на 20% дороже)</li>
            <li>Улучшение башни: 30 + (каждое следующее на 30% дороже)</li>
            <li>Убийство врага: +10 + (1.5 × номер волны)</li>
            <li>Начальный капитал: 100</li>
            <li>Начальные жизни: 10</li>
        </ul>

        <h4>❗ Правила</h4>
        <ul>
            <li>Нельзя строить/улучшать во время волны</li>
            <li>Имена башен уникальны</li>
            <li>Минимальное расстояние между башнями — 60 пикселей</li>
            <li>Нельзя ставить башни на дорогу</li>
        </ul>
        
        <h4>❌ Частые ошибки</h4>
        <ul>
            <li><code>NameError: name '...' is not defined</code> — команда не существует</li>
            <li><code>Недостаточно денег. Нужно: 50</code> — нет денег на постройку</li>
            <li><code>Недостаточно денег. Нужно: 30</code> — нет денег на улучшение</li>
            <li><code>Башня с именем "xxx" уже существует</code> — имя занято</li>
            <li><code>Слишком близко к другой башне</code> — расстояние меньше 60px</li>
            <li><code>Координаты за пределами карты</code> — выход за границы</li>
            <li><code>Нельзя ставить башню на дорогу</code> — попытка построить на пути врагов</li>
        </ul>
    `;
}
    
    setupEventListeners() {
        const runBtn = document.getElementById('runBtn');
        if (runBtn) {
            runBtn.addEventListener('click', () => this.runCode());
        }
        
        const clearBtn = document.getElementById('clearConsoleBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                const consoleEl = document.getElementById('console');
                if (consoleEl) {
                    consoleEl.innerHTML = '';
                    this.log("🗑️ Консоль очищена");
                }
            });
        }
        
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                const editorEl = document.getElementById('editor');
                const guidePanel = document.getElementById('guidePanel');
                
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                if (tabName === 'editor') {
                    if (editorEl) editorEl.style.display = 'block';
                    if (guidePanel) guidePanel.style.display = 'none';
                    setTimeout(() => {
                        if (this.editor) {
                            this.editor.refresh();
                            this.editor.focus();
                        }
                    }, 50);
                } else if (tabName === 'guide') {
                    if (editorEl) editorEl.style.display = 'none';
                    if (guidePanel) guidePanel.style.display = 'block';
                }
            });
        });
        
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.runCode();
            }
        });
    }
    
    log(message) {
        const timestamp = new Date().toLocaleTimeString('ru');
        const consoleElement = document.getElementById('console');
        if (!consoleElement) return;
        
        consoleElement.innerHTML = `<span style="color:#6ee7b7">[${timestamp}]</span> ${message}<br>` + consoleElement.innerHTML;
        
        const lines = consoleElement.innerHTML.split('<br>');
        if (lines.length > 50) {
            consoleElement.innerHTML = lines.slice(0, 50).join('<br>');
        }
        consoleElement.scrollTop = 0;
    }
    
    clear() {
        if (this.editor) {
            this.editor.setValue('');
            this.currentScript = null;
            this.log("📝 Редактор очищен");
        }
    }
}

window.CodeEditor = CodeEditor;