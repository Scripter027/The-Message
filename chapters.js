(function() {
    let activeChapter = 1;
    let countdownInterval = null;
    let remainingSeconds = 0;
    let onTimerExpire = null;
    let selectedChat = null;
    let chats = {};
    let flags = {};
    let persistentGraveClicks = 0;

    const chapterTitles = {
        ru: [
            'Глава 1: "Динозаврик и Ссылка"',
            'Глава 2: "Ссора не в пору"',
            'Глава 3: "Поиск в Крови"',
            'Глава 4: "На волоске от..."',
            'Глава 5: "Дьявол во плоти"'
        ],
        en: [
            'Chapter 1: "Dino and Link"',
            'Chapter 2: "Unfortunate Quarrel"',
            'Chapter 3: "Search in Blood"',
            'Chapter 4: "On a Hair\'s Breadth..."',
            'Chapter 5: "Devil Incarnate"'
        ]
    };

    function getTimeStr() {
        const now = new Date();
        return String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    }

    function unlockAllChapterButtons() {
        const grid = document.querySelector('#panelStart .chapters-grid');
        if (!grid) return;
        const lang = document.documentElement.lang || 'ru';
        const buttons = grid.querySelectorAll('button');
        buttons.forEach((btn, idx) => {
            btn.classList.remove('locked');
            btn.classList.add('chapter-story-btn');
            btn.dataset.chapter = String(idx + 1);
            btn.style.justifyContent = 'center';
            btn.style.textAlign = 'center';
            const lock = btn.querySelector('.lock-icon');
            const soon = btn.querySelector('.coming-soon');
            if (lock) lock.remove();
            if (soon) soon.remove();
            const span = btn.querySelector('span');
            if (span && chapterTitles[lang] && chapterTitles[lang][idx]) {
                span.textContent = chapterTitles[lang][idx];
            }
        });
    }

    const menuObserver = new MutationObserver(() => {
        unlockAllChapterButtons();
    });

    document.addEventListener('DOMContentLoaded', () => {
        const panelStart = document.getElementById('panelStart');
        if (panelStart) {
            menuObserver.observe(panelStart, { attributes: true, subtree: true, childList: true });
        }
        unlockAllChapterButtons();
        registerExtraApps();
    });
    function registerExtraApps() {
        if (!window.AppConfig) return;
        window.AppConfig.allApps.browser = { id: 'browser', nameRu: 'Браузер', nameEn: 'Browser', icon: '🌐', type: 'system' };
        window.AppConfig.allApps.slides = { id: 'slides', nameRu: 'Проект.ppt', nameEn: 'Project.ppt', icon: '📊', type: 'system' };
        window.AppConfig.allApps.reports = { id: 'reports', nameRu: 'Отчеты', nameEn: 'Reports', icon: '📑', type: 'system' };
        window.AppConfig.allApps.secret_file = { id: 'secret_file', nameRu: 'Файл_вйА.dat', nameEn: 'File_vIA.dat', icon: '☣️', type: 'system' };
    }

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.chapter-story-btn');
        if (!btn) return;
        const ch = parseInt(btn.dataset.chapter, 10);
        if (ch >= 2 && ch <= 5) {
            e.stopImmediatePropagation();
            const mainMenu = document.getElementById('mainMenu');
            document.querySelectorAll('.side-panel.visible').forEach(p => {
                p.classList.remove('visible');
                p.classList.add('hidden');
            });
            document.getElementById('mainButtonsList')?.classList.remove('has-active');
            document.getElementById('menuContent')?.classList.remove('shifted');
            mainMenu.classList.remove('visible');
            setTimeout(() => {
                mainMenu.classList.add('hidden');
                const go = () => {
                    window.triggerLoading(() => {
                        startStoryChapter(ch);
                    });
                };
                if (window.YandexModule) {
                    window.YandexModule.showAd(go);
                } else {
                    go();
                }
            }, 600);
        }
    }, true);

    function startPanicTimer(minutes, expireCallback) {
        stopPanicTimer();
        remainingSeconds = minutes * 60;
        onTimerExpire = expireCallback;
        const clock = document.getElementById('taskbarClock');
        if (clock) clock.classList.add('timer-panic');

        const tick = () => {
            const m = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
            const s = String(remainingSeconds % 60).padStart(2, '0');
            if (clock) clock.textContent = `${m}:${s}`;
            if (remainingSeconds <= 0) {
                stopPanicTimer();
                if (onTimerExpire) onTimerExpire();
                return;
            }
            remainingSeconds -= 3;
            if (remainingSeconds < 0) remainingSeconds = 0;
        };
        tick();
        countdownInterval = setInterval(tick, 1000);
    }

    function stopPanicTimer() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        const clock = document.getElementById('taskbarClock');
        if (clock) clock.classList.remove('timer-panic');
        if (window.startClock) window.startClock();
    }

    function notifyPopup(from, text) {
        const old = document.getElementById('activeMessNotify');
        if (old) old.remove();
        const box = document.createElement('div');
        box.id = 'activeMessNotify';
        box.style.position = 'fixed';
        box.style.bottom = '54px';
        box.style.right = '18px';
        box.style.maxWidth = '330px';
        box.style.background = '#000';
        box.style.border = '2px solid currentColor';
        box.style.color = document.body.classList.contains('theme-mom') ? '#ff66b2' : '#00ff66';
        box.style.padding = '10px 14px';
        box.style.fontFamily = "'Russo One', sans-serif";
        box.style.zIndex = '12000';
        box.style.cursor = 'pointer';
        box.innerHTML = `<div style="font-weight:bold; font-size:0.88rem;">${from}</div><div style="font-size:0.78rem; margin-top:3px;">${text}</div>`;
        box.addEventListener('click', () => {
            box.remove();
            openStoryMessenger();
        });
        document.body.appendChild(box);
        setTimeout(() => { if (box.parentNode) box.remove(); }, 5500);
    }

    function failChapter(reason) {
        stopPanicTimer();
        document.body.classList.remove('theme-mom');
        if (window.triggerGameOverScreen) {
            window.triggerGameOverScreen(reason);
            setTimeout(() => {
                const retryBtn = document.getElementById('btnRetryChapter');
                if (retryBtn && activeChapter >= 2) {
                    const clone = retryBtn.cloneNode(true);
                    retryBtn.parentNode.replaceChild(clone, retryBtn);
                    clone.addEventListener('click', () => {
                        document.getElementById('failOverlay')?.remove();
                        startStoryChapter(activeChapter);
                    });
                }
            }, 50);
        }
    }

    function finishChapter(num, text) {
        stopPanicTimer();
        document.body.classList.remove('theme-mom');
        if (window.triggerChapterCompleteScreen) {
            window.triggerChapterCompleteScreen(num, text);
        }
    }
    function triggerBlueScreen(subText) {
        stopPanicTimer();
        document.body.classList.remove('theme-mom');
        const bsod = document.createElement('div');
        bsod.className = 'bsod-screen';
        bsod.innerHTML = `
            <div class="bsod-sad">:(</div>
            <div class="bsod-text">На вашем ПК возникла критическая ошибка, и его необходимо перезагрузить. Синий экран. Как для компьютера, так и для жизни.<br><br>${subText}</div>
            <button class="bsod-btn" id="btnBsodMenu">В главное меню</button>
        `;
        document.body.appendChild(bsod);
        document.getElementById('btnBsodMenu').addEventListener('click', () => {
            bsod.remove();
            location.reload();
        });
    }

    function triggerGoodRebootEnding() {
        stopPanicTimer();
        const scr = document.createElement('div');
        scr.className = 'reboot-screen';
        scr.innerHTML = `
            <div style="font-size:1.6rem; letter-spacing:3px;">ПЕРЕЗАГРУЗКА СИСТЕМЫ...</div>
            <div class="reboot-story">Комп выключается. Перезагрузка. Жизнь перезагрузилась и пошла своим чередом. Родители узнали правду от Айва, который больше не боится говорить правду. Бро простил Айва и они стали лучшими друзьями. Айва сняли с учета и он снова идет на медаль, но теперь родители перестали на него сильно давить. С тех пор больше никто не пропадал… Так ведь?</div>
            <button class="win-action-btn" style="max-width:260px;" id="btnGoodMenu">Главное меню</button>
        `;
        document.body.appendChild(scr);
        document.getElementById('btnGoodMenu').addEventListener('click', () => {
            scr.remove();
            location.reload();
        });
    }

    function triggerMadEndingScene() {
        stopPanicTimer();
        const env = document.getElementById('desktopEnv');
        if (env) env.style.display = 'none';
        let overlay = document.getElementById('hackerOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'hackerOverlay';
            overlay.innerHTML = `
                <div class="hacker-bg-effects"><div class="hacker-noise"></div></div>
                <div class="hacker-caption">* дЬяВоЛ68 *</div>
                <div class="hacker-text-container"><div class="hacker-msg"></div></div>
                <div class="hacker-options-zone"></div>
            `;
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

        function renderMadStep() {
            const cur = lines[step];
            msgEl.innerHTML = `<div style="color:${cur.who === 'Айв' ? '#00ff66' : '#ff3333'}; margin-bottom:8px;">[${cur.who}]</div><div>${cur.text}</div>`;
            optZone.innerHTML = '';
            const btn = document.createElement('button');
            btn.className = 'hacker-btn';
            btn.textContent = step < lines.length - 1 ? 'Далее' : 'Принять истину (Безумная концовка)';
            btn.addEventListener('click', () => {
                if (step < lines.length - 1) {
                    step++;
                    renderMadStep();
                } else {
                    overlay.style.display = 'none';
                    finishChapter(5, 'Безумная концовка открыта: Настоящий Дьявол во Плоти.');
                }
            });
            optZone.appendChild(btn);
        }
        renderMadStep();
    }

    function openStoryMessenger() {
        let win = document.getElementById('windowStoryMess');
        if (!win) {
            const mainZone = document.querySelector('.desktop-main');
            if (!mainZone) return;
            win = document.createElement('div');
            win.id = 'windowStoryMess';
            win.classList.add('desktop-window');
            win.style.width = 'min(580px, 95vw)';
            win.style.height = 'min(430px, calc(100dvh - 52px))';
            win.innerHTML = `
                <div class="window-header">
                    <span class="window-title">Mess</span>
                    <button class="window-close-btn" id="btnCloseStoryMess">X</button>
                </div>
                <div class="window-content" style="flex-direction:row; padding:0; height:calc(100% - 32px); gap:0; overflow:hidden;">
                    <div id="storyChatList" style="width:34%; min-width:115px; border-right:1px solid rgba(0,255,102,0.25); background:rgba(0,0,0,0.65); overflow-y:auto;"></div>
                    <div id="storyChatArea" style="width:66%; flex:1; background:rgba(0,0,0,0.92); display:flex; flex-direction:column; justify-content:space-between; overflow:hidden;"></div>
                </div>
            `;
            mainZone.appendChild(win);
            document.getElementById('btnCloseStoryMess').addEventListener('click', () => win.classList.add('hidden'));
            if (window.makeWindowDraggable) window.makeWindowDraggable(win);
        }
        win.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(win);
        renderStoryMessenger();
    }
    function addMsg(chatId, sender, text, isOut, linkAction) {
        if (!chats[chatId]) return;
        chats[chatId].messages.push({ sender, text, isOut: !!isOut, time: getTimeStr(), linkAction });
        if (selectedChat !== chatId) chats[chatId].unread = (chats[chatId].unread || 0) + 1;
        renderStoryMessenger();
    }

    function setOptions(chatId, opts) {
        if (!chats[chatId]) return;
        chats[chatId].options = opts || [];
        renderStoryMessenger();
    }

    function renderStoryMessenger() {
        const listEl = document.getElementById('storyChatList');
        const areaEl = document.getElementById('storyChatArea');
        if (!listEl || !areaEl) return;

        listEl.innerHTML = '';
        Object.keys(chats).forEach(cid => {
            const c = chats[cid];
            if (c.hidden) return;
            const item = document.createElement('div');
            item.style.padding = '9px 8px';
            item.style.borderBottom = '1px solid rgba(128,128,128,0.2)';
            item.style.cursor = 'pointer';
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.style.alignItems = 'center';
            item.style.color = c.danger ? '#ff3333' : 'inherit';
            if (selectedChat === cid) {
                item.style.background = c.danger ? 'rgba(255,51,51,0.18)' : 'rgba(0,255,102,0.15)';
                c.unread = 0;
            }
            const last = c.messages[c.messages.length - 1];
            item.innerHTML = `
                <div style="overflow:hidden; flex:1;">
                    <div style="font-size:0.8rem; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${c.title}</div>
                    <div style="font-size:0.68rem; opacity:0.65; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${last ? last.text : ''}</div>
                </div>
                ${c.unread > 0 ? `<span style="background:${c.danger ? '#ff3333' : '#00ff66'}; color:#000; font-size:0.68rem; padding:1px 5px; font-weight:bold;">${c.unread}</span>` : ''}
            `;
            item.addEventListener('click', () => {
                selectedChat = cid;
                c.unread = 0;
                renderStoryMessenger();
            });
            listEl.appendChild(item);
        });

        if (!selectedChat || !chats[selectedChat]) {
            areaEl.innerHTML = `<div style="margin:auto; opacity:0.55; font-size:0.8rem; text-align:center; padding:16px;">Выберите диалог слева</div>`;
            return;
        }

        const cur = chats[selectedChat];
        areaEl.innerHTML = `
            <div style="padding:7px 10px; border-bottom:1px solid rgba(128,128,128,0.25); font-size:0.84rem; font-weight:bold; color:${cur.danger ? '#ff3333' : 'inherit'};">${cur.title}</div>
            <div id="storyLogsBox" style="flex:1; overflow-y:auto; padding:10px; display:flex; flex-direction:column; gap:8px;"></div>
            <div id="storyOptsBox" style="padding:7px; border-top:1px solid rgba(128,128,128,0.25); display:flex; flex-direction:column; gap:5px; max-height:48%; overflow-y:auto;"></div>
        `;

        const logsBox = document.getElementById('storyLogsBox');
        const optsBox = document.getElementById('storyOptsBox');

        cur.messages.forEach(m => {
            const div = document.createElement('div');
            div.style.maxWidth = '86%';
            div.style.padding = '6px 9px';
            div.style.fontSize = '0.78rem';
            div.style.lineHeight = '1.38';
            div.style.border = `1px solid ${cur.danger ? '#ff3333' : 'currentColor'}`;
            div.style.alignSelf = m.isOut ? 'flex-end' : 'flex-start';
            div.style.background = m.isOut ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.4)';
            div.innerHTML = `
                <div style="font-size:0.68rem; opacity:0.75; margin-bottom:2px;">${m.sender}</div>
                <div>${m.text} ${m.linkAction ? `<span class="article-link" id="msgInlineLink">*ссылка*</span>` : ''}</div>
                <div style="text-align:right; font-size:0.6rem; opacity:0.6; margin-top:2px;">${m.time}</div>
            `;
            logsBox.appendChild(div);
            if (m.linkAction) {
                const lnk = div.querySelector('#msgInlineLink');
                if (lnk) lnk.addEventListener('click', m.linkAction);
            }
        });
        logsBox.scrollTop = logsBox.scrollHeight;

        cur.options.forEach(opt => {
            const b = document.createElement('button');
            b.style.background = 'transparent';
            b.style.border = `1px solid ${cur.danger ? '#ff3333' : 'currentColor'}`;
            b.style.color = cur.danger ? '#ff3333' : 'inherit';
            b.style.padding = '6px 8px';
            b.style.textAlign = 'left';
            b.style.fontFamily = "'Russo One', sans-serif";
            b.style.fontSize = '0.74rem';
            b.style.cursor = 'pointer';
            b.textContent = opt.label;
            b.addEventListener('click', opt.action);
            optsBox.appendChild(b);
        });
    }

    function openCardModal(onSuccess) {
        const modal = document.createElement('div');
        modal.className = 'card-modal';
        modal.innerHTML = `
            <div class="card-box">
                <div style="font-size:1rem; text-align:center;">ПОДТВЕРЖДЕНИЕ ОПЛАТЫ (50 ₽)</div>
                <div style="font-size:0.8rem; opacity:0.85;">Введите пароль от привязанной карты.</div>
                <div style="font-size:0.78rem; color:#ffaa00;">Подсказка: Имя любимого сына</div>
                <input type="text" class="browser-input" id="cardPassInput" placeholder="Пароль...">
                <div id="cardErr" style="color:#ff3333; font-size:0.75rem; min-height:16px;"></div>
                <div style="display:flex; gap:8px;">
                    <button class="browser-btn" style="flex:1;" id="btnPayConfirm">Оплатить</button>
                    <button class="action-btn" style="flex:1; padding:7px;" id="btnPayCancel">Отмена</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('btnPayCancel').addEventListener('click', () => modal.remove());
        document.getElementById('btnPayConfirm').addEventListener('click', () => {
            const val = document.getElementById('cardPassInput').value.trim().toLowerCase();
            if (val === 'айв') {
                modal.remove();
                onSuccess();
            } else {
                document.getElementById('cardErr').textContent = 'Неверный пароль карты!';
            }
        });
    }
    window.openApplicationWindow = (origOpen => {
        return function(appId) {
            if (activeChapter >= 2 && appId === 'messenger') {
                openStoryMessenger();
                return;
            }
            if (appId === 'browser') {
                window.initBrowserApp();
                return;
            }
            if (appId === 'slides') {
                window.initSlidesApp();
                return;
            }
            if (appId === 'reports') {
                window.initReportsApp();
                return;
            }
            if (appId === 'secret_file') {
                window.initSecretFileApp();
                return;
            }
            if (appId === 'store' && activeChapter === 3) {
                if (origOpen) origOpen('store');
                setTimeout(() => {
                    const container = document.getElementById('storeContainer');
                    if (!container) return;
                    container.querySelectorAll('button').forEach(btn => {
                        if (btn.textContent.includes('Скачать') || btn.textContent.includes('Get')) {
                            const row = btn.parentElement;
                            if (row && (row.textContent.includes('Тетрис') || row.textContent.includes('Tetris'))) {
                                const payBtn = btn.cloneNode(true);
                                payBtn.textContent = 'Купить (50 ₽)';
                                payBtn.style.borderColor = '#ffaa00';
                                payBtn.style.color = '#ffaa00';
                                btn.parentNode.replaceChild(payBtn, btn);
                                payBtn.addEventListener('click', () => {
                                    openCardModal(() => {
                                        window.AppConfig.state.installed.push('tetris');
                                        window.AppConfig.save();
                                        if (window.renderDesktopIcons) window.renderDesktopIcons();
                                        document.getElementById('windowStore')?.classList.add('hidden');
                                        if (window.onTetrisPurchasedInCh3) window.onTetrisPurchasedInCh3();
                                    });
                                });
                            }
                        }
                    });
                }, 40);
                return;
            }
            if (origOpen) origOpen(appId);
        };
    })(window.openApplicationWindow);

    function startStoryChapter(ch) {
        activeChapter = ch;
        selectedChat = null;
        chats = {};
        flags = {};
        stopPanicTimer();
        document.body.classList.remove('theme-mom');
        if (window.resetExtraAppsState) window.resetExtraAppsState();
        if (window.setTetrisPossessed) window.setTetrisPossessed(false);

        const env = document.getElementById('desktopEnv');
        env.style.display = 'flex';
        env.style.filter = 'none';
        env.classList.remove('hidden');
        setTimeout(() => env.classList.add('visible'), 40);

        registerExtraApps();
        document.querySelectorAll('.desktop-window').forEach(w => w.classList.add('hidden'));

        if (ch === 2) setupChapter2();
        if (ch === 3) setupChapter3();
        if (ch === 4) setupChapter4();
        if (ch === 5) setupChapter5();

        if (window.renderDesktopIcons) window.renderDesktopIcons();
        if (window.YandexModule) window.YandexModule.startGameplay();
    }
    function setupChapter2() {
        window.allowSchool1290InSearch = true;
        window.AppConfig.state.installed = ['trash', 'explorer', 'messenger', 'store', 'browser'];
        window.AppConfig.state.trashContents = [];
        window.AppConfig.save();

        chats = {
            mom: { title: '👩 Мама', unread: 1, messages: [], options: [] },
            sam: { title: '👦 Бро (Сэм)', unread: 0, messages: [], options: [] },
            devil: { title: '❓ ???', unread: 0, danger: true, hidden: true, messages: [], options: [] }
        };

        addMsg('mom', 'Мама', 'Айв что с тобой? Твоя учительница по математике сказала что ты был какой-то бледный на уроке, но что самое главное, не ответил ни на один вопрос в тесте. У тебя двойка. Как так вообще можно было сделать? Мы же шли на золотую медаль!', false);
        setOptions('mom', [
            { label: '1. Мам, мне угрожали! Мой компьютер взломали и какой-то человек мне угрожал!', action: () => failChapter('Мать не поверила сыну, а через несколько дней она пропала…') },
            { label: '2. Боже да отвали от меня! Ты меня вообще не понимаешь!', action: () => failChapter('Мать была очень огорчена этими словами. Она забрала у вас компьютер, а значит вы не сможете исполнять наказы дЬяВоЛа. Ваших близких так и не нашли…') },
            {
                label: '3. Прости…',
                action: () => {
                    addMsg('mom', 'Вы', 'Прости…', true);
                    addMsg('mom', 'Мама', 'Айв, да что мне твое прости! Я хочу чтобы у тебя были хорошие, нет нет, идеальные перспективы в будущем! Чтобы у тебя не было проблем как у нас с твоим папой! Я закрою глаза на этот раз, но если это еще раз повторится, то я заберу все твои гаджеты!', false);
                    setOptions('mom', [
                        {
                            label: '1. Мам, мне угрожали! Мой компьютер взломали...',
                            action: () => failChapter('Мать никак не отреагировала, а потом с её номера тебе написали «Ты следующий»…')
                        },
                        {
                            label: '2. Мам, я хотел тебе кое что сказать… Я люблю тебя.',
                            action: () => {
                                addMsg('mom', 'Вы', 'Мам, я хотел тебе кое что сказать… Я люблю тебя.', true);
                                addMsg('mom', 'Мама', 'Ох, сына. И я тебя очень сильно люблю! А теперь давай, садись за уроки, чтобы такого больше не было!', false);
                                setOptions('mom', []);
                                setTimeout(() => {
                                    chats.devil.hidden = false;
                                    addMsg('devil', '???', 'В следующий раз будь еще осторожнее, а то одним из них может быть ты:', false, () => {
                                        window.initBrowserApp('school_1290');
                                    });
                                    notifyPopup('???', 'Новое сообщение с ссылкой...');
                                }, 1400);
                            }
                        }
                    ]);
                }
            }
        ]);

        window.onSchoolLinkClicked = function() {
            document.getElementById('windowBrowser')?.classList.add('hidden');
            document.getElementById('windowStoryMess')?.classList.add('hidden');
            const env = document.getElementById('desktopEnv');
            env.classList.add('glitch-shake');
            setTimeout(() => {
                env.classList.remove('glitch-shake');
                addMsg('devil', '???', 'тВоЕ пЕрВоЕ зАдАнИе! ТеБе НаДо ПоСсОрИтЬсЯ сО сВоИм ЛуЧшИм ДрУгОм За 15 МиНуТ! вРеМя ПоШлО!', false);
                selectedChat = 'sam';
                openStoryMessenger();
                startPanicTimer(15, () => failChapter('Время вышло! Вы не успели поссориться с другом...'));
                setOptions('sam', [
                    {
                        label: 'Написать: Мы больше не друзья!',
                        action: () => {
                            addMsg('sam', 'Вы', 'Мы больше не друзья!', true);
                            addMsg('sam', 'Сэм', 'Почему? Что случилось?', false);
                            setOptions('sam', [
                                {
                                    label: '1. Если я не поссорюсь с тобой, то тебя и моих родителей убьют!',
                                    action: () => failChapter('Что за приколы? Если не хотел дружить так и сказал бы! Вы раскрыли тайну между вами и дЬяВоЛоМ.')
                                },
                                {
                                    label: '2. Мама не хочет, чтобы я дружил с тобой, Сэм.',
                                    action: () => {
                                        addMsg('sam', 'Вы', 'Мама не хочет, чтобы я дружил с тобой, Сэм.', true);
                                        addMsg('sam', 'Сэм', 'А ты вечно будешь потакать её безумным идеям? Бро ты серьезно сейчас? Да кто будет тогда с тобой дружить, Мистер Учеба? Не пиши мне больше.', false);
                                        setOptions('sam', []);
                                        stopPanicTimer();
                                        setTimeout(() => {
                                            addMsg('devil', '???', 'Надо же! Успел! Так еще и сохранил тайну! Ну неплохо, неплохо. Но ты не расслабляйся, Айв. Впереди еще много испытаний! Ты ведь не хочешь расстроить свою маму еще и прогуливанием школы? Не переживай, такие задания тебе не светят… Пока что.', false);
                                            selectedChat = 'devil';
                                            renderStoryMessenger();
                                            setTimeout(() => finishChapter(2, 'Вы спасли близких ценой лучшего друга...'), 3200);
                                        }, 1200);
                                    }
                                },
                                {
                                    label: '3. Потому что',
                                    action: () => failChapter('Вы не пришли в школу. Просто дома голову забыли.')
                                }
                            ]);
                        }
                    }
                ]);
            }, 1300);
        };

        notifyPopup('Мама', 'Айв что с тобой? У тебя двойка...');
    }
    function setupChapter3() {
        window.allowSchool1290InSearch = false;
        window.AppConfig.state.installed = ['trash', 'explorer', 'messenger', 'store', 'browser'];
        window.AppConfig.state.trashContents = [];
        window.AppConfig.save();

        chats = {
            cass: { title: '👧 Кассандра', unread: 0, hidden: true, messages: [], options: [] },
            mom: { title: '👩 Мама', unread: 0, messages: [], options: [] },
            devil: { title: '❓ ???', unread: 0, danger: true, messages: [], options: [] }
        };

        notifyPopup('Мысли Айва', 'Откройте Браузер и поищите статьи о пропавших детях за 5 лет.');

        window.onBrowserSearched = function(q) {
            if (flags.searched) return;
            if (q.includes('пропав') || q.includes('5 лет') || q.includes('дет')) {
                flags.searched = true;
                setTimeout(() => {
                    chats.cass.hidden = false;
                    addMsg('cass', 'Кассандра', 'Привет, Айв. Это я Кассандра. Мы же учимся в одном классе, помнишь? Слушай я тут проект сделала. Поможешь с ним?', false);
                    setOptions('cass', [
                        {
                            label: '1. Знаешь я сегодня очень занят и не смогу помочь',
                            action: () => {
                                addMsg('cass', 'Вы', 'Знаешь я сегодня очень занят и не смогу помочь', true);
                                addMsg('cass', 'Кассандра', 'Прошу тебя Айв! Ты же знаешь как мои родители относятся к не идеальным оценкам! Они хотят что бы я была круглой отличницей! Прошу тебя Айв! А я взамен могу выполнить твои проекты за тебя!', false);
                                setOptions('cass', [{ label: 'Ладно, открываю проект...', action: () => openCassSlides() }]);
                            }
                        },
                        {
                            label: '2. Ладно, сейчас гляну.',
                            action: () => {
                                addMsg('cass', 'Вы', 'Ладно, сейчас гляну.', true);
                                openCassSlides();
                            }
                        }
                    ]);
                    notifyPopup('Кассандра', 'Привет, Айв. Поможешь с проектом?');
                }, 1500);
            }
        };

        function openCassSlides() {
            if (!window.AppConfig.state.installed.includes('slides')) {
                window.AppConfig.state.installed.push('slides');
                window.AppConfig.save();
                if (window.renderDesktopIcons) window.renderDesktopIcons();
            }
            document.getElementById('windowStoryMess')?.classList.add('hidden');
            window.initSlidesApp();
        }

        window.onGraveClicked = function(count) {
            persistentGraveClicks = count;
        };

        window.onFourthSlideTriggered = function() {
            setOptions('cass', [
                {
                    label: 'Спросить: Что за чертовщина на 4 слайде!?',
                    action: () => {
                        addMsg('cass', 'Вы', 'Что за чертовщина на 4 слайде!?', true);
                        addMsg('cass', 'Кассандра', 'Что? О чем ты? В проекте только 3 слайда.', false);
                        setOptions('cass', []);
                    }
                }
            ]);

            setOptions('devil', [
                {
                    label: 'Написать: У тебя есть новое ужасное задание?',
                    action: () => {
                        addMsg('devil', 'Вы', 'У тебя есть новое ужасное задание?', true);
                        addMsg('devil', '???', 'И в планах не было. Но раз уж ты так сильно хочешь этого, то вот задание: купи тетрис.', false);
                        addMsg('devil', 'Вы', 'Купить? Он же платный!', true);
                        addMsg('devil', '???', 'У тебя 30 минут. Не справишься - твоим пальчикам в принципе не придется ничего покупать.', false);
                        setOptions('devil', []);
                        startPanicTimer(30, () => failChapter('30 минут истекли. Вы не купили Тетрис...'));

                        setOptions('mom', [
                            {
                                label: 'Эй мам. Помнишь я хотел одну игру? Можешь купить мне тетрис?',
                                action: () => {
                                    addMsg('mom', 'Вы', 'Эй мам. Помнишь я хотел одну игру? Можешь пожалуйста купить мне тетрис?', true);
                                    addMsg('mom', 'Мама', 'Ах вот как? То есть ты не учишься, а я тебе игрушки должна дарить? Пока ты не исправишь все ошибки - никаких игр!', false);
                                    setOptions('mom', []);
                                }
                            }
                        ]);
                    }
                }
            ]);
        };

        window.onTetrisPurchasedInCh3 = function() {
            stopPanicTimer();
            addMsg('devil', '???', 'Быстро. Даже очень. И почти никакой драмы. Айви, у тебя хотя бы еще друзья есть? Ладно, тогда вот еще задание! Слабо сейчас сказать своей маме, что она тебя не понимает?', false);
            addMsg('devil', 'Вы', 'Ты же обещал что её это касаться не будет!', true);
            addMsg('devil', '???', 'Я обещал что я не запрещаю ходить тебе в школу. А вот твои отношения я все еще в праве портить. У тебя 5 минут. Не затягивай!', false);
            selectedChat = 'mom';
            openStoryMessenger();
            startPanicTimer(5, () => failChapter('5 минут истекли! Вы не успели написать маме.'));

            setOptions('mom', [
                {
                    label: '1. Ну как обычно. Ты меня не понимаешь вот и все!',
                    action: () => {
                        addMsg('mom', 'Вы', 'Ну как обычно. Ты меня не понимаешь вот и все!', true);
                        addMsg('mom', 'Мама', 'Ты понимаешь что говоришь? Да я не узнаю тебя! Совсем распоясался! Уроки не учишь, игры платные просишь, так еще и говоришь что я тебя не понимаю!? Вот завтра я вернусь с работы… Дома поговорим!', false);
                        setOptions('mom', []);
                        stopPanicTimer();
                        setTimeout(() => {
                            addMsg('devil', '???', 'Ну вот это уже другое дело! Рад, что ты проявил инициативу мне написать, но так ты только ускоришь все веселье, поэтому не переживай, дальше я сам буду писать.', false);
                            addMsg('devil', 'Вы', 'Твоя цель рассорить меня со всеми?', true);
                            addMsg('devil', '???', 'Нет. Моя цель - твои страдания. Не знаю - мне нравится когда все страдают. Ах да, точно. Не забудь сделать уроки, ведь завтра школа)', false);
                            selectedChat = 'devil';
                            renderStoryMessenger();
                            setTimeout(() => finishChapter(3, 'Тетрис куплен. Отношения с мамой разрушены.'), 3500);
                        }, 1200);
                    }
                },
                {
                    label: '2. Я люблю тебя.',
                    action: () => failChapter('Вы в последний раз напечатали, что любите маму.')
                },
                {
                    label: '3. Я купил тетрис.',
                    action: () => failChapter('Сначала ремень, потом пальцы.')
                }
            ]);
        };
    }
    function setupChapter4() {
        document.body.classList.add('theme-mom');
        window.AppConfig.state.installed = ['trash', 'explorer', 'messenger', 'reports'];
        window.AppConfig.state.trashContents = [];
        window.AppConfig.save();

        chats = {
            kirill: { title: '❤️ Муж (Кирилл)', unread: 1, messages: [], options: [] },
            teacher: { title: '👩‍🏫 Лариса Эдуардовна', unread: 0, hidden: true, messages: [], options: [] }
        };

        addMsg('kirill', 'Кирилл', 'Лора, как дела на работе?', false);
        setOptions('kirill', [
            {
                label: 'Ответить: Ох, Кир, 10 отчетов из 15 закончены...',
                action: () => {
                    addMsg('kirill', 'Лора', 'Ох, Кир, да на работе все хорошо, 10 отчетов из 15 закончены. Сегодня вечером я смогу наконец то прийти домой и выспаться.', true);
                    addMsg('kirill', 'Кирилл', 'А как там Айв? Пишет что нибудь?', false);
                    setOptions('kirill', [
                        {
                            label: 'Пожаловаться на оценки и ссору',
                            action: () => {
                                addMsg('kirill', 'Лора', 'В этом и проблема! Пишет, да еще как! Сначала плохие оценки, потом просит КУПИТЬ игру, а затем наконец говорит что я его не понимаю!', true);
                                addMsg('kirill', 'Кирилл', 'Слушай, не хочу подливать масло в огонь, но кажется он все же купил эту игру. У меня вчера списалось 50 рублей на какой-то Тетрис.', false);
                                setOptions('kirill', [
                                    {
                                        label: 'Может ты придешь и дашь ему ремня?',
                                        action: () => {
                                            addMsg('kirill', 'Лора', 'Ну вот видишь! Он еще и не слушается нас! Может ты придешь и дашь ему ремня? Так сказать, вправишь мозги?', true);
                                            addMsg('kirill', 'Кирилл', 'Да успокойся! Ну подумаешь 50 рублей, ну не сделал он уроки, но это не конец света. Нет, это очень плохо! И так поступать нельзя, но может с ним просто надо поговорить?', false);
                                            setOptions('kirill', [
                                                {
                                                    label: 'Хорошо, поговори с ним, как дома будешь.',
                                                    action: () => {
                                                        addMsg('kirill', 'Лора', 'Да не знаю я! Я просто уже устала от его выходок! Что с ним происходит в последнее время? Хорошо, поговори с ним, как дома будешь. Надеюсь это повлияет на него.', true);
                                                        setOptions('kirill', []);
                                                        notifyPopup('Работа', 'Закончите оставшиеся 5 отчетов в приложении «Отчеты»!');
                                                    }
                                                }
                                            ]);
                                        }
                                    }
                                ]);
                            }
                        }
                    ]);
                }
            }
        ]);

        window.onMomReportsCompleted = function() {
            document.getElementById('windowReports')?.classList.add('hidden');
            chats.teacher.hidden = false;
            addMsg('teacher', 'Лариса Эдуардовна', 'Здравствуйте, Элеонора Степановна. Доношу до вашего сведения, что сегодня ваш сын сорвал урок. Так еще и самым неподобающим способом!', false);
            notifyPopup('Лариса Эдуардовна', 'Здравствуйте, Элеонора Степановна...');
            setOptions('teacher', [
                {
                    label: 'Здравствуйте, что произошло?',
                    action: () => {
                        addMsg('teacher', 'Лора', 'Здравствуйте, что произошло?', true);
                        addMsg('teacher', 'Лариса Эдуардовна', 'Ваш сын во время урока встал, подошел к моему столу, поднялся на него и снял штаны! Так еще и начал всех покрывать нецензурной лексикой! А на перемене он начал на весь коридор кричать, что знает где по дешевле купить сигареты!', false);
                        setOptions('teacher', [
                            {
                                label: 'Мне очень стыдно за него! Такого больше не повторится!',
                                action: () => {
                                    addMsg('teacher', 'Лора', 'Мне очень стыдно за него, Лариса Эдуардовна! Такого больше не повторится! Я обязательно проведу беседу с ним!', true);
                                    addMsg('teacher', 'Лариса Эдуардовна', 'Да если бы он обошелся только беседой. О золотой медали и речи быть не может! Его поставили на учет. Еще одна провинность — забирайте документы. Всего доброго!', false);
                                    setOptions('teacher', []);
                                    setTimeout(() => switchToIveInCh4(), 2500);
                                }
                            }
                        ]);
                    }
                }
            ]);
        };

        notifyPopup('Кирилл', 'Лора, как дела на работе?');
    }

    function switchToIveInCh4() {
        document.getElementById('windowStoryMess')?.classList.add('hidden');
        window.triggerLoading(() => {
            document.body.classList.remove('theme-mom');
            window.AppConfig.state.installed = ['trash', 'explorer', 'messenger', 'tetris'];
            window.AppConfig.save();
            if (window.renderDesktopIcons) window.renderDesktopIcons();

            chats = {
                dad: { title: '👨 Папа', unread: 1, messages: [], options: [] },
                devil: { title: '❓ ???', unread: 0, danger: true, hidden: true, messages: [], options: [] },
                mom: { title: '👩 Мама', unread: 0, hidden: true, messages: [], options: [] },
                sam: { title: '👦 Бро', unread: 0, hidden: true, messages: [], options: [] }
            };

            addMsg('dad', 'Папа', 'Сын, мы сегодня с мамой задерживаемся на работе. Найди что поесть. Завтра ты не пойдешь в школу. У нас будет серьезный разговор о твоей успеваемости, а также поведении.', false);
            notifyPopup('Папа', 'Сын, мы сегодня с мамой задерживаемся...');

            setTimeout(() => {
                chats.devil.hidden = false;
                addMsg('devil', '???', 'Итак, сегодня ты меня посмешил, серьезно! Я это видео с камер уже переслал почти всем кого только знаю! Но вот то, что ты не спрятал своего «Бро» в мусорнике, это было ошибкой. С тобой правда было весело, Айв. Но все хорошее рано или поздно заканчивается. Но есть и хорошие новости: я не трону твоих близких и друзей. Но прицел будет снят только после твоей смерти. Кстати я иду за тобой. Скоро увидимся)', false);
                notifyPopup('???', 'Прицел будет снят только после твоей смерти...');
            }, 3000);

            setTimeout(() => {
                chats.mom.hidden = false;
                addMsg('mom', 'Мама', 'Я очень разочарована в тебе. Я даже не узнаю в тебе своего сына. В кого ты превратился?', false);
                notifyPopup('Мама', 'Я очень разочарована в тебе...');
            }, 6000);

            setTimeout(() => {
                chats.sam.hidden = false;
                addMsg('sam', 'Бро', 'Я так разочарован в тебе.', false);
                notifyPopup('Бро', 'Я так разочарован в тебе.');
                setTimeout(() => finishChapter(4, 'Айв остался совершенно один на краю гибели и безумия...'), 4200);
            }, 9000);
        });
    }
    function setupChapter5() {
        window.AppConfig.state.installed = ['trash', 'explorer', 'messenger', 'tetris'];
        window.AppConfig.state.trashContents = [];
        window.AppConfig.save();

        const env = document.getElementById('desktopEnv');
        env.classList.add('glitch-shake');
        setTimeout(() => env.classList.remove('glitch-shake'), 1600);

        chats = {
            teacher: { title: '👩‍🏫 Лариса Эдуардовна', unread: 0, messages: [], options: [] },
            dad: { title: '👨 Папа', unread: 0, messages: [], options: [] },
            mom: { title: '👩 Мама', unread: 0, messages: [], options: [] },
            sam: { title: '👦 Бро', unread: 0, messages: [], options: [] },
            devil: { title: '❓ ???', unread: 0, danger: true, messages: [], options: [] },
            via: { title: '👁️ вйА', unread: 0, hidden: true, messages: [], options: [] }
        };

        let apologiesSent = 0;

        function checkAllApologies() {
            apologiesSent++;
            if (apologiesSent < 4) return;
            notifyPopup('Мысли Айва', 'Все прощальные письма отправлены. Решите: поторопить ??? в чате или просто запустить Тетрис...');
            window.setTetrisPossessed(true);

            setOptions('devil', [
                {
                    label: 'Поторопить: Ну и долго ты собираешься идти? Я уже не боюсь тебя!',
                    action: () => {
                        addMsg('devil', 'Вы', 'Ну и долго ты собираешься идти? Я уже не боюсь тебя! Ты называешь себя дьяволом, но на деле ты просто маньяк, который самоутверждается за счет убийств. Ты - неудачник, раз твоя цель в жизни - убивать!', true);
                        setOptions('devil', []);
                        setTimeout(() => addMsg('devil', '???', 'Решил показать оскал, песик? Не боишься меня? Уже готов к смерти? Знаешь, я не просто дьявол…', false), 800);
                        setTimeout(() => addMsg('dad', 'Папа', 'я ТвОй ХоЗяИн…', false), 1600);
                        setTimeout(() => addMsg('teacher', 'ЛЭ', 'хОзЯиН, чТо ДеРжИт ТеБя На ЦеПи и МеДлЕнНо ТрАвИт ТеБя…', false), 2400);
                        setTimeout(() => addMsg('mom', 'Мама', 'А еСлИ тЫ мНе НаСкУчИшЬ…', false), 3200);
                        setTimeout(() => addMsg('sam', 'Бро', 'иЛи ПоПыТаЕшЬсЯ оТвЕрНуТьСя От МеНя…', false), 4000);
                        setTimeout(() => addMsg('devil', '???', 'То нога хозяина не заметит щенка под собой!', false), 4800);
                        setTimeout(() => triggerBlueScreen('Все вокруг было ненастоящим. Дьявол был всегда.'), 6800);
                    }
                }
            ]);
        }

        setOptions('teacher', [{
            label: 'Отправить извинения Ларисе Эдуардовне',
            action: () => {
                addMsg('teacher', 'Вы', 'Лариса Эдуардовна, извините меня за ужасное поведение сегодня. Я понимаю, что мне нет оправданий и так просто я ничего не исправлю, но обещаю что больше вы от меня не увидите таких выходок.', true);
                setOptions('teacher', []);
                checkAllApologies();
            }
        }]);

        setOptions('dad', [{
            label: 'Отправить прощание Папе',
            action: () => {
                addMsg('dad', 'Вы', 'Папа, спасибо тебе, что ты у меня такой хороший! Я очень рад, что ты - мой папа!', true);
                setOptions('dad', []);
                checkAllApologies();
            }
        }]);

        setOptions('mom', [{
            label: 'Отправить прощание Маме',
            action: () => {
                addMsg('mom', 'Вы', 'Мама. Прости меня пожалуйста за все! Я понимаю что ты хотела во мне видеть святого человека, а я старался им быть. Я так хотел бы тебе все рассказать но вряд ли смогу. Люблю тебя', true);
                setOptions('mom', []);
                checkAllApologies();
            }
        }]);

        setOptions('sam', [{
            label: 'Отправить прощание Бро',
            action: () => {
                addMsg('sam', 'Вы', 'Бро… Я очень сожалею о том, что поссорился с тобой. Ведь ты - лучший друг что когда либо был у меня. Прости меня за все и… Прощай!', true);
                setOptions('sam', []);
                checkAllApologies();
            }
        }]);

        window.onTetrisPossessedOpened = function() {
            if (flags.viaSpawned) return;
            flags.viaSpawned = true;
            setOptions('devil', []);
            setTimeout(() => {
                chats.via.hidden = false;
                addMsg('via', 'вйА', 'Отправь этот файл дьяволу сейчас! И не открывай его!', false);
                if (!window.AppConfig.state.installed.includes('secret_file')) {
                    window.AppConfig.state.installed.push('secret_file');
                    window.AppConfig.save();
                    if (window.renderDesktopIcons) window.renderDesktopIcons();
                }
                notifyPopup('вйА', 'Отправь этот файл дьяволу сейчас! И не открывай его!');

                setOptions('devil', [{
                    label: 'Отправить Файл_вйА.dat не открывая',
                    action: () => {
                        setOptions('devil', []);
                        addMsg('devil', 'Вы', 'Раз уж ты тут, то тебе стоит это посмотреть. Я не знаю что это, да и не важно. Просто посмотри и убей меня наконец.', true);
                        setTimeout(() => addMsg('devil', '???', 'Дай-ка подумать… Ладно, мне все равно есть вирус или нет. Ты - последняя жертва моих игр! Последний 100 человек в моей коллекции. Поэтому мне все равно, уничтожишь ты мой комп или нет…', false), 1400);
                        setTimeout(() => addMsg('devil', '???', 'Старые документы… Но откуда…', false), 3200);
                        setTimeout(() => addMsg('devil', '???', 'Нет! Не может быть! Но кто же тогда он! Кто он! КТО ОН…', false), 4800);
                        setTimeout(() => {
                            const totalClicks = Math.max(persistentGraveClicks, window.getGraveClickCount ? window.getGraveClickCount() : 0);
                            if (totalClicks >= 68) {
                                triggerMadEndingScene();
                            } else {
                                triggerGoodRebootEnding();
                            }
                        }, 6800);
                    }
                }]);
            }, 1500);
        };

        window.onSecretFileOpened = function() {
            const envBox = document.getElementById('desktopEnv');
            envBox.classList.add('glitch-shake');
            notifyPopup('СИСТЕМА', 'ОБНАРУЖЕНЫ АРХИВЫ ПРОПАВШИХ ДЕТЕЙ И ПРОЕКТ СОЗДАНИЯ ИИ...');
            setTimeout(() => {
                envBox.classList.remove('glitch-shake');
                triggerBlueScreen('Вы открыли файл вопреки предупреждению. Слишком много ошибок.');
            }, 2600);
        };

        notifyPopup('Мысли Айва', 'Откройте Mess и напишите всем, кого обидели...');
    }
})();
