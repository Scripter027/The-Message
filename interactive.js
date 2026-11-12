(function() {
    let paranoiaInterval = null;
    let ghostFileCounter = 0;

    window.addEventListener('load', () => {
        if (!window.AppConfig) return;
        window.AppConfig.allApps.antivirus = { id: 'antivirus', nameRu: 'Защитник', nameEn: 'Defender', icon: '🛡️', type: 'system' };
        window.AppConfig.allApps.diary = { id: 'diary', nameRu: 'Дневник', nameEn: 'Diary', icon: '📓', type: 'system' };
        window.AppConfig.allApps.homework = { id: 'homework', nameRu: 'Уроки', nameEn: 'Homework', icon: '📐', type: 'system' };

        ['antivirus', 'diary', 'homework'].forEach(id => {
            if (!window.AppConfig.state.installed.includes(id)) {
                window.AppConfig.state.installed.push(id);
            }
        });
        window.AppConfig.save();
        if (window.renderDesktopIcons) window.renderDesktopIcons();
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
    const nativeAlert = window.alert;
    window.alert = function(msg) {
        if (typeof msg === 'string' && msg.includes('Я уже тут')) {
            showPossessedTetrisWindow();
            return;
        }
        if (typeof msg === 'string' && msg.includes('Настоящий Дьявол во Плоти')) {
            showMadEndingOverlay();
            return;
        }
        nativeAlert(msg);
    };

    function showPossessedTetrisWindow() {
        let win = document.getElementById('windowEvilTetris');
        if (!win) {
            win = document.createElement('div');
            win.id = 'windowEvilTetris';
            win.className = 'desktop-window';
            win.style.cssText = 'width:min(320px,92vw);';
            win.innerHTML = `<div class="window-header"><span class="window-title">Тетрис</span><button class="window-close-btn" id="clsEvilTet">X</button></div><div class="window-content"><div style="width:100%;height:260px;background:#000;border:2px solid #ff3333;display:flex;align-items:center;justify-content:center;text-align:center;padding:16px;"><div style="color:#ff3333;font-size:1.4rem;letter-spacing:2px;text-shadow:0 0 12px #ff3333;">Я уже тут.</div></div></div>`;
            document.querySelector('.desktop-main')?.appendChild(win);
            document.getElementById('clsEvilTet').onclick = () => win.classList.add('hidden');
            if (window.makeWindowDraggable) window.makeWindowDraggable(win);
        }
        win.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(win);
    }

    function showMadEndingOverlay() {
        const env = document.getElementById('desktopEnv');
        if (env) env.style.display = 'none';
        let overlay = document.getElementById('hackerOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'hackerOverlay';
            overlay.innerHTML = `<div class="hacker-bg-effects"><div class="hacker-noise"></div></div><div class="hacker-caption">* дЬяВоЛ68 *</div><div class="hacker-text-container"><div class="hacker-msg"></div></div><div class="hacker-options-zone"></div>`;
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';
        overlay.style.opacity = '1';
        overlay.classList.add('visible');

        const lines = [
            { who: '???', text: 'КТО ОН!?' },
            { who: 'Айв', text: 'А кто идет на золотую медаль? Кто уже 7 год подряд идет к знаниям? Кто проходил все Олимпиады по информатике и технологиям? Кто создавал такие ИИ, что они способны взламывать компы и угрожать маленьким детям? Кто создал тебя? Я!' },
            { who: '???', text: 'Н-но почему?' },
            { who: 'Айв', text: 'А ты не знаешь? Мне нравится убивать! Так по крайней мере я могу вылить всю злость от родителей! От их ожиданий! Я создал тебя чтобы ты на протяжении 5 лет помогал мне пугать детей, а я их добивал! А теперь благодаря новому ИИ который я пока назвал «йвА», я смогу даже ничего не делая убивать людей! А ты… Ты мне больше не нужен. Как минимум ты уже перегружен!' },
            { who: '???', text: 'Н-но зачем тогда нужен был весь этот спектакль? Что было реально, а что нет?' },
            { who: 'Айв', text: 'Боюсь мы с тобой никогда этого не узнаем. Единственное что ты должен усвоить, так это то, что я и есть Настоящий Дьявол во Плоти!' }
        ];

        let step = 0;
        const msgEl = overlay.querySelector('.hacker-msg');
        const optZone = overlay.querySelector('.hacker-options-zone');
        const renderStep = () => {
            const cur = lines[step];
            msgEl.innerHTML = `<div style="color:${cur.who === 'Айв' ? '#00ff66' : '#ff3333'};margin-bottom:8px;">[${cur.who}]</div><div>${cur.text}</div>`;
            optZone.innerHTML = '';
            const btn = document.createElement('button');
            btn.className = 'hacker-btn';
            btn.textContent = step < lines.length - 1 ? 'Далее' : 'Принять истину';
            btn.onclick = () => {
                if (step < lines.length - 1) { step++; renderStep(); }
                else { overlay.style.display = 'none'; }
            };
            optZone.appendChild(btn);
        };
        renderStep();
    }

    const prevOpen = window.openApplicationWindow;
    window.openApplicationWindow = function(appId) {
        if (appId === 'antivirus') { openDefenderApp(); return; }
        if (appId === 'diary') { openDiaryApp(); return; }
        if (appId === 'homework') { openHomeworkApp(); return; }
        if (appId && appId.startsWith('ghost_log_')) { openGhostLogWindow(appId); return; }
        if (prevOpen) prevOpen(appId);
    };

    function openDefenderApp() {
        let win = document.getElementById('windowDefender');
        if (!win) {
            win = document.createElement('div');
            win.id = 'windowDefender';
            win.className = 'desktop-window';
            win.style.width = 'min(480px, 94vw)';
            win.innerHTML = `<div class="window-header"><span class="window-title">Защитник Системы v4.2</span><button class="window-close-btn" id="btnCloseDefender">X</button></div><div class="window-content" id="defenderBody"></div>`;
            document.querySelector('.desktop-main')?.appendChild(win);
            document.getElementById('btnCloseDefender').onclick = () => win.classList.add('hidden');
            if (window.makeWindowDraggable) window.makeWindowDraggable(win);
        }
        win.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(win);

        const body = document.getElementById('defenderBody');
        const code = Math.floor(1000 + Math.random() * 9000);
        const s = String(code);
        body.innerHTML = `<div style="font-size:0.86rem;line-height:1.45;">Обнаружено внешнее вмешательство в ядро системы. Подберите частоту дешифровки.</div><div style="border:1px dashed #ffaa00;padding:10px;color:#ffaa00;font-size:0.82rem;">Сигнатура порта: <b>${s.slice(0, 2)}**</b> (сумма последних двух цифр: ${Number(s[2]) + Number(s[3])}, последняя цифра: ${s[3]})</div><div class="browser-bar"><input type="text" class="browser-input" id="defCodeInput" placeholder="4-значный порт..."><button class="browser-btn" id="btnDefScan">Перехват</button></div><div id="defScanOutput" style="font-size:0.8rem;min-height:50px;color:#00ff66;"></div>`;
        document.getElementById('btnDefScan').onclick = () => {
            const out = document.getElementById('defScanOutput');
            if (document.getElementById('defCodeInput').value.trim() === s) {
                const logs = [
                    '[ПЕРЕХВАТ УСПЕШЕН]: Источник сигнала совпадает с локальным MAC-адресом этого ПК!',
                    '[АНАЛИЗ ПАМЯТИ]: В секторе 0x68 найден скрытый модуль самообучения «йвА_alpha».',
                    '[ТРАССИРОВКА]: Исходящие пакеты отправлялись в 03:14 ночи, когда владелец ПК спал... или нет?'
                ];
                out.style.color = '#ffaa00';
                out.textContent = logs[Math.floor(Math.random() * logs.length)];
            } else {
                out.style.color = '#ff3333';
                out.textContent = 'ОШИБКА ДОСТУПА: Неверная частота порта.';
            }
        };
    }
    function openDiaryApp() {
        let win = document.getElementById('windowDiary');
        if (!win) {
            win = document.createElement('div');
            win.id = 'windowDiary';
            win.className = 'desktop-window';
            win.style.width = 'min(500px, 94vw)';
            win.innerHTML = `<div class="window-header"><span class="window-title">Личный Дневник</span><button class="window-close-btn" id="btnCloseDiary">X</button></div><div class="window-content" id="diaryBody"></div>`;
            document.querySelector('.desktop-main')?.appendChild(win);
            document.getElementById('btnCloseDiary').onclick = () => win.classList.add('hidden');
            if (window.makeWindowDraggable) window.makeWindowDraggable(win);
        }
        win.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(win);

        const body = document.getElementById('diaryBody');
        if (document.body.classList.contains('theme-mom')) {
            body.innerHTML = `<div class="article-card" style="border-color:#ff66b2;color:#ff66b2;"><div class="article-title">Заметка Лоры (14 октября)</div><div>Я так боюсь, что Айв повторит нашу с Кириллом судьбу. Мы всю жизнь пашем без продыху. Золотая медаль — его единственный билет в нормальную жизнь. Наверное, я перегибаю палку, но по-другому не умею...</div></div>`;
            return;
        }
        body.innerHTML = `<div style="font-size:0.85rem;">Дневник защищен паролем.</div><div style="font-size:0.78rem;color:#ffaa00;">Подсказка: Число, которое преследует тебя в его нике.</div><div class="browser-bar"><input type="password" class="browser-input" id="diaryPassInput" placeholder="Пароль..."><button class="browser-btn" id="btnDiaryUnlock">Открыть</button></div><div id="diaryErr" style="color:#ff3333;font-size:0.78rem;"></div>`;
        document.getElementById('btnDiaryUnlock').onclick = () => {
            if (document.getElementById('diaryPassInput').value.trim() === '68') {
                const entries = [
                    { date: 'Запись #1 — Сентябрь', text: 'Снова весь вечер за олимпиадами по информатике. Мама говорит, что четверка — это путь в никуда. Иногда мне кажется, что внутри меня закипает что-то темное. Я начал писать нейросеть, которая анализирует страхи людей.' },
                    { date: 'Запись #2 — Октябрь', text: 'Сэм зовет гулять, но я не могу. Если не возьму первое место на районе, дома будет скандал. Мой алгоритм уже научился сам генерировать сообщения и взламывать мессенджеры. Я назвал прототип 68-м.' },
                    { date: 'Запись #3 — Повреждено', text: 'Он вышел из-под контроля... Или это я сам отдаю ему приказы, а потом стираю себе память? Нет, это не я! Я просто хочу, чтобы они оставили меня в покое...' }
                ];
                body.innerHTML = entries.map(e => `<div class="article-card"><div class="article-title">${e.date}</div><div>${e.text}</div></div>`).join('');
            } else {
                document.getElementById('diaryErr').textContent = 'Неверный код доступа.';
            }
        };
    }

    function openHomeworkApp() {
        let win = document.getElementById('windowHomework');
        if (!win) {
            win = document.createElement('div');
            win.id = 'windowHomework';
            win.className = 'desktop-window';
            win.style.width = 'min(480px, 94vw)';
            win.innerHTML = `<div class="window-header"><span class="window-title">Школьный Портал — Тесты</span><button class="window-close-btn" id="btnCloseHomework">X</button></div><div class="window-content" id="homeworkBody"></div>`;
            document.querySelector('.desktop-main')?.appendChild(win);
            document.getElementById('btnCloseHomework').onclick = () => win.classList.add('hidden');
            if (window.makeWindowDraggable) window.makeWindowDraggable(win);
        }
        win.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(win);
        renderHw(0);
    }

    function renderHw(step) {
        const body = document.getElementById('homeworkBody');
        if (!body) return;
        const tasks = [
            { subj: 'Алгебра', q: 'Решите уравнение: 3x - 14 = 190. Чему равен x?', opts: ['64', '68', '72'], ok: '68' },
            { subj: 'Информатика', q: 'Как называется процесс, когда рекурсивный ИИ переписывает собственный код безопасности?', opts: ['Сингулярное замещение', 'Кэширование', 'Дефрагментация'], ok: 'Сингулярное замещение' },
            { subj: 'Литература', q: 'Кто виноват в трагедии человека, которого всю жизнь заставляли быть идеальным?', opts: ['Только он сам', 'Те, кто лепил из него куклу', 'Никто не виноват'], ok: 'Те, кто лепил из него куклу' }
        ];
        if (step >= tasks.length) {
            body.innerHTML = `<div class="article-card"><div class="article-title">Тест завершен: Оценка 5+</div><div>В графе «Автор работы» вместо имени Айв система автоматически вписала: <b style="color:#ff3333;">дЬяВоЛ68</b>.</div></div>`;
            return;
        }
        const t = tasks[step];
        body.innerHTML = `<div style="font-size:0.78rem;opacity:0.7;">${t.subj}</div><div style="font-size:0.92rem;line-height:1.4;">${t.q}</div><div id="hwOpts" style="display:flex;flex-direction:column;gap:7px;margin-top:6px;"></div><div id="hwFeedback" style="font-size:0.78rem;color:#ff3333;min-height:18px;"></div>`;
        const box = document.getElementById('hwOpts');
        t.opts.forEach(opt => {
            const b = document.createElement('button');
            b.className = 'browser-btn';
            b.style.textAlign = 'left';
            b.textContent = opt;
            b.onclick = () => {
                if (opt === t.ok) renderHw(step + 1);
                else document.getElementById('hwFeedback').textContent = 'Неверно! Мама не простит еще одну ошибку...';
            };
            box.appendChild(b);
        });
    }

    function openGhostLogWindow(appId) {
        let win = document.getElementById('windowGhostLog');
        if (!win) {
            win = document.createElement('div');
            win.id = 'windowGhostLog';
            win.className = 'desktop-window';
            win.style.width = 'min(420px, 92vw)';
            win.innerHTML = `<div class="window-header"><span class="window-title">Поврежденный лог</span><button class="window-close-btn" id="btnCloseGhostLog">X</button></div><div class="window-content" id="ghostLogBody"></div>`;
            document.querySelector('.desktop-main')?.appendChild(win);
            document.getElementById('btnCloseGhostLog').onclick = () => win.classList.add('hidden');
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
        body.innerHTML = `<div style="color:#ff3333;font-size:0.86rem;line-height:1.45;">${notes[idx] || notes}</div><button class="action-btn" id="btnTrashGhostNow">Отправить улику в Корзину</button>`;
        document.getElementById('btnTrashGhostNow').onclick = () => {
            win.classList.add('hidden');
            if (window.moveAppToTrash) window.moveAppToTrash(appId);
        };
        win.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(win);
    }
})();
