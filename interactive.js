(function() {
    let paranoiaInterval = null;
    let ghostFileCounter = 0;

    function registerInteractiveApps() {
        if (!window.AppConfig) return;
        window.AppConfig.allApps.antivirus = { id: 'antivirus', nameRu: 'Защитник', nameEn: 'Defender', icon: '🛡️', type: 'system' };
        window.AppConfig.allApps.diary = { id: 'diary', nameRu: 'Дневник', nameEn: 'Diary', icon: '📓', type: 'system' };
        window.AppConfig.allApps.homework = { id: 'homework', nameRu: 'Уроки', nameEn: 'Homework', icon: '📐', type: 'system' };

        const defaults = ['antivirus', 'diary', 'homework'];
        defaults.forEach(id => {
            if (!window.AppConfig.state.installed.includes(id)) {
                window.AppConfig.state.installed.push(id);
            }
        });
        window.AppConfig.save();
        if (window.renderDesktopIcons) window.renderDesktopIcons();
    }

    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(registerInteractiveApps, 300);
        startParanoiaEngine();
    });

    function startParanoiaEngine() {
        if (paranoiaInterval) clearInterval(paranoiaInterval);
        paranoiaInterval = setInterval(() => {
            const env = document.getElementById('desktopEnv');
            const clock = document.getElementById('taskbarClock');
            if (!env || env.classList.contains('hidden')) return;

            const isPanic = clock && clock.classList.contains('timer-panic');
            const chance = isPanic ? 0.45 : 0.14;

            if (Math.random() < chance) {
                triggerSubtleGlitch(clock, isPanic);
            }
            if (isPanic && Math.random() < 0.25) {
                spawnGhostEvidence();
            }
        }, 7500);
    }

    function triggerSubtleGlitch(clock, isPanic) {
        if (clock && !isPanic) {
            const orig = clock.textContent;
            const whispers = ['68:68:68', 'ОН ТУТ', 'БЕГИ', 'ВЙА_01'];
            clock.textContent = whispers[Math.floor(Math.random() * whispers.length)];
            clock.style.color = '#ff3333';
            setTimeout(() => {
                clock.style.color = '';
                if (!clock.classList.contains('timer-panic')) {
                    clock.textContent = orig;
                }
            }, 650);
        }
        const icons = document.querySelectorAll('.desktop-icon .icon-name');
        if (icons.length > 0 && Math.random() < 0.5) {
            const target = icons[Math.floor(Math.random() * icons.length)];
            const oldName = target.textContent;
            target.textContent = 'ОШИБКА';
            target.style.color = '#ff3333';
            setTimeout(() => {
                target.textContent = oldName;
                target.style.color = '';
            }, 550);
        }
    }

    function spawnGhostEvidence() {
        if (ghostFileCounter >= 4) return;
        ghostFileCounter++;
        const id = 'ghost_log_' + ghostFileCounter;
        if (!window.AppConfig || window.AppConfig.allApps[id]) return;

        window.AppConfig.allApps[id] = {
            id: id,
            nameRu: 'УЛИКА_' + ghostFileCounter + '.LOG',
            nameEn: 'TRACE_' + ghostFileCounter + '.LOG',
            icon: '⚠️',
            type: 'game'
        };
        window.AppConfig.state.installed.push(id);
        window.AppConfig.save();
        if (window.renderDesktopIcons) window.renderDesktopIcons();
    }
    window.openApplicationWindow = (origOpen => {
        return function(appId) {
            if (appId === 'antivirus') {
                openDefenderApp();
                return;
            }
            if (appId === 'diary') {
                openDiaryApp();
                return;
            }
            if (appId === 'homework') {
                openHomeworkApp();
                return;
            }
            if (appId && appId.startsWith('ghost_log_')) {
                openGhostLogWindow(appId);
                return;
            }
            if (origOpen) origOpen(appId);
        };
    })(window.openApplicationWindow);

    function openDefenderApp() {
        let win = document.getElementById('windowDefender');
        if (!win) {
            const mainZone = document.querySelector('.desktop-main');
            if (!mainZone) return;
            win = document.createElement('div');
            win.id = 'windowDefender';
            win.classList.add('desktop-window');
            win.style.width = 'min(480px, 94vw)';
            win.innerHTML = `
                <div class="window-header">
                    <span class="window-title">Защитник Системы v4.2</span>
                    <button class="window-close-btn" id="btnCloseDefender">X</button>
                </div>
                <div class="window-content" id="defenderBody"></div>
            `;
            mainZone.appendChild(win);
            document.getElementById('btnCloseDefender').addEventListener('click', () => win.classList.add('hidden'));
            if (window.makeWindowDraggable) window.makeWindowDraggable(win);
        }
        win.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(win);
        renderDefenderScanner();
    }

    function renderDefenderScanner() {
        const body = document.getElementById('defenderBody');
        if (!body) return;
        const targetCode = Math.floor(1000 + Math.random() * 9000);
        body.innerHTML = `
            <div style="font-size:0.86rem; line-height:1.45;">Обнаружено внешнее вмешательство в ядро системы. Чтобы перехватить пакеты злоумышленника, подберите частоту дешифровки.</div>
            <div style="border:1px dashed #ffaa00; padding:10px; color:#ffaa00; font-size:0.82rem;">Сигнатура порта: <b>${String(targetCode).slice(0, 2)}**</b> (подсказка: сумма последних двух цифр равна ${Number(String(targetCode)[2]) + Number(String(targetCode)[3])}, вторая цифра в конце: ${String(targetCode)[3]})</div>
            <div class="browser-bar">
                <input type="text" class="browser-input" id="defCodeInput" placeholder="4-значный порт...">
                <button class="browser-btn" id="btnDefScan">Перехват</button>
            </div>
            <div id="defScanOutput" style="font-size:0.8rem; min-height:60px; color:#00ff66;"></div>
        `;
        document.getElementById('btnDefScan').addEventListener('click', () => {
            const val = document.getElementById('defCodeInput').value.trim();
            const out = document.getElementById('defScanOutput');
            if (val === String(targetCode)) {
                const logs = [
                    '[ПЕРЕХВАТ УСПЕШЕН]: Источник сигнала совпадает с локальным MAC-адресом этого ПК!',
                    '[АНАЛИЗ ПАМЯТИ]: В секторе 0x68 найден скрытый модуль самообучения «йвА_alpha».',
                    '[ТРАССИРОВКА]: Исходящие пакеты отправлялись в 03:14 ночи, когда владелец компьютера спал... или не спал?'
                ];
                out.style.color = '#ffaa00';
                out.textContent = logs[Math.floor(Math.random() * logs.length)];
            } else {
                out.style.color = '#ff3333';
                out.textContent = 'ОШИБКА ДОСТУПА: Неверная частота порта. Попробуйте снова.';
            }
        });
    }

    function openDiaryApp() {
        let win = document.getElementById('windowDiary');
        if (!win) {
            const mainZone = document.querySelector('.desktop-main');
            if (!mainZone) return;
            win = document.createElement('div');
            win.id = 'windowDiary';
            win.classList.add('desktop-window');
            win.style.width = 'min(500px, 94vw)';
            win.innerHTML = `
                <div class="window-header">
                    <span class="window-title">Личный Дневник</span>
                    <button class="window-close-btn" id="btnCloseDiary">X</button>
                </div>
                <div class="window-content" id="diaryBody"></div>
            `;
            mainZone.appendChild(win);
            document.getElementById('btnCloseDiary').addEventListener('click', () => win.classList.add('hidden'));
            if (window.makeWindowDraggable) window.makeWindowDraggable(win);
        }
        win.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(win);
        renderDiaryLock();
    }

    function renderDiaryLock() {
        const body = document.getElementById('diaryBody');
        if (!body) return;
        const isMom = document.body.classList.contains('theme-mom');
        if (isMom) {
            body.innerHTML = `
                <div class="article-card" style="border-color:#ff66b2; color:#ff66b2;">
                    <div class="article-title">Заметка Лоры (14 октября)</div>
                    <div>Я так боюсь, что Айв повторит нашу с Кириллом судьбу. Мы всю жизнь пашем на двух работах без продыху. Золотая медаль — его единственный билет в нормальную жизнь. Наверное, я перегибаю палку, но по-другому не умею...</div>
                </div>
            `;
            return;
        }
        body.innerHTML = `
            <div style="font-size:0.85rem;">Дневник защищен паролем.</div>
            <div style="font-size:0.78rem; color:#ffaa00;">Подсказка: Число, которое преследует тебя в его нике.</div>
            <div class="browser-bar">
                <input type="password" class="browser-input" id="diaryPassInput" placeholder="Пароль...">
                <button class="browser-btn" id="btnDiaryUnlock">Открыть</button>
            </div>
            <div id="diaryErr" style="color:#ff3333; font-size:0.78rem;"></div>
        `;
        document.getElementById('btnDiaryUnlock').addEventListener('click', () => {
            const val = document.getElementById('diaryPassInput').value.trim();
            if (val === '68') {
                renderDiaryPages();
            } else {
                document.getElementById('diaryErr').textContent = 'Неверный код доступа.';
            }
        });
    }
    function renderDiaryPages() {
        const body = document.getElementById('diaryBody');
        if (!body) return;
        const entries = [
            {
                date: 'Запись #1 — Сентябрь',
                text: 'Снова весь вечер за олимпиадами по информатике. Мама говорит, что четверка — это путь в никуда. Иногда мне кажется, что внутри меня закипает что-то темное. Я начал писать нейросеть, которая умеет анализировать страхи людей.'
            },
            {
                date: 'Запись #2 — Октябрь',
                text: 'Сэм зовет гулять, но я не могу. Если не возьму первое место на районе, дома будет скандал. Мой алгоритм уже научился сам генерировать сообщения и взламывать локальные мессенджеры. Я назвал прототип 68-м.'
            },
            {
                date: 'Запись #3 — Повреждено',
                text: 'Он вышел из-под контроля... Или это я сам отдаю ему приказы, а потом стираю себе память? Нет, это не я! Я просто хочу, чтобы они оставили меня в покое...'
            }
        ];

        body.innerHTML = '';
        entries.forEach(e => {
            const card = document.createElement('div');
            card.className = 'article-card';
            card.innerHTML = `<div class="article-title">${e.date}</div><div>${e.text}</div>`;
            body.appendChild(card);
        });
    }

    function openHomeworkApp() {
        let win = document.getElementById('windowHomework');
        if (!win) {
            const mainZone = document.querySelector('.desktop-main');
            if (!mainZone) return;
            win = document.createElement('div');
            win.id = 'windowHomework';
            win.classList.add('desktop-window');
            win.style.width = 'min(480px, 94vw)';
            win.innerHTML = `
                <div class="window-header">
                    <span class="window-title">Школьный Портал — Тесты</span>
                    <button class="window-close-btn" id="btnCloseHomework">X</button>
                </div>
                <div class="window-content" id="homeworkBody"></div>
            `;
            mainZone.appendChild(win);
            document.getElementById('btnCloseHomework').addEventListener('click', () => win.classList.add('hidden'));
            if (window.makeWindowDraggable) window.makeWindowDraggable(win);
        }
        win.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(win);
        renderHomeworkQuiz(0);
    }

    function renderHomeworkQuiz(step) {
        const body = document.getElementById('homeworkBody');
        if (!body) return;
        const tasks = [
            {
                subj: 'Алгебра (Подготовка к медали)',
                q: 'Решите уравнение: 3x - 14 = 190. Чему равен x?',
                opts: ['64', '68', '72'],
                correct: '68'
            },
            {
                subj: 'Информатика (Олимпиадный уровень)',
                q: 'Какой процесс возникает, когда рекурсивный ИИ начинает переписывать собственный код безопасности?',
                opts: ['Сингулярное замещение', 'Кэширование', 'Дефрагментация'],
                correct: 'Сингулярное замещение'
            },
            {
                subj: 'Литература (Эссе)',
                q: 'Кто виноват в трагедии человека, которого всю жизнь заставляли быть идеальным?',
                opts: ['Только он сам', 'Те, кто лепил из него куклу', 'Никто не виноват'],
                correct: 'Те, кто лепил из него куклу'
            }
        ];

        if (step >= tasks.length) {
            body.innerHTML = `
                <div class="article-card">
                    <div class="article-title">Тест завершен: Оценка 5+</div>
                    <div>Все ответы верны. Но в графе «Автор работы» вместо имени Айв система автоматически вписала: <b style="color:#ff3333;">дЬяВоЛ68</b>.</div>
                </div>
            `;
            return;
        }

        const t = tasks[step];
        body.innerHTML = `
            <div style="font-size:0.78rem; opacity:0.7;">${t.subj}</div>
            <div style="font-size:0.92rem; line-height:1.4;">${t.q}</div>
            <div id="hwOpts" style="display:flex; flex-direction:column; gap:7px; margin-top:6px;"></div>
            <div id="hwFeedback" style="font-size:0.78rem; color:#ff3333; min-height:18px;"></div>
        `;
        const optsBox = document.getElementById('hwOpts');
        t.opts.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'browser-btn';
            btn.style.textAlign = 'left';
            btn.textContent = opt;
            btn.addEventListener('click', () => {
                if (opt === t.correct) {
                    renderHomeworkQuiz(step + 1);
                } else {
                    document.getElementById('hwFeedback').textContent = 'Неверно! Мама не простит еще одну ошибку...';
                }
            });
            optsBox.appendChild(btn);
        });
    }

    function openGhostLogWindow(appId) {
        let win = document.getElementById('windowGhostLog');
        if (!win) {
            const mainZone = document.querySelector('.desktop-main');
            if (!mainZone) return;
            win = document.createElement('div');
            win.id = 'windowGhostLog';
            win.classList.add('desktop-window');
            win.style.width = 'min(420px, 92vw)';
            win.innerHTML = `
                <div class="window-header">
                    <span class="window-title">Поврежденный лог</span>
                    <button class="window-close-btn" id="btnCloseGhostLog">X</button>
                </div>
                <div class="window-content" id="ghostLogBody"></div>
            `;
            mainZone.appendChild(win);
            document.getElementById('btnCloseGhostLog').addEventListener('click', () => win.classList.add('hidden'));
            if (window.makeWindowDraggable) window.makeWindowDraggable(win);
        }
        const notes = [
            'ЛОГ #01: Координаты школы № 1290 зафиксированы. Камеры отключены на 12 минут.',
            'ЛОГ #02: Пароль от карты матери совпадает с именем объекта. Доступ открыт.',
            'ЛОГ #03: Модель «йвА» готова к развертыванию. Старый носитель подлежит списанию.',
            'ЛОГ #04: Удали этот файл в Корзину, пока его не увидели родители!'
        ];
        const idx = parseInt(appId.replace('ghost_log_', ''), 10) - 1;
        const body = document.getElementById('ghostLogBody');
        body.innerHTML = `
            <div style="color:#ff3333; font-size:0.86rem; line-height:1.45;">${notes[idx] || notes[0]}</div>
            <button class="action-btn" id="btnTrashGhostNow">Отправить улику в Корзину</button>
        `;
        document.getElementById('btnTrashGhostNow').addEventListener('click', () => {
            win.classList.add('hidden');
            if (window.moveAppToTrash) window.moveAppToTrash(appId);
        });
        win.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(win);
    }
})();
