(function() {
    let activeCh = 1, timerId = null, secLeft = 0, chatId = null, chats = {}, graveClicks = 0, tetrisEvil = false, browserUnlockedByDevil = false;
    window.isStoryChapterActive = () => activeCh >= 2;
    window.isStoryBrowserLocked = () => activeCh === 2 && !browserUnlockedByDevil;
    window.isTetrisEvilMode = () => tetrisEvil;
    window.forceOpenStoryMessenger = () => openNativeMess();
    window.forceOpenOfflineBrowser = () => showOfflineBrowser();

    function syncTitles() {
        const grid = document.querySelector('#panelStart .chapters-grid');
        if (!grid || !window.StoryDB) return;
        const lang = document.documentElement.lang === 'en' ? 'en' : 'ru';
        grid.querySelectorAll('button').forEach((b, i) => {
            b.classList.remove('locked');
            b.classList.add('ch-btn-ready');
            b.dataset.ch = String(i + 1);
            b.style.justifyContent = 'center';
            b.querySelector('.lock-icon')?.remove();
            b.querySelector('.coming-soon')?.remove();
            const sp = b.querySelector('span');
            if (sp && window.StoryDB.titles[lang]) sp.textContent = window.StoryDB.titles[lang][i];
        });
    }

    window.addEventListener('load', () => {
        syncTitles();
        document.getElementById('btnStart')?.addEventListener('click', () => setTimeout(syncTitles, 20));
        document.getElementById('btnLang')?.addEventListener('click', () => setTimeout(syncTitles, 30));
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
        d.style.cssText = 'position:fixed;bottom:54px;right:18px;max-width:320px;background:#000;border:2px solid currentColor;padding:10px 14px;font-family:Russo One,sans-serif;z-index:12000;cursor:pointer;';
        d.style.color = document.body.classList.contains('theme-mom') ? '#ff66b2' : '#00ff66';
        d.innerHTML = `<b>${from}</b><div style="font-size:0.78rem;margin-top:3px;">${text}</div>`;
        d.onclick = () => { d.remove(); openNativeMess(); };
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
        const now = new Date();
        const tm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
        chats[id].m.push({ who, text, out: !!out, fn, tm });
        if (chatId !== id) chats[id].u = (chats[id].u || 0) + 1;
        renderNativeMess();
    }

    function setOpt(id, list) {
        if (chats[id]) { chats[id].o = list || []; renderNativeMess(); }
    }

    function openNativeMess() {
        const w = document.getElementById('windowMessenger');
        if (!w) return;
        w.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(w);
        renderNativeMess();
    }

    function renderNativeMess() {
        const l = document.getElementById('chatListPanel'), a = document.getElementById('chatMessagesArea');
        if (!l || !a) return;
        l.innerHTML = '';
        Object.keys(chats).forEach(k => {
            const c = chats[k];
            if (c.hide) return;
            const it = document.createElement('div');
            it.className = 'chat-item' + (chatId === k ? ' active' : '');
            if (c.red) it.style.color = '#ff3333';
            const last = c.m[c.m.length - 1];
            it.innerHTML = `<div class="chat-avatar">${c.av || '💬'}</div><div class="chat-info"><div class="chat-name">${c.t}</div><div class="chat-preview">${last ? last.text : ''}</div></div>${c.u ? `<div class="chat-unread">${c.u}</div>` : ''}`;
            it.onclick = () => {
                chatId = k;
                c.u = 0;
                if (c.onRead) { const cb = c.onRead; c.onRead = null; cb(); }
                renderNativeMess();
            };
            l.appendChild(it);
        });

        if (!chatId || !chats[chatId]) {
            a.innerHTML = '<div class="chat-placeholder">Выберите диалог слева</div>';
            return;
        }

        const cur = chats[chatId];
        a.innerHTML = `<div class="chat-header" style="color:${cur.red ? '#ff3333' : 'inherit'};">${cur.t}</div><div class="chat-messages-log" id="nativeLogs"></div><div class="chat-options-panel" id="nativeOpts"></div>`;
        const lb = document.getElementById('nativeLogs'), ob = document.getElementById('nativeOpts');

        cur.m.forEach(msg => {
            const d = document.createElement('div');
            d.className = 'messenger-msg-bubble ' + (msg.out ? 'msg-outgoing' : 'msg-incoming');
            if (cur.red) d.style.borderColor = '#ff3333';
            d.innerHTML = `<div class="msg-sender">${msg.who}</div><div>${msg.text} ${msg.fn ? '<span class="article-link" id="natLnk">*ссылка*</span>' : ''}</div><div class="msg-time">${msg.tm}</div>`;
            lb.appendChild(d);
            if (msg.fn) d.querySelector('#natLnk').onclick = msg.fn;
        });
        lb.scrollTop = lb.scrollHeight;

        cur.o.forEach(opt => {
            const b = document.createElement('button');
            b.className = 'messenger-opt-btn';
            if (cur.red) { b.style.borderColor = '#ff3333'; b.style.color = '#ff3333'; }
            b.textContent = opt.l;
            b.onclick = opt.f;
            ob.appendChild(b);
        });
    }

    document.addEventListener('click', (e) => {
        if (activeCh < 2) return;
        const icon = e.target.closest('.desktop-icon, .start-app-item');
        if (!icon) return;
        const appId = icon.dataset.app || icon.dataset.id;
        if (appId === 'messenger') {
            e.stopImmediatePropagation();
            openNativeMess();
        } else if (appId === 'browser') {
            e.stopImmediatePropagation();
            if (!browserUnlockedByDevil && activeCh === 2) {
                showOfflineBrowser();
            } else if (window.initBrowserApp) {
                window.initBrowserApp();
            }
        } else if (appId === 'slides' && window.initSlidesApp) {
            e.stopImmediatePropagation();
            window.initSlidesApp();
        } else if (appId === 'reports' && window.initReportsApp) {
            e.stopImmediatePropagation();
            window.initReportsApp();
        } else if (appId === 'secret_file' && window.initSecretFileApp) {
            e.stopImmediatePropagation();
            window.initSecretFileApp();
        } else if (appId === 'tetris' && tetrisEvil) {
            e.stopImmediatePropagation();
            alert('Я уже тут.');
            if (window.onEvilTetris) window.onEvilTetris();
        }
    }, true);

    function showOfflineBrowser() {
        let win = document.getElementById('windowOfflineBrowser');
        if (!win) {
            win = document.createElement('div');
            win.id = 'windowOfflineBrowser';
            win.className = 'desktop-window';
            win.style.width = 'min(460px, 92vw)';
            win.innerHTML = `<div class="window-header"><span class="window-title">Браузер — Нет сети</span><button class="window-close-btn" id="clsOffBr">X</button></div><div class="window-content" style="text-align:center;padding:24px;gap:12px;"><div style="font-size:2.4rem;">🦖</div><div style="font-size:1rem;">Нет подключения к Интернету</div><div style="font-size:0.8rem;opacity:0.75;">Проверьте сетевой кабель или дождитесь входящей ссылки...</div></div>`;
            document.querySelector('.desktop-main')?.appendChild(win);
            document.getElementById('clsOffBr').onclick = () => win.classList.add('hidden');
            if (window.makeWindowDraggable) window.makeWindowDraggable(win);
        }
        win.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(win);
    }

    function launchCh(ch) {
        activeCh = ch; chatId = null; chats = {}; tetrisEvil = false;
        browserUnlockedByDevil = (ch !== 2);
        clearTimer();
        document.body.classList.remove('theme-mom');
        document.querySelectorAll('.desktop-window').forEach(w => w.classList.add('hidden'));
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
        const S = window.StoryDB.ch2;
        window.AppConfig.state.installed = ['trash', 'explorer', 'messenger', 'browser'];
        chats = {
            mom: { t: 'Мама', av: '👩', m: [], o: [] },
            sam: { t: 'Бро', av: '👦', m: [], o: [] },
            d: { t: '???', av: '❓', red: true, hide: true, m: [], o: [] }
        };
        addM('mom', 'Мама', S.mom1);
        setOpt('mom', [
            { l: '1. Мам, мне угрожали! Мой компьютер взломали и какой-то человек мне угрожал!', f: () => over(S.momFail1) },
            { l: '2. Боже да отвали от меня! Ты меня вообще не понимаешь!', f: () => over(S.momFail2) },
            { l: '3. Прости…', f: () => {
                addM('mom', 'Айв', 'Прости…', true);
                addM('mom', 'Мама', S.mom2);
                setOpt('mom', [
                    { l: '1. Мам, я хотел тебе кое что сказать… Мне угрожали! Мой компьютер взломали!', f: () => over(S.momFail3) },
                    { l: '2. Мам, я хотел тебе кое что сказать… Я люблю тебя.', f: () => {
                        addM('mom', 'Айв', 'Мам, я хотел тебе кое что сказать… Я люблю тебя.', true);
                        addM('mom', 'Мама', S.mom3);
                        setOpt('mom', []);
                        setTimeout(() => {
                            chats.d.hide = false;
                            addM('d', '???', S.devil1, false, () => {
                                browserUnlockedByDevil = true;
                                document.getElementById('windowOfflineBrowser')?.classList.add('hidden');
                                if (window.initBrowserApp) window.initBrowserApp('school_1290');
                                window.onSchoolLinkClicked = () => {
                                    document.getElementById('windowBrowser')?.classList.add('hidden');
                                    document.getElementById('windowMessenger')?.classList.add('hidden');
                                    setTimeout(() => {
                                        addM('d', '???', S.devil2);
                                        chatId = 'sam';
                                        openNativeMess();
                                        setTimer(15, () => over('Время вышло! Вы не успели поссориться с другом...'));
                                        setOpt('sam', [{ l: 'Мы больше не друзья!', f: () => {
                                            addM('sam', 'Айв', 'Мы больше не друзья!', true);
                                            addM('sam', 'Бро', S.sam1);
                                            setOpt('sam', [
                                                { l: '1. Если я не поссорюсь с тобой, то тебя и моих родителей убьют!', f: () => over(S.samFail1) },
                                                { l: '2. Мама не хочет, чтобы я дружил с тобой, Сэм.', f: () => {
                                                    addM('sam', 'Айв', 'Мама не хочет, чтобы я дружил с тобой, Сэм.', true);
                                                    addM('sam', 'Бро', S.samOk);
                                                    setOpt('sam', []);
                                                    clearTimer();
                                                    setTimeout(() => {
                                                        addM('d', '???', S.devilEnd);
                                                        chatId = 'd';
                                                        renderNativeMess();
                                                        setTimeout(() => win(2, 'Вы спасли близких ценой лучшего друга...'), 4000);
                                                    }, 1200);
                                                }},
                                                { l: '3. Потому что', f: () => over(S.samFail3) }
                                            ]);
                                        }}]);
                                    }, 800);
                                };
                            });
                            toast('???', 'В следующий раз будь еще осторожнее...');
                        }, 1200);
                    }}
                ]);
            }}
        ]);
        toast('Мама', 'Айв что с тобой? У тебя двойка...');
    }
    function ch3() {
        const S = window.StoryDB.ch3;
        window.AppConfig.state.installed = ['trash', 'explorer', 'messenger', 'browser', 'store'];
        chats = {
            cass: { t: 'Кассандра', av: '👧', hide: true, m: [], o: [] },
            mom: { t: 'Мама', av: '👩', m: [], o: [] },
            d: { t: '???', av: '❓', red: true, m: [], o: [] }
        };
        toast('Мысли Айва', 'Откройте Браузер и поищите статьи о пропавших детях за 5 лет.');

        window.onBrowserSearched = (q) => {
            if (chats.cass.hide && (q.includes('пропав') || q.includes('5 лет') || q.includes('дет'))) {
                setTimeout(() => {
                    chats.cass.hide = false;
                    addM('cass', 'Кассандра', S.cass1);
                    setOpt('cass', [
                        { l: '1. Знаешь я сегодня очень занят и не смогу помочь', f: () => {
                            addM('cass', 'Айв', 'Знаешь я сегодня очень занят и не смогу помочь', true);
                            addM('cass', 'Кассандра', S.cassPersuade);
                            setOpt('cass', [{ l: 'Ладно, открываю проект...', f: () => openProject() }]);
                        }},
                        { l: '2. Ладно, сейчас гляну.', f: () => { addM('cass', 'Айв', 'Ладно, сейчас гляну.', true); openProject(); } }
                    ]);
                    toast('Кассандра', 'Привет, Айв. Поможешь с проектом?');
                }, 1200);
            }
        };

        function openProject() {
            if (!window.AppConfig.state.installed.includes('slides')) {
                window.AppConfig.state.installed.push('slides');
                window.AppConfig.save();
                if (window.renderDesktopIcons) window.renderDesktopIcons();
            }
            document.getElementById('windowMessenger')?.classList.add('hidden');
            if (window.initSlidesApp) window.initSlidesApp();
        }

        window.onGraveClicked = (n) => { graveClicks = n; };

        window.onFourthSlideTriggered = () => {
            setOpt('cass', [{ l: 'Что за чертовщина на 4 слайде!?', f: () => {
                addM('cass', 'Айв', 'Что за чертовщина на 4 слайде!?', true);
                addM('cass', 'Кассандра', S.cassSlide4);
                setOpt('cass', []);
            }}]);
            setOpt('d', [{ l: 'У тебя есть новое ужасное задание?', f: () => {
                addM('d', 'Айв', 'У тебя есть новое ужасное задание?', true);
                addM('d', '???', S.devil1);
                addM('d', 'Айв', 'Купить? Он же платный!', true);
                addM('d', '???', S.devil2);
                setTimer(30, () => over('30 минут истекли. Вы не купили Тетрис...'));
                setOpt('mom', [{ l: 'Эй мам. Помнишь я хотел одну игру? Можешь пожалуйста купить мне тетрис?', f: () => {
                    addM('mom', 'Айв', 'Эй мам. Помнишь я хотел одну игру? Можешь пожалуйста купить мне тетрис?', true);
                    addM('mom', 'Мама', S.momNoGame);
                    setOpt('mom', []);
                }}]);
                setOpt('d', [{ l: 'Зайти в Магазин и купить Тетрис (пароль: Айв)', f: () => {
                    const p = prompt('Пароль от привязанной карты (Подсказка: Имя любимого сына):');
                    if (p && p.trim().toLowerCase() === 'айв') {
                        clearTimer();
                        setOpt('d', []);
                        if (!window.AppConfig.state.installed.includes('tetris')) {
                            window.AppConfig.state.installed.push('tetris');
                            window.AppConfig.save();
                            if (window.renderDesktopIcons) window.renderDesktopIcons();
                        }
                        addM('d', '???', S.devil3);
                        addM('d', 'Айв', 'Ты же обещал что её это касаться не будет!', true);
                        addM('d', '???', S.devil4);
                        chatId = 'mom';
                        renderNativeMess();
                        setTimer(5, () => over('5 минут истекли! Вы не успели написать маме.'));
                        setOpt('mom', [
                            { l: '1. Ну как обычно. Ты меня не понимаешь вот и все!', f: () => {
                                addM('mom', 'Айв', 'Ну как обычно. Ты меня не понимаешь вот и все!', true);
                                addM('mom', 'Мама', S.momOk);
                                setOpt('mom', []);
                                clearTimer();
                                setTimeout(() => {
                                    addM('d', '???', S.devilEnd1);
                                    addM('d', 'Айв', 'Твоя цель рассорить меня со всеми?', true);
                                    addM('d', '???', S.devilEnd2);
                                    chatId = 'd';
                                    renderNativeMess();
                                    setTimeout(() => win(3, 'Тетрис куплен. Отношения с мамой разрушены.'), 4200);
                                }, 1200);
                            }},
                            { l: '2. Я люблю тебя.', f: () => over(S.momFailLove) },
                            { l: '3. Я купил тетрис.', f: () => over(S.momFailTetris) }
                        ]);
                    }
                }}]);
            }}]);
        };
    }
    function ch4() {
        const S = window.StoryDB.ch4;
        document.body.classList.add('theme-mom');
        window.AppConfig.state.installed = ['trash', 'explorer', 'messenger'];
        if (window.renderDesktopIcons) window.renderDesktopIcons();

        chats = {
            kir: { t: 'Кирилл', av: '❤️', m: [], o: [] },
            le: { t: 'Лариса Эдуардовна', av: '👩‍🏫', hide: true, m: [], o: [] }
        };

        addM('kir', 'Кирилл', S.kir1);
        setOpt('kir', [{ l: 'Ответить: Ох, Кир, да на работе все хорошо, 10 отчетов из 15 закончены...', f: () => {
            addM('kir', 'Лора', S.lora1, true);
            addM('kir', 'Кирилл', S.kir2);
            setOpt('kir', [{ l: 'Ответить: В этом и проблема! Пишет, да еще как!...', f: () => {
                addM('kir', 'Лора', S.lora2, true);
                addM('kir', 'Кирилл', S.kir3);
                setOpt('kir', [{ l: 'Ответить: Ну вот видишь! Он еще и не слушается нас!...', f: () => {
                    addM('kir', 'Лора', S.lora3, true);
                    addM('kir', 'Кирилл', S.kir4);
                    setOpt('kir', [{ l: 'Ответить: Да не знаю я! Хорошо, поговори с ним, как дома будешь...', f: () => {
                        addM('kir', 'Лора', S.lora4, true);
                        setOpt('kir', []);
                        window.AppConfig.state.installed.push('reports');
                        if (window.renderDesktopIcons) window.renderDesktopIcons();
                        toast('Работа', 'Откройте приложение «Отчеты» и доделайте 5 оставшихся отчетов!');
                    }}]);
                }}]);
            }}]);
        }}]);

        window.onMomReportsCompleted = () => {
            document.getElementById('windowReports')?.classList.add('hidden');
            chats.le.hide = false;
            addM('le', 'Лариса Эдуардовна', S.le1);
            toast('Лариса Эдуардовна', 'Здравствуйте, Элеонора Степановна...');
            setOpt('le', [{ l: 'здравствуйте, что произошло?', f: () => {
                addM('le', 'Лора', S.lora5, true);
                addM('le', 'Лариса Эдуардовна', S.le2);
                setOpt('le', [{ l: 'Я даже не знаю что сказать! Он никогда себя так не вел.', f: () => {
                    addM('le', 'Лора', S.lora6, true);
                    addM('le', 'Лариса Эдуардовна', S.le3);
                    setOpt('le', [{ l: 'Мне очень стыдно за него, Лариса Эдуардовна!', f: () => {
                        addM('le', 'Лора', S.lora7, true);
                        addM('le', 'Лариса Эдуардовна', S.le4);
                        setOpt('le', [{ l: 'Не может быть! Он не получит золотую медаль?!', f: () => {
                            addM('le', 'Лора', S.lora8, true);
                            addM('le', 'Лариса Эдуардовна', S.le5);
                            setOpt('le', []);
                            setTimeout(() => switchToIve(), 3200);
                        }}]);
                    }}]);
                }}]);
            }}]);
        };

        function switchToIve() {
            document.getElementById('windowMessenger')?.classList.add('hidden');
            window.triggerLoading(() => {
                document.body.classList.remove('theme-mom');
                window.AppConfig.state.installed = ['trash', 'explorer', 'messenger', 'tetris'];
                if (window.renderDesktopIcons) window.renderDesktopIcons();
                chatId = null;
                let readCount = 0;

                const checkAllRead = () => {
                    readCount++;
                    if (readCount >= 4) {
                        setTimeout(() => win(4, 'Айв остался один. На краю от отчисления, позора и гибели...'), 3500);
                    }
                };

                chats = {
                    dad: { t: 'Папа', av: '👨', m: [], o: [], onRead: checkAllRead },
                    d: { t: '???', av: '❓', red: true, hide: true, m: [], o: [], onRead: checkAllRead },
                    mom: { t: 'Мама', av: '👩', hide: true, m: [], o: [], onRead: checkAllRead },
                    sam: { t: 'Бро', av: '👦', hide: true, m: [], o: [], onRead: checkAllRead }
                };

                addM('dad', 'Папа', S.dadEnd);
                toast('Папа', 'Сын, мы сегодня с мамой задерживаемся...');

                setTimeout(() => {
                    chats.d.hide = false;
                    addM('d', '???', S.devilEnd);
                    toast('???', 'Прицел будет снят только после твоей смерти...');
                }, 3500);

                setTimeout(() => {
                    chats.mom.hide = false;
                    addM('mom', 'Мама', S.momEnd);
                    toast('Мама', 'Я очень разочарована в тебе...');
                }, 7000);

                setTimeout(() => {
                    chats.sam.hide = false;
                    addM('sam', 'Бро', S.broEnd);
                    toast('Бро', 'Я так разочарован в тебе. (Прочитайте все 4 диалога)');
                }, 10500);
            });
        }

        toast('Кирилл', 'Лора, как дела на работе?');
    }

    function ch5() {
        const S = window.StoryDB.ch5;
        window.AppConfig.state.installed = ['trash', 'explorer', 'messenger', 'tetris'];
        if (window.renderDesktopIcons) window.renderDesktopIcons();

        chats = {
            le: { t: 'Лариса Эдуардовна', av: '👩‍🏫', m: [], o: [] },
            dad: { t: 'Папа', av: '👨', m: [], o: [] },
            mom: { t: 'Мама', av: '👩', m: [], o: [] },
            sam: { t: 'Бро', av: '👦', m: [], o: [] },
            d: { t: '???', av: '❓', red: true, m: [], o: [] },
            via: { t: 'вйА', av: '👁️', hide: true, m: [], o: [] }
        };

        let sent = 0;
        const onSent = () => {
            sent++;
            if (sent < 4) return;
            tetrisEvil = true;
            toast('Мысли Айва', 'Все дела завершены. Поторопите ??? в чате или откройте Тетрис...');
            setOpt('d', [{ l: 'Поторопить: Ну и долго ты собираешься идти? Я уже не боюсь тебя!', f: () => {
                addM('d', 'Айв', S.provokeIve, true);
                setOpt('d', []);
                setTimeout(() => addM('d', '???', S.provoke1), 900);
                setTimeout(() => addM('dad', 'Папа', S.provoke2), 1800);
                setTimeout(() => addM('le', 'ЛЭ', S.provoke3), 2700);
                setTimeout(() => addM('mom', 'Мама', S.provoke4), 3600);
                setTimeout(() => addM('sam', 'Бро', S.provoke5), 4500);
                setTimeout(() => addM('d', '???', S.provoke6), 5400);
                setTimeout(() => bsod(S.bsodFake), 7500);
            }}]);
        };

        setOpt('le', [{ l: 'Написать извинения Ларисе Эдуардовне', f: () => { addM('le', 'Айв', S.toTeacher, true); setOpt('le', []); onSent(); } }]);
        setOpt('dad', [{ l: 'Написать прощание Папе', f: () => { addM('dad', 'Айв', S.toDad, true); setOpt('dad', []); onSent(); } }]);
        setOpt('mom', [{ l: 'Написать прощание Маме', f: () => { addM('mom', 'Айв', S.toMom, true); setOpt('mom', []); onSent(); } }]);
        setOpt('sam', [{ l: 'Написать прощание Бро', f: () => { addM('sam', 'Айв', S.toBro, true); setOpt('sam', []); onSent(); } }]);

        window.onEvilTetris = () => {
            if (!chats.via.hide) return;
            setOpt('d', []);
            chats.via.hide = false;
            addM('via', 'вйА', S.viaMsg);
            toast('вйА', S.viaMsg);
            setOpt('via', [
                { l: 'Открыть файл и посмотреть содержимое', f: () => bsod(S.bsodFile) },
                { l: 'Не открывать и сразу отправить файл ???', f: () => {
                    setOpt('via', []);
                    chatId = 'd';
                    addM('d', 'Айв', S.sendFileIve, true);
                    setTimeout(() => addM('d', '???', S.devilFile1), 1500);
                    setTimeout(() => addM('d', '???', S.devilFile2), 3400);
                    setTimeout(() => addM('d', '???', S.devilFile3), 5200);
                    setTimeout(() => {
                        if (graveClicks >= 68) {
                            alert('Настоящий Дьявол во Плоти');
                            win(5, 'Безумная концовка: Настоящий Дьявол во Плоти.');
                        } else {
                            win(5, S.goodEnding);
                        }
                    }, 7200);
                }}
            ]);
        };

        toast('Мысли Айва', 'Откройте Mess и напишите всем, кого обидели...');
    }
})();
