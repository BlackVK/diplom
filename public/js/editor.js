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
            if (window.game.isWaveActive && window.game.isWaveActive()) {
                this.log("⚠️ Нельзя строить башни во время битвы!");
                return false;
            }
            return window.game.build_tower(name, x, y);
        });
        
        this.pyodide.globals.set("upgrade_tower", (name) => {
            if (!window.game) return false;
            if (window.game.isWaveActive && window.game.isWaveActive()) {
                this.log("⚠️ Нельзя улучшать башни во время битвы!");
                return false;
            }
            return window.game.upgrade_tower(name);
        });
        
        this.pyodide.globals.set("spawn_wave", () => {
            if (!window.game) return false;
            if (window.game.isWaveActive && window.game.isWaveActive()) {
                this.log("⚠️ Волна уже активна! Дождитесь её окончания.");
                return false;
            }
            return window.game.spawn_wave();
        });
        
        this.pyodide.globals.set("reset_game", () => {
            if (!window.game) return false;
            if (window.game.isWaveActive && window.game.isWaveActive()) {
                this.log("⚠️ Нельзя сбросить игру во время битвы!");
                return false;
            }
            return window.game.reset_game();
        });
        
        this.pyodide.globals.set("wait_for_wave_end", () => {
            if (!window.game) return false;
            while (window.game.isWaveActive && window.game.isWaveActive()) {
                const start = Date.now();
                while (Date.now() - start < 100) {}
            }
            return true;
        });
        
        this.pyodide.globals.set("get_towers", () => {
            if (!window.game) return [];
            return window.game.get_towers();
        });
        
        this.pyodide.globals.set("get_game_state", () => {
            if (!window.game) return { wave: 0, enemies: 0, money: 0, lives: 0 };
            return {
                wave: window.game.wave,
                enemies: window.game.enemies.length,
                money: window.game.money,
                lives: window.game.lives,
                isWaveActive: window.game.isWaveActive ? window.game.isWaveActive() : false
            };
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
        
        if (window.game && window.game.isWaveActive && window.game.isWaveActive()) {
            this.log("⚠️ Сначала дождитесь окончания текущей волны!");
            this.log("💡 Используйте wait_for_wave_end() в вашем коде для автоматического ожидания.");
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
            <h3>🚀 Управление игрой через Python</h3>
            
            <h4>📋 Основные функции:</h4>
            <ul>
                <li><code>build_tower(имя, x, y)</code> - построить башню</li>
                <li><code>upgrade_tower(имя)</code> - улучшить башню</li>
                <li><code>spawn_wave()</code> - запустить волну врагов</li>
                <li><code>reset_game()</code> - сбросить игру</li>
                <li><code>get_towers()</code> - получить список башен</li>
                <li><code>get_game_state()</code> - получить состояние игры</li>
                <li><code>wait_for_wave_end()</code> - ждать окончания волны</li>
            </ul>
            
            <h4>⏳ Функция ожидания волны:</h4>
            <pre>
def wait_for_wave_end():
    import time
    while get_game_state()['isWaveActive']:
        time.sleep(0.5)
            </pre>
            
            <h4>🎯 Простой пример:</h4>
            <pre>
import time

def wait_for_wave_end():
    while get_game_state()['isWaveActive']:
        time.sleep(0.5)

reset_game()
build_tower("моя_башня", 400, 300)
spawn_wave()
wait_for_wave_end()
print("Волна пройдена!")
            </pre>
            
            <h4>🔄 Прохождение всех волн:</h4>
            <pre>
import time

def wait_for_wave_end():
    while get_game_state()['isWaveActive']:
        time.sleep(0.5)

reset_game()

build_tower("левая", 150, 200)
build_tower("центр", 400, 300)
build_tower("правая", 650, 200)
upgrade_tower("центр")

for i in range(5):
    print(f"Запуск волны {i+1} из 5")
    spawn_wave()
    wait_for_wave_end()
    print(f"✅ Волна {i+1} пройдена!")

print("🎉 Уровень пройден!")
            </pre>
            
            <h4>⚡ Бесконечный режим:</h4>
            <pre>
import time

def wait_for_wave_end():
    while get_game_state()['isWaveActive']:
        time.sleep(0.5)

reset_game()

for i in range(3):
    build_tower(f"башня_{i}", 200 + i * 150, 250)

wave = 1
while get_game_state()['lives'] > 0:
    print(f"🌊 Волна {wave}")
    spawn_wave()
    wait_for_wave_end()
    print(f"🏆 Волна {wave} пройдена! Жизней: {get_game_state()['lives']}")
    wave += 1
    if wave > 10:
        break

print("Игра завершена!")
            </pre>
            
            <h4>🛡️ Защита с проверкой жизней:</h4>
            <pre>
import time

def wait_for_wave_end():
    while get_game_state()['isWaveActive']:
        time.sleep(0.5)

reset_game()

build_tower("вход", 150, 250)
build_tower("центр", 400, 300)
build_tower("выход", 650, 250)

for wave_num in range(1, 8):
    spawn_wave()
    wait_for_wave_end()
    
    state = get_game_state()
    if state['lives'] <= 3:
        build_tower("экстренная", 400, 200)
        upgrade_tower("экстренная")

print("🏆 Защита устояла!")
            </pre>
            
            <h4>💰 Экономичная стратегия:</h4>
            <pre>
import time

def wait_for_wave_end():
    while get_game_state()['isWaveActive']:
        time.sleep(0.5)

reset_game()

build_tower("основная", 400, 300)

for wave_num in range(1, 11):
    print(f"Волна {wave_num}")
    spawn_wave()
    wait_for_wave_end()
    
    state = get_game_state()
    if state['money'] >= 100 and wave_num > 3:
        build_tower(f"доп_{wave_num}", 300 + wave_num * 20, 250)
        print(f"💰 Построена дополнительная башня доп_{wave_num}")

print("✅ Экономичная стратегия сработала!")
            </pre>
            
            <h4>⚠️ Важные правила:</h4>
            <ul>
                <li><strong>Нельзя выполнять код</strong> во время активной волны</li>
                <li><strong>Нельзя строить башни</strong> во время битвы</li>
                <li><strong>Нельзя улучшать башни</strong> во время битвы</li>
                <li>Используйте <code>wait_for_wave_end()</code> для автоматического ожидания</li>
            </ul>
            
            <h4>📊 Функция get_game_state():</h4>
            <pre>
state = get_game_state()
print(f"Волна: {state['wave']}")
print(f"Врагов: {state['enemies']}")
print(f"Деньги: {state['money']}")
print(f"Жизни: {state['lives']}")
print(f"Идёт битва: {state['isWaveActive']}")
            </pre>
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