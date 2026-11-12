(function() {
    let activeCh = 1, timerId = null, secLeft = 0, chatId = null, chats = {}, graveClicks = 0, tetrisEvil = false;

    const titles = {
        ru: ['Глава 1: "Динозаврик и Ссылка"', 'Глава 2: "Ссора не в пору"', 'Глава 3: "Поиск в Крови"', 'Глава 4: "На волоске от..."', 'Глава 5: "Дьявол во плоти"'],
        en: ['Chapter 1: "Dino and Link"', 'Chapter 2: "Unfortunate Quarrel"', 'Chapter 3: "Search in Blood"', 'Chapter 4: "On a Hair\'s Breadth..."', 'Chapter 5: "Devil Incarnate"']
    };

    window.addEventListener('load', () => {
        const grid = document.querySelector('#panelStart .chapters-grid');
        if (!grid) return;
        const lang = document.documentElement.lang || 'ru';
        grid.querySelectorAll('button').forEach((b, i) => {
            b.classList.remove('locked');
            b.classList.add('ch-btn-ready');
            b.dataset.ch = String(i + 1);
            b.style.justifyContent = 'center';
            b.querySelector('.lock-icon')?.remove();
            b.querySelector('.coming-soon')?.remove();
            const sp = b.querySelector('span');
            if (sp && titles[lang]) sp.textContent = titles[lang][i];
        });
    });

    document.addEventListener('click', (e) => {
        const b = e.target.closest('.ch-btn-ready');
        if (!b) return;
        const ch = Number(b.dataset.ch);
        if (ch < 2) return;
        e.stopImmediatePropagation();
        document.querySelectorAll('.side-panel.visible').forEach(p => { p.classList.remove('visible'); p.classList.add('hidden'); });
        document.getElementById('mainButtonsList')?.classList.remove('has-active');
        document.getElementById('menuContent')?.classList.remove('shifted');
        const mm = document.getElementById('mainMenu');
        mm.classList.remove('visible');
        setTimeout(() => {
            mm.classList.add('hidden');
            window.triggerLoading(() => launchCh(ch));
        }, 500);
    }, true);
    function setTimer(min, onEnd) {
        clearTimer();
        secLeft = min * 60;
        const cl = document.getElementById('taskbarClock');
        if (cl) cl.classList.add('timer-panic');
        timerId = setInterval(() => {
            if (cl) cl.textContent = String(Math.floor(secLeft / 60)).padStart(2, '0') + ':' + String(secLeft % 60).padStart(2, '0');
            if (secLeft <= 0) { clearTimer(); onEnd(); return; }
            secLeft = Math.max(0, secLeft - 3);
        }, 1000);
    }

    function clearTimer() {
        if (timerId) { clearInterval(timerId); timerId = null; }
        document.getElementById('taskbarClock')?.classList.remove('timer-panic');
        if (window.startClock) window.startClock();
    }

    function toast(from, text) {
        document.getElementById('activeMessNotify')?.remove();
        const d = document.createElement('div');
        d.id = 'activeMessNotify';
        d.style.cssText = 'position:fixed;bottom:54px;right:18px;max-width:320px;background:#000;border:2px solid #00ff66;color:#00ff66;padding:10px 14px;font-family:Russo One,sans-serif;z-index:12000;cursor:pointer;';
        d.innerHTML = `<b>${from}</b><div style="font-size:0.78rem;margin-top:3px;">${text}</div>`;
        d.onclick = () => { d.remove(); openStoryMess(); };
        document.body.appendChild(d);
        setTimeout(() => d.remove(), 5000);
    }

    function over(txt) {
        clearTimer();
        document.body.classList.remove('theme-mom');
        if (window.triggerGameOverScreen) window.triggerGameOverScreen(txt);
    }

    function win(ch, txt) {
        clearTimer();
        document.body.classList.remove('theme-mom');
        if (window.triggerChapterCompleteScreen) window.triggerChapterCompleteScreen(ch, txt);
    }

    function bsod(txt) {
        clearTimer();
        document.body.classList.remove('theme-mom');
        const d = document.createElement('div');
        d.className = 'bsod-screen';
        d.innerHTML = `<div class="bsod-sad">:(</div><div class="bsod-text">Синий экран. Как для компьютера, так и для жизни.<br><br>${txt}</div><button class="bsod-btn" onclick="location.reload()">В меню</button>`;
        document.body.appendChild(d);
    }
    function addM(id, who, text, out, fn) {
        if (!chats[id]) return;
        chats[id].m.push({ who, text, out: !!out, fn });
        if (chatId !== id) chats[id].u = (chats[id].u || 0) + 1;
        renderMess();
    }

    function setOpt(id, list) {
        if (chats[id]) { chats[id].o = list || []; renderMess(); }
    }

    function openStoryMess() {
        let w = document.getElementById('winStory');
        if (!w) {
            w = document.createElement('div');
            w.id = 'winStory';
            w.className = 'desktop-window';
            w.style.cssText = 'width:min(560px,95vw);height:min(420px,calc(100dvh - 52px));';
            w.innerHTML = `<div class="window-header"><span class="window-title">Mess</span><button class="window-close-btn" id="clsStory">X</button></div><div class="window-content" style="flex-direction:row;padding:0;height:calc(100% - 32px);gap:0;"><div id="stList" style="width:34%;border-right:1px solid #00ff66;overflow-y:auto;"></div><div id="stArea" style="width:66%;flex:1;display:flex;flex-direction:column;justify-content:space-between;"></div></div>`;
            document.querySelector('.desktop-main')?.appendChild(w);
            document.getElementById('clsStory').onclick = () => w.classList.add('hidden');
            if (window.makeWindowDraggable) window.makeWindowDraggable(w);
        }
        w.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(w);
        renderMess();
    }

    function renderMess() {
        const l = document.getElementById('stList'), a = document.getElementById('stArea');
        if (!l || !a) return;
        l.innerHTML = '';
        Object.keys(chats).forEach(k => {
            const c = chats[k];
            if (c.hide) return;
            const it = document.createElement('div');
            it.style.cssText = `padding:8px;border-bottom:1px solid rgba(0,255,102,0.2);cursor:pointer;color:${c.red ? '#ff3333' : 'inherit'};background:${chatId === k ? 'rgba(0,255,102,0.15)' : 'transparent'};`;
            it.innerHTML = `<b>${c.t}</b> ${c.u ? `[${c.u}]` : ''}`;
            it.onclick = () => { chatId = k; c.u = 0; renderMess(); };
            l.appendChild(it);
        });
        if (!chatId || !chats[chatId]) { a.innerHTML = '<div style="margin:auto;opacity:0.6;">Выберите чат</div>'; return; }
        const cur = chats[chatId];
        a.innerHTML = `<div id="stLogs" style="flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:8px;"></div><div id="stOpts" style="padding:7px;border-top:1px solid #00ff66;display:flex;flex-direction:column;gap:5px;max-height:48%;overflow-y:auto;"></div>`;
        const lb = document.getElementById('stLogs'), ob = document.getElementById('stOpts');
        cur.m.forEach(msg => {
            const d = document.createElement('div');
            d.style.cssText = `max-width:85%;padding:6px 9px;font-size:0.78rem;border:1px solid currentColor;align-self:${msg.out ? 'flex-end' : 'flex-start'};`;
            d.innerHTML = `<div style="font-size:0.68rem;opacity:0.75;">${msg.who}</div><div>${msg.text} ${msg.fn ? '<span class="article-link" id="stLnk">*ссылка*</span>' : ''}</div>`;
            lb.appendChild(d);
            if (msg.fn) d.querySelector('#stLnk').onclick = msg.fn;
        });
        lb.scrollTop = lb.scrollHeight;
        cur.o.forEach(opt => {
            const b = document.createElement('button');
            b.className = 'browser-btn';
            b.style.textAlign = 'left';
            b.textContent = opt.l;
            b.onclick = opt.f;
            ob.appendChild(b);
        });
    }

    const origOpen = window.openApplicationWindow;
    window.openApplicationWindow = function(id) {
        if (activeCh >= 2 && id === 'messenger') { openStoryMess(); return; }
        if (id === 'browser' && window.initBrowserApp) { window.initBrowserApp(); return; }
        if (id === 'slides' && window.initSlidesApp) { window.initSlidesApp(); return; }
        if (id === 'reports' && window.initReportsApp) { window.initReportsApp(); return; }
        if (id === 'secret_file' && window.initSecretFileApp) { window.initSecretFileApp(); return; }
        if (id === 'tetris' && tetrisEvil) {
            alert('Я уже тут.');
            if (window.onEvilTetris) window.onEvilTetris();
            return;
        }
        if (origOpen) origOpen(id);
    };

    function launchCh(ch) {
        activeCh = ch; chatId = null; chats = {}; tetrisEvil = false;
        clearTimer();
        document.body.classList.remove('theme-mom');
        const env = document.getElementById('desktopEnv');
        env.style.display = 'flex'; env.classList.remove('hidden');
        setTimeout(() => env.classList.add('visible'), 40);
        if (window.AppConfig) {
            window.AppConfig.allApps.browser = { id: 'browser', nameRu: 'Браузер', nameEn: 'Browser', icon: '🌐', type: 'system' };
            window.AppConfig.allApps.slides = { id: 'slides', nameRu: 'Проект.ppt', nameEn: 'Project.ppt', icon: '📊', type: 'system' };
            window.AppConfig.allApps.reports = { id: 'reports', nameRu: 'Отчеты', nameEn: 'Reports', icon: '📑', type: 'system' };
            window.AppConfig.allApps.secret_file = { id: 'secret_file', nameRu: 'Файл_вйА.dat', nameEn: 'File_vIA.dat', icon: '☣️', type: 'system' };
        }
        if (ch === 2) ch2();
        if (ch === 3) ch3();
        if (ch === 4) ch4();
        if (ch === 5) ch5();
        if (window.renderDesktopIcons) window.renderDesktopIcons();
    }
    function ch2() {
        window.AppConfig.state.installed = ['trash', 'explorer', 'messenger', 'browser'];
        chats = { mom: { t: '👩 Мама', m: [], o: [] }, sam: { t: '👦 Бро (Сэм)', m: [], o: [] }, d: { t: '❓ ???', red: true, hide: true, m: [], o: [] } };
        addM('mom', 'Мама', 'Айв что с тобой? У тебя двойка по математике! Мы же шли на золотую медаль!');
        setOpt('mom', [
            { l: '1. Мам, мне угрожали!', f: () => over('Мать не поверила сыну, а через несколько дней она пропала…') },
            { l: '2. Отвали от меня!', f: () => over('Мать забрала компьютер. Ваших близких так и не нашли…') },
            { l: '3. Прости…', f: () => {
                addM('mom', 'Вы', 'Прости…', true);
                addM('mom', 'Мама', 'Я закрою глаза на этот раз, но если повторится — заберу все гаджеты!');
                setOpt('mom', [
                    { l: '1. Мне угрожали!', f: () => over('С её номера тебе написали «Ты следующий»…') },
                    { l: '2. Мам, я люблю тебя.', f: () => {
                        addM('mom', 'Вы', 'Мам, я люблю тебя.', true);
                        addM('mom', 'Мама', 'И я тебя люблю! Садись за уроки!');
                        setOpt('mom', []);
                        chats.d.hide = false;
                        addM('d', '???', 'В следующий раз одним из них можешь быть ты:', false, () => {
                            if (window.initBrowserApp) window.initBrowserApp('school_1290');
                            window.onSchoolLinkClicked = () => {
                                document.getElementById('windowBrowser')?.classList.add('hidden');
                                addM('d', '???', 'тВоЕ пЕрВоЕ зАдАнИе! ПоСсОрЬсЯ с ЛуЧшИм ДрУгОм За 15 МиНуТ!');
                                setTimer(15, () => over('Время вышло!'));
                                setOpt('sam', [{ l: 'Мы больше не друзья!', f: () => {
                                    addM('sam', 'Вы', 'Мы больше не друзья!', true);
                                    addM('sam', 'Сэм', 'Почему? Что случилось?');
                                    setOpt('sam', [
                                        { l: '1. Если не поссорюсь, вас убьют!', f: () => over('Вы раскрыли тайну дЬяВоЛу.') },
                                        { l: '2. Мама не хочет, чтобы я дружил с тобой, Сэм.', f: () => {
                                            addM('sam', 'Вы', 'Мама не хочет, чтобы я дружил с тобой, Сэм.', true);
                                            addM('sam', 'Сэм', 'Не пиши мне больше, Мистер Учеба.');
                                            setOpt('sam', []); clearTimer();
                                            addM('d', '???', 'Надо же! Успел и сохранил тайну!');
                                            setTimeout(() => win(2, 'Вы спасли близких ценой друга...'), 2500);
                                        }},
                                        { l: '3. Потому что', f: () => over('Вы не пришли в школу. Просто дома голову забыли.') }
                                    ]);
                                }}]);
                            };
                        });
                        toast('???', 'Новое сообщение со ссылкой...');
                    }}
                ]);
            }}
        ]);
        toast('Мама', 'Айв что с тобой? У тебя двойка!');
    }

    function ch3() {
        window.AppConfig.state.installed = ['trash', 'explorer', 'messenger', 'browser', 'slides', 'store'];
        chats = { cass: { t: '👧 Кассандра', m: [], o: [] }, mom: { t: '👩 Мама', m: [], o: [] }, d: { t: '❓ ???', red: true, m: [], o: [] } };
        addM('cass', 'Кассандра', 'Привет, Айв! Поможешь с проектом в слайдах?');
        setOpt('cass', [{ l: 'Открыть Проект.ppt', f: () => window.initSlidesApp && window.initSlidesApp() }]);
        window.onGraveClicked = (n) => { graveClicks = n; };
        window.onFourthSlideTriggered = () => {
            setOpt('cass', [{ l: 'Что за чертовщина на 4 слайде!?', f: () => { addM('cass', 'Вы', 'Что за чертовщина на 4 слайде!?', true); addM('cass', 'Кассандра', 'В проекте только 3 слайда.'); setOpt('cass', []); } }]);
            setOpt('d', [{ l: 'У тебя есть новое задание?', f: () => {
                addM('d', 'Вы', 'У тебя есть новое задание?', true);
                addM('d', '???', 'Купи тетрис за 30 минут.');
                setTimer(30, () => over('30 минут истекли.'));
                setOpt('d', [{ l: 'Купить Тетрис (пароль: Айв)', f: () => {
                    const p = prompt('Пароль от карты (Подсказка: Имя любимого сына):');
                    if (p && p.trim().toLowerCase() === 'айв') {
                        clearTimer();
                        addM('d', '???', 'Скажи маме, что она тебя не понимает! У тебя 5 минут!');
                        setTimer(5, () => over('5 минут истекли!'));
                        setOpt('mom', [
                            { l: '1. Ты меня не понимаешь вот и все!', f: () => { addM('mom', 'Вы', 'Ты меня не понимаешь вот и все!', true); addM('mom', 'Мама', 'Завтра дома поговорим!'); setOpt('mom', []); clearTimer(); setTimeout(() => win(3, 'Тетрис куплен. Отношения с мамой разрушены.'), 2000); } },
                            { l: '2. Я люблю тебя.', f: () => over('Вы в последний раз напечатали, что любите маму.') },
                            { l: '3. Я купил тетрис.', f: () => over('Сначала ремень, потом пальцы.') }
                        ]);
                    }
                }}]);
            }}]);
        };
        toast('Кассандра', 'Привет, Айв! Поможешь с проектом?');
    }

    function ch4() {
        document.body.classList.add('theme-mom');
        window.AppConfig.state.installed = ['trash', 'explorer', 'messenger', 'reports'];
        chats = { kir: { t: '❤️ Кирилл', m: [], o: [] }, lara: { t: '👩‍🏫 Лариса Эдуардовна', hide: true, m: [], o: [] } };
        addM('kir', 'Кирилл', 'Лора, как дела на работе? Айв купил Тетрис за 50 рублей.');
        setOpt('kir', [{ l: 'Поговори с ним дома. Пойду доделаю отчеты.', f: () => { addM('kir', 'Лора', 'Поговори с ним дома.', true); setOpt('kir', []); toast('Работа', 'Откройте Отчеты и сдайте 5 отчетов!'); } }]);
        window.onMomReportsCompleted = () => {
            chats.lara.hide = false;
            addM('lara', 'Лариса Эдуардовна', 'Ваш сын сорвал урок и снял штаны! О золотой медали речи нет, он на учете.');
            setOpt('lara', [{ l: 'Я проведу с ним беседу!', f: () => {
                document.body.classList.remove('theme-mom');
                chats = { dad: { t: '👨 Папа', m: [], o: [] }, d: { t: '❓ ???', red: true, m: [], o: [] } };
                addM('dad', 'Папа', 'Завтра в школу не идешь. Будет серьезный разговор.');
                addM('d', '???', 'Прицел будет снят только после твоей смерти. Я иду за тобой)');
                setTimeout(() => win(4, 'Айв остался один на краю гибели и безумия...'), 3500);
            }}]);
            toast('Лариса Эдуардовна', 'Здравствуйте, Элеонора Степановна...');
        };
        toast('Кирилл', 'Лора, как дела на работе?');
    }

    function ch5() {
        window.AppConfig.state.installed = ['trash', 'explorer', 'messenger', 'tetris'];
        chats = { all: { t: '👥 Близкие', m: [], o: [] }, d: { t: '❓ ???', red: true, m: [], o: [] }, via: { t: '👁️ вйА', hide: true, m: [], o: [] } };
        addM('all', 'Мысли Айва', 'Надо попросить прощения у всех перед концом...');
        setOpt('all', [{ l: 'Отправить прощальные письма Маме, Папе, Бро и Учителю', f: () => {
            addM('all', 'Вы', 'Простите меня за все и... Прощай!', true);
            setOpt('all', []);
            tetrisEvil = true;
            toast('Мысли', 'Поторопите ??? в чате или запустите Тетрис...');
            setOpt('d', [{ l: 'Поторопить: Я уже не боюсь тебя!', f: () => {
                addM('d', '???', 'я ТвОй ХоЗяИн... Нога хозяина не заметит щенка под собой!');
                setTimeout(() => bsod('Все вокруг было ненастоящим. Дьявол был всегда.'), 2200);
            }}]);
        }}]);
        window.onEvilTetris = () => {
            chats.via.hide = false;
            addM('via', 'вйА', 'Отправь этот файл дьяволу сейчас! И не открывай его!');
            setOpt('via', [
                { l: 'Открыть файл вйА', f: () => bsod('Слишком много ошибок. Архивы пропавших детей и создание ИИ...') },
                { l: 'Отправить файл ??? не открывая', f: () => {
                    addM('d', '???', 'Старые документы... Нет! Не может быть! КТО ОН...');
                    setTimeout(() => {
                        if (graveClicks >= 68) {
                            alert('Айв: Я создал тебя! Я и есть Настоящий Дьявол во Плоти!');
                            win(5, 'Безумная концовка: Настоящий Дьявол во Плоти.');
                        } else {
                            win(5, 'Жизнь перезагрузилась. Родители узнали правду, Бро простил Айва.');
                        }
                    }, 2200);
                }}
            ]);
            toast('вйА', 'Отправь этот файл дьяволу сейчас!');
        };
        toast('Мысли Айва', 'Откройте Mess...');
    }
})();
