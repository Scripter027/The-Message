(function() {
    let ghostCounter = 0;

    function injectExtraDesktopApps() {
        if (!window.AppConfig) return;
        const extras = {
            antivirus: { id: 'antivirus', nameRu: 'Защитник', nameEn: 'Defender', icon: '🛡️', type: 'system' },
            diary: { id: 'diary', nameRu: 'Дневник', nameEn: 'Diary', icon: '📓', type: 'system' },
            homework: { id: 'homework', nameRu: 'Уроки', nameEn: 'Homework', icon: '📐', type: 'system' },
            cmd_term: { id: 'cmd_term', nameRu: 'Консоль', nameEn: 'Console', icon: '💻', type: 'system' }
        };
        let added = false;
        Object.keys(extras).forEach(k => {
            window.AppConfig.allApps[k] = extras[k];
            if (!window.AppConfig.state.installed.includes(k)) {
                window.AppConfig.state.installed.push(k);
                added = true;
            }
        });
        if (added && window.renderDesktopIcons) window.renderDesktopIcons();
    }

    function hookAppLauncher() {
        if (window.openApplicationWindow && !window.openApplicationWindow._isStoryHooked) {
            const baseOpen = window.openApplicationWindow;
            const hooked = function(appId) {
                if (handleCustomApp(appId)) return;
                return baseOpen.apply(this, arguments);
            };
            hooked._isStoryHooked = true;
            window.openApplicationWindow = hooked;
        }
    }

    function handleCustomApp(id) {
        if (id === 'messenger' && window.isStoryChapterActive && window.isStoryChapterActive()) {
            if (window.forceOpenStoryMessenger) window.forceOpenStoryMessenger();
            return true;
        }
        if (id === 'browser' && window.isStoryBrowserLocked && window.isStoryBrowserLocked()) {
            if (window.forceOpenOfflineBrowser) window.forceOpenOfflineBrowser();
            return true;
        }
        if (id === 'browser' && window.initBrowserApp) { window.initBrowserApp(); return true; }
        if (id === 'slides' && window.initSlidesApp) { window.initSlidesApp(); return true; }
        if (id === 'reports' && window.initReportsApp) { window.initReportsApp(); return true; }
        if (id === 'secret_file' && window.initSecretFileApp) { window.initSecretFileApp(); return true; }
        if (id === 'tetris' && window.isTetrisEvilMode && window.isTetrisEvilMode()) {
            alert('Я уже тут.');
            if (window.onEvilTetris) window.onEvilTetris();
            return true;
        }
        if (id === 'antivirus') { openDefender(); return true; }
        if (id === 'diary') { openDiary(); return true; }
        if (id === 'homework') { openHomework(); return true; }
        if (id === 'cmd_term') { openConsole(); return true; }
        if (id && id.startsWith('ghost_trace_')) { openTraceLog(id); return true; }
        return false;
    }

    setInterval(() => {
        hookAppLauncher();
        const env = document.getElementById('desktopEnv');
        if (!env || env.classList.contains('hidden')) return;
        injectExtraDesktopApps();

        const clock = document.getElementById('taskbarClock');
        const isPanic = clock && clock.classList.contains('timer-panic');
        if (clock && !isPanic && Math.random() < 0.12) {
            const orig = clock.textContent;
            const words = ['68:68:68', 'ОН ТУТ', 'ВЙА_01', 'СЛЕДЯТ'];
            clock.textContent = words[Math.floor(Math.random() * words.length)];
            clock.style.color = '#ff3333';
            setTimeout(() => {
                clock.style.color = '';
                if (!clock.classList.contains('timer-panic')) clock.textContent = orig;
            }, 600);
        }
        if (isPanic && ghostCounter < 3 && Math.random() < 0.25 && window.AppConfig) {
            ghostCounter++;
            const gid = 'ghost_trace_' + ghostCounter;
            window.AppConfig.allApps[gid] = { id: gid, nameRu: 'УЛИКА_' + ghostCounter + '.LOG', nameEn: 'TRACE_' + ghostCounter + '.LOG', icon: '⚠️', type: 'game' };
            window.AppConfig.state.installed.push(gid);
            if (window.renderDesktopIcons) window.renderDesktopIcons();
        }
    }, 1000);

    ['click', 'dblclick'].forEach(evtName => {
        document.addEventListener(evtName, (e) => {
            const icon = e.target.closest('.desktop-icon, .start-app-item, [data-app], [data-id]');
            if (!icon) return;
            const id = icon.dataset.app || icon.dataset.id;
            if (!id) return;
            if (id === 'messenger' && (!window.isStoryChapterActive || !window.isStoryChapterActive())) return;
            if (id === 'browser' && (!window.isStoryChapterActive || !window.isStoryChapterActive())) return;
            if (id === 'tetris' && (!window.isTetrisEvilMode || !window.isTetrisEvilMode())) return;
            if (['messenger', 'browser', 'slides', 'reports', 'secret_file', 'tetris', 'antivirus', 'diary', 'homework', 'cmd_term'].includes(id) || id.startsWith('ghost_trace_')) {
                e.stopImmediatePropagation();
                handleCustomApp(id);
            }
        }, true);
    });

    const nativeAlert = window.alert;
    window.alert = function(msg) {
        if (typeof msg === 'string' && msg.includes('Я уже тут')) {
            let win = document.getElementById('windowEvilTetris');
            if (!win) {
                win = document.createElement('div');
                win.id = 'windowEvilTetris';
                win.className = 'desktop-window';
                win.style.width = 'min(320px,92vw)';
                win.innerHTML = `<div class="window-header"><span class="window-title">Тетрис</span><button class="window-close-btn" id="clsEvTet">X</button></div><div class="window-content"><div style="width:100%;height:260px;background:#000;border:2px solid #ff3333;display:flex;align-items:center;justify-content:center;"><div style="color:#ff3333;font-size:1.4rem;letter-spacing:2px;text-shadow:0 0 12px #ff3333;">Я уже тут.</div></div></div>`;
                document.querySelector('.desktop-main')?.appendChild(win);
                document.getElementById('clsEvTet').onclick = () => win.classList.add('hidden');
                if (window.makeWindowDraggable) window.makeWindowDraggable(win);
            }
            win.classList.remove('hidden');
            if (window.bringToFront) window.bringToFront(win);
            return;
        }
        if (typeof msg === 'string' && msg.includes('Настоящий Дьявол во Плоти')) {
            showMadScene();
            return;
        }
        nativeAlert(msg);
    };

    function showMadScene() {
        const env = document.getElementById('desktopEnv');
        if (env) env.style.display = 'none';
        let ov = document.getElementById('hackerOverlay');
        if (!ov) {
            ov = document.createElement('div');
            ov.id = 'hackerOverlay';
            ov.innerHTML = `<div class="hacker-bg-effects"><div class="hacker-noise"></div></div><div class="hacker-caption">* дЬяВоЛ68 *</div><div class="hacker-text-container"><div class="hacker-msg"></div></div><div class="hacker-options-zone"></div>`;
            document.body.appendChild(ov);
        }
        ov.style.display = 'flex';
        ov.style.opacity = '1';
        ov.classList.add('visible');
        const lines = window.StoryDB ? window.StoryDB.ch5.madLines : [{ who: 'Айв', text: 'Я и есть Настоящий Дьявол во Плоти!' }];
        let st = 0;
        const msgEl = ov.querySelector('.hacker-msg');
        const optEl = ov.querySelector('.hacker-options-zone');
        const draw = () => {
            const c = lines[st];
            msgEl.innerHTML = `<div style="color:${c.who === 'Айв' ? '#00ff66' : '#ff3333'};margin-bottom:8px;">[${c.who}]</div><div>${c.text}</div>`;
            optEl.innerHTML = '';
            const b = document.createElement('button');
            b.className = 'hacker-btn';
            b.textContent = st < lines.length - 1 ? 'Далее' : 'Завершить';
            b.onclick = () => {
                if (st < lines.length - 1) { st++; draw(); }
                else { ov.style.display = 'none'; }
            };
            optEl.appendChild(b);
        };
        draw();
    }
    function openDefender() {
        let win = document.getElementById('windowDefender');
        if (!win) {
            win = document.createElement('div');
            win.id = 'windowDefender';
            win.className = 'desktop-window';
            win.style.width = 'min(480px, 94vw)';
            win.innerHTML = `<div class="window-header"><span class="window-title">Защитник Системы v4.2</span><button class="window-close-btn" id="clsDef">X</button></div><div class="window-content" id="defBody"></div>`;
            document.querySelector('.desktop-main')?.appendChild(win);
            document.getElementById('clsDef').onclick = () => win.classList.add('hidden');
            if (window.makeWindowDraggable) window.makeWindowDraggable(win);
        }
        win.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(win);

        const body = document.getElementById('defBody');
        const code = Math.floor(1000 + Math.random() * 9000);
        const s = String(code);
        const sumLast = Number(s[2]) + Number(s[3]);
        body.innerHTML = `<div style="font-size:0.86rem;line-height:1.45;">Обнаружено внешнее вмешательство в ядро системы. Подберите частоту дешифровки.</div><div style="border:1px dashed #ffaa00;padding:10px;color:#ffaa00;font-size:0.82rem;">Сигнатура порта: <b>${s.slice(0, 2)}**</b> (сумма последних двух цифр: ${sumLast}, последняя цифра: ${s[3]})</div><div class="browser-bar"><input type="text" class="browser-input" id="defIn" placeholder="4-значный порт..."><button class="browser-btn" id="btnDefGo">Перехват</button></div><div id="defOut" style="font-size:0.8rem;min-height:50px;color:#00ff66;"></div>`;
        document.getElementById('btnDefGo').onclick = () => {
            const out = document.getElementById('defOut');
            if (document.getElementById('defIn').value.trim() === s) {
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

    function openDiary() {
        let win = document.getElementById('windowDiary');
        if (!win) {
            win = document.createElement('div');
            win.id = 'windowDiary';
            win.className = 'desktop-window';
            win.style.width = 'min(500px, 94vw)';
            win.innerHTML = `<div class="window-header"><span class="window-title">Личный Дневник</span><button class="window-close-btn" id="clsDiary">X</button></div><div class="window-content" id="diaryBody"></div>`;
            document.querySelector('.desktop-main')?.appendChild(win);
            document.getElementById('clsDiary').onclick = () => win.classList.add('hidden');
            if (window.makeWindowDraggable) window.makeWindowDraggable(win);
        }
        win.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(win);

        const body = document.getElementById('diaryBody');
        if (document.body.classList.contains('theme-mom')) {
            body.innerHTML = `<div class="article-card" style="border-color:#ff66b2;color:#ff66b2;"><div class="article-title">Заметка Лоры (14 октября)</div><div>Я так боюсь, что Айв повторит нашу с Кириллом судьбу. Мы всю жизнь пашем без продыху. Золотая медаль — его единственный билет в нормальную жизнь. Наверное, я перегибаю палку, но по-другому не умею...</div></div>`;
            return;
        }
        body.innerHTML = `<div style="font-size:0.85rem;">Дневник защищен паролем.</div><div style="font-size:0.78rem;color:#ffaa00;">Подсказка: Число, которое преследует тебя в его нике.</div><div class="browser-bar"><input type="password" class="browser-input" id="diaryPass" placeholder="Пароль..."><button class="browser-btn" id="btnDiaryGo">Открыть</button></div><div id="diaryErr" style="color:#ff3333;font-size:0.78rem;"></div>`;
        document.getElementById('btnDiaryGo').onclick = () => {
            if (document.getElementById('diaryPass').value.trim() === '68') {
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
    function openHomework() {
        let win = document.getElementById('windowHomework');
        if (!win) {
            win = document.createElement('div');
            win.id = 'windowHomework';
            win.className = 'desktop-window';
            win.style.width = 'min(480px, 94vw)';
            win.innerHTML = `<div class="window-header"><span class="window-title">Школьный Портал — Тесты</span><button class="window-close-btn" id="clsHw">X</button></div><div class="window-content" id="hwBody"></div>`;
            document.querySelector('.desktop-main')?.appendChild(win);
            document.getElementById('clsHw').onclick = () => win.classList.add('hidden');
            if (window.makeWindowDraggable) window.makeWindowDraggable(win);
        }
        win.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(win);
        renderHwStep(0);
    }

    function renderHwStep(step) {
        const body = document.getElementById('hwBody');
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
        body.innerHTML = `<div style="font-size:0.78rem;opacity:0.7;">${t.subj}</div><div style="font-size:0.92rem;line-height:1.4;">${t.q}</div><div id="hwOpts" style="display:flex;flex-direction:column;gap:7px;margin-top:6px;"></div><div id="hwErr" style="font-size:0.78rem;color:#ff3333;min-height:18px;"></div>`;
        const box = document.getElementById('hwOpts');
        t.opts.forEach(opt => {
            const b = document.createElement('button');
            b.className = 'browser-btn';
            b.style.textAlign = 'left';
            b.textContent = opt;
            b.onclick = () => {
                if (opt === t.ok) renderHwStep(step + 1);
                else document.getElementById('hwErr').textContent = 'Неверно! Мама не простит еще одну ошибку...';
            };
            box.appendChild(b);
        });
    }

    function openConsole() {
        let win = document.getElementById('windowConsole');
        if (!win) {
            win = document.createElement('div');
            win.id = 'windowConsole';
            win.className = 'desktop-window';
            win.style.width = 'min(480px, 94vw)';
            win.innerHTML = `<div class="window-header"><span class="window-title">Терминал</span><button class="window-close-btn" id="clsCmd">X</button></div><div class="window-content" style="gap:8px;"><div id="cmdOut" style="height:170px;overflow-y:auto;background:#000;border:1px solid #00ff66;padding:8px;font-family:monospace;font-size:0.8rem;line-height:1.4;">Система готова. Введите help для списка команд.<br></div><div class="browser-bar"><input type="text" class="browser-input" id="cmdIn" placeholder="Команда..."><button class="browser-btn" id="btnCmdGo">Ввод</button></div></div>`;
            document.querySelector('.desktop-main')?.appendChild(win);
            document.getElementById('clsCmd').onclick = () => win.classList.add('hidden');
            if (window.makeWindowDraggable) window.makeWindowDraggable(win);
        }
        win.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(win);

        const out = document.getElementById('cmdOut');
        const inp = document.getElementById('cmdIn');
        const run = () => {
            const val = inp.value.trim().toLowerCase();
            inp.value = '';
            if (!val) return;
            out.innerHTML += `<div style="color:#ffaa00;">&gt; ${val}</div>`;
            if (val === 'help') out.innerHTML += `<div>Команды: status, scan, trace 68, clear</div>`;
            else if (val === 'status') out.innerHTML += `<div>Ядро: IVE_OS_v2.6 | Активный модуль: dEvil68.sys [СКРЫТЫЙ]</div>`;
            else if (val === 'scan') out.innerHTML += `<div>Найдено 1 скрытое подключение: localhost:6868 (Владелец: Айв)</div>`;
            else if (val === 'trace 68') out.innerHTML += `<div style="color:#ff3333;">КРИТИЧЕСКИЙ ЛОГ: Прототип «йвА» ожидает перегрузки старого носителя.</div>`;
            else if (val === 'clear') out.innerHTML = '';
            else out.innerHTML += `<div>Неизвестная команда. Введите help.</div>`;
            out.scrollTop = out.scrollHeight;
        };
        document.getElementById('btnCmdGo').onclick = run;
        inp.onkeydown = (e) => { if (e.key === 'Enter') run(); };
    }

    function openTraceLog(appId) {
        let win = document.getElementById('windowTraceLog');
        if (!win) {
            win = document.createElement('div');
            win.id = 'windowTraceLog';
            win.className = 'desktop-window';
            win.style.width = 'min(420px, 92vw)';
            win.innerHTML = `<div class="window-header"><span class="window-title">Поврежденный лог</span><button class="window-close-btn" id="clsTrace">X</button></div><div class="window-content" id="traceBody"></div>`;
            document.querySelector('.desktop-main')?.appendChild(win);
            document.getElementById('clsTrace').onclick = () => win.classList.add('hidden');
            if (window.makeWindowDraggable) window.makeWindowDraggable(win);
        }
        const notes = [
            'ЛОГ #01: Координаты школы № 1290 зафиксированы. Камеры отключены на 12 минут.',
            'ЛОГ #02: Пароль от карты матери совпадает с именем объекта. Доступ открыт.',
            'ЛОГ #03: Модель «йвА» готова к развертыванию. Старый носитель подлежит списанию.'
        ];
        const idx = parseInt(appId.replace('ghost_trace_', ''), 10) - 1;
        const body = document.getElementById('traceBody');
        body.innerHTML = `<div style="color:#ff3333;font-size:0.86rem;line-height:1.45;">${notes[idx] || notes[0]}</div><button class="action-btn" id="btnTrashTrace">Отправить улику в Корзину</button>`;
        document.getElementById('btnTrashTrace').onclick = () => {
            win.classList.add('hidden');
            if (window.moveAppToTrash) window.moveAppToTrash(appId);
        };
        win.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(win);
    }
})();
