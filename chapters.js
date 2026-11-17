(function() {
    let activeCh = 1;
    let timerId = null;
    let secLeft = 0;
    let chatId = null;
    let chats = {};
    let scheduledTimers = [];
    let graveClicks = parseInt(localStorage.getItem('kpr_grave_clicks') || '0', 10);
    let tetrisEvil = false;
    let browserUnlockedByDevil = false;

    window.StoryEngine = {
        getActiveChapter: () => activeCh,
        isStoryChapterActive: () => activeCh >= 2,
        isBrowserLocked: () => activeCh === 2 && !browserUnlockedByDevil,
        unlockBrowser: () => { browserUnlockedByDevil = true; },
        isTetrisEvil: () => tetrisEvil,
        setTetrisEvil: (val) => { tetrisEvil = !!val; },
        getGraveClicks: () => graveClicks,
        setGraveClicks: (n) => {
            graveClicks = n;
            localStorage.setItem('kpr_grave_clicks', String(n));
        },
        resetGraveClicks: () => {
            graveClicks = 0;
            localStorage.removeItem('kpr_grave_clicks');
        },
        later: (fn, ms) => {
            const id = setTimeout(fn, ms);
            scheduledTimers.push(id);
            return id;
        },
        clearScheduled: () => {
            scheduledTimers.forEach(id => clearTimeout(id));
            scheduledTimers = [];
        },
        setChats: (newChats) => {
            chats = newChats;
            chatId = null;
            renderNativeMess();
        },
        getChats: () => chats,
        setChatId: (id) => {
            chatId = id;
            if (chats[id]) chats[id].u = 0;
            renderNativeMess();
        },
        addM: (id, who, text, out, fn) => {
            if (!chats[id]) return;
            const now = new Date();
            const tm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
            chats[id].m.push({ who, text, out: !!out, fn, tm });
            if (chatId !== id) chats[id].u = (chats[id].u || 0) + 1;
            renderNativeMess();
        },
        setOpt: (id, list) => {
            if (chats[id]) {
                chats[id].o = list || [];
                renderNativeMess();
            }
        },
        openMess: () => openNativeMess(),
        renderMess: () => renderNativeMess(),
        setTimer: (min, onEnd) => {
            clearTimer();
            secLeft = min * 60;
            if (window.stopClock) window.stopClock();
            const cl = document.getElementById('taskbarClock');
            if (cl) cl.classList.add('timer-panic');
            const updateClock = () => {
                if (cl) {
                    cl.textContent = String(Math.floor(secLeft / 60)).padStart(2, '0') + ':' + String(secLeft % 60).padStart(2, '0');
                }
            };
            updateClock();
            timerId = setInterval(() => {
                secLeft--;
                updateClock();
                if (secLeft <= 0) {
                    clearTimer();
                    onEnd();
                }
            }, 1000);
        },
        clearTimer: () => clearTimer(),
        toast: (from, text) => {
            document.getElementById('activeMessNotify')?.remove();
            const isMobile = window.innerWidth <= 1023 || window.innerHeight <= 540;
            const d = document.createElement('div');
            d.id = 'activeMessNotify';
            d.style.cssText = `position:fixed;bottom:${isMobile ? '46px' : '54px'};right:${isMobile ? '12px' : '18px'};max-width:${isMobile ? 'calc(100vw - 24px)' : '320px'};background:#000;border:2px solid currentColor;padding:10px 14px;font-family:Russo One,sans-serif;z-index:12000;cursor:pointer;`;
            d.style.color = document.body.classList.contains('theme-mom') ? '#ff66b2' : '#00ff66';
            d.innerHTML = `<b>${from}</b><div style="font-size:0.78rem;margin-top:3px;">${text}</div>`;
            d.onclick = () => {
                d.remove();
                openNativeMess();
            };
            document.body.appendChild(d);
            window.StoryEngine.later(() => d.remove(), 5500);
        },
        over: (txt) => {
            const failedCh = activeCh;
            resetAllStoryState();
            if (window.triggerGameOverScreen) window.triggerGameOverScreen(txt, failedCh);
        },
        win: (ch, txt) => {
            resetAllStoryState();
            if (window.triggerChapterCompleteScreen) window.triggerChapterCompleteScreen(ch, txt);
        },
        bsod: (txt) => {
            resetAllStoryState();
            document.getElementById('bsodOverlay')?.remove();
            const d = document.createElement('div');
            d.id = 'bsodOverlay';
            d.className = 'bsod-screen';
            d.innerHTML = `<div class="bsod-sad">:(</div><div class="bsod-text">Синий экран. Как для компьютера, так и для жизни.<br><br>${txt}</div><button class="bsod-btn" id="btnBsodMenu">В меню</button>`;
            document.body.appendChild(d);
            document.getElementById('btnBsodMenu').onclick = () => location.reload();
        }
    };

    window.isStoryChapterActive = () => activeCh >= 2;
    window.isStoryBrowserLocked = () => activeCh === 2 && !browserUnlockedByDevil;
    window.isTetrisEvilMode = () => tetrisEvil;
    window.forceOpenStoryMessenger = () => openNativeMess();
    window.forceOpenOfflineBrowser = () => showOfflineBrowser();

    function clearTimer() {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }
        document.getElementById('taskbarClock')?.classList.remove('timer-panic');
        if (window.startClock) window.startClock();
    }

    function resetAllStoryState() {
        clearTimer();
        window.StoryEngine.clearScheduled();
        activeCh = 1;
        chatId = null;
        chats = {};
        tetrisEvil = false;
        browserUnlockedByDevil = false;
        document.body.classList.remove('theme-mom');
        if (window.setTetrisPossessed) window.setTetrisPossessed(false);
        if (window.resetExtraAppsState) window.resetExtraAppsState();
    }
    window.resetStoryChaptersState = resetAllStoryState;

    function syncTitles() {
        const grid = document.querySelector('#panelStart .chapters-grid');
        if (!grid || !window.StoryDB) return;
        const lang = document.documentElement.lang === 'en' ? 'en' : 'ru';
        grid.querySelectorAll('button').forEach((b, i) => {
            b.classList.remove('locked');
            b.classList.add('ch-btn-ready');
            b.dataset.ch = String(i + 1);
            b.style.justifyContent = 'center';
            b.style.textAlign = 'center';
            b.querySelector('.lock-icon')?.remove();
            b.querySelector('.coming-soon')?.remove();
            const sp = b.querySelector('span');
            if (sp && window.StoryDB.titles[lang]) {
                sp.textContent = window.StoryDB.titles[lang][i];
            }
        });
    }
    window.syncChapterTitles = syncTitles;

    window.addEventListener('load', () => {
        syncTitles();
        document.getElementById('btnStart')?.addEventListener('click', () => setTimeout(syncTitles, 20));
    });

    document.addEventListener('click', (e) => {
        const b = e.target.closest('.ch-btn-ready');
        if (!b) return;
        const ch = Number(b.dataset.ch);
        if (ch < 2) return;
        e.stopImmediatePropagation();
        document.querySelectorAll('.side-panel.visible').forEach(p => {
            p.classList.remove('visible');
            p.classList.add('hidden');
        });
        document.getElementById('mainButtonsList')?.classList.remove('has-active');
        document.getElementById('menuContent')?.classList.remove('shifted');
        const mm = document.getElementById('mainMenu');
        mm.classList.remove('visible');
        setTimeout(() => {
            mm.classList.add('hidden');
            window.triggerLoading(() => launchCh(ch));
        }, 500);
    }, true);
    function openNativeMess() {
        const w = window.ensureMessengerWindow ? window.ensureMessengerWindow() : document.getElementById('windowMessenger');
        if (!w) return;
        const isMom = document.body.classList.contains('theme-mom');
        const sidebar = document.getElementById('messSidebar');
        const sidebarHeader = document.getElementById('messSidebarHeader');
        if (sidebar) sidebar.style.borderRightColor = isMom ? 'rgba(255,102,178,0.25)' : 'rgba(0,255,102,0.25)';
        if (sidebarHeader) {
            sidebarHeader.style.borderBottomColor = isMom ? 'rgba(255,102,178,0.2)' : 'rgba(0,255,102,0.2)';
            sidebarHeader.style.color = isMom ? '#ff66b2' : '#00ff66';
        }
        w.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(w);
        renderNativeMess();
    }

    function renderNativeMess() {
        const l = document.getElementById('messUserList');
        const a = document.getElementById('messChatZone');
        if (!l || !a) return;
        const isMom = document.body.classList.contains('theme-mom');
        const accent = isMom ? '#ff66b2' : '#00ff66';
        l.innerHTML = '';

        Object.keys(chats).forEach(k => {
            const c = chats[k];
            if (c.hide) return;
            const it = document.createElement('div');
            it.className = 'chat-item' + (chatId === k ? ' active' : '');
            const itemColor = c.red ? '#ff3333' : accent;
            it.style.cssText = `padding:8px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;gap:6px;color:${itemColor};${chatId === k ? 'background:rgba(255,255,255,0.08);' : ''}`;
            const last = c.m[c.m.length - 1];
            it.innerHTML = `
                <div style="overflow:hidden;flex:1;">
                    <div style="font-weight:bold;font-size:0.8rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${c.av || '💬'} ${c.t}</div>
                    <div style="font-size:0.68rem;opacity:0.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px;">${last ? last.text : ''}</div>
                </div>
                ${c.u ? `<div style="background:${itemColor};color:#000;font-size:0.68rem;padding:2px 5px;font-weight:bold;flex-shrink:0;">${c.u}</div>` : ''}
            `;
            it.onclick = () => {
                chatId = k;
                c.u = 0;
                if (c.onRead) {
                    const cb = c.onRead;
                    c.onRead = null;
                    cb();
                }
                renderNativeMess();
            };
            l.appendChild(it);
        });

        if (!chatId || !chats[chatId]) {
            a.innerHTML = `<div style="color:${accent};opacity:0.55;text-align:center;margin:auto;font-size:0.8rem;padding:12px;">Выберите диалог слева</div>`;
            return;
        }

        const cur = chats[chatId];
        const curColor = cur.red ? '#ff3333' : accent;
        a.innerHTML = `
            <div style="padding:6px 10px;border-bottom:1px solid ${curColor};display:flex;justify-content:space-between;align-items:center;background:rgba(15,0,10,0.65);flex-shrink:0;color:${curColor};">
                <div style="font-weight:bold;font-size:0.84rem;">${cur.av || '💬'} ${cur.t}</div>
                <button id="btnStoryMessBack" style="background:transparent;border:1px solid ${curColor};color:${curColor};padding:2px 8px;font-family:Russo One,sans-serif;font-size:0.68rem;cursor:pointer;">Назад</button>
            </div>
            <div id="nativeLogs" style="flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:8px;"></div>
            <div id="nativeOpts" style="padding:6px 8px;display:flex;flex-direction:column;gap:5px;border-top:1px solid rgba(255,255,255,0.12);background:rgba(0,0,0,0.85);flex-shrink:0;max-height:46%;overflow-y:auto;"></div>
        `;
        document.getElementById('btnStoryMessBack').onclick = () => {
            chatId = null;
            renderNativeMess();
        };

        const lb = document.getElementById('nativeLogs');
        const ob = document.getElementById('nativeOpts');

        cur.m.forEach(msg => {
            const d = document.createElement('div');
            d.style.cssText = `max-width:86%;padding:6px 10px;font-size:0.78rem;line-height:1.35;border:1px solid ${curColor};background:${msg.out ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.65)'};color:${curColor};align-self:${msg.out ? 'flex-end' : 'flex-start'};`;
            d.innerHTML = `<div style="font-weight:bold;font-size:0.7rem;opacity:0.85;margin-bottom:2px;">${msg.who}</div><div>${msg.text} ${msg.fn ? '<span class="article-link" id="natLnk">*ссылка*</span>' : ''}</div><div style="text-align:right;font-size:0.62rem;opacity:0.65;margin-top:3px;">${msg.tm}</div>`;
            lb.appendChild(d);
            if (msg.fn) d.querySelector('#natLnk').onclick = msg.fn;
        });
        lb.scrollTop = lb.scrollHeight;

        cur.o.forEach(opt => {
            const b = document.createElement('button');
            b.style.cssText = `background:transparent;border:1px solid ${curColor};color:${curColor};padding:6px 8px;text-align:left;cursor:pointer;font-family:Russo One,sans-serif;font-size:0.74rem;line-height:1.25;`;
            b.textContent = opt.l;
            b.onclick = opt.f;
            ob.appendChild(b);
        });
    }

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
        resetAllStoryState();
        if (window.stopChapterOneState) window.stopChapterOneState();
        activeCh = ch;
        browserUnlockedByDevil = (ch !== 2);
        document.querySelectorAll('.desktop-window').forEach(w => w.classList.add('hidden'));
        const env = document.getElementById('desktopEnv');
        env.style.display = 'flex';
        env.style.filter = 'none';
        env.classList.remove('hidden');
        setTimeout(() => env.classList.add('visible'), 40);

        if (window.AppConfig) {
            window.AppConfig.state.positions = {};
            window.AppConfig.state.trashContents = [];
            window.AppConfig.allApps.browser = { id: 'browser', nameRu: 'Браузер', nameEn: 'Browser', icon: '🌐', type: 'system' };
            window.AppConfig.allApps.slides = { id: 'slides', nameRu: 'Проект.ppt', nameEn: 'Project.ppt', icon: '📊', type: 'system' };
            window.AppConfig.allApps.reports = { id: 'reports', nameRu: 'Отчеты', nameEn: 'Reports', icon: '📑', type: 'system' };
            window.AppConfig.allApps.secret_file = { id: 'secret_file', nameRu: 'Файл_вйА.dat', nameEn: 'File_vIA.dat', icon: '☣️', type: 'system' };
        }
        if (window.ensureMessengerWindow) window.ensureMessengerWindow();
        if (window.YandexModule) window.YandexModule.startGameplay();

        if (ch === 2 && window.initChapterTwo) window.initChapterTwo();
        if (ch === 3 && window.initChapterThree) window.initChapterThree();
        if (ch === 4 && window.initChapterFour) window.initChapterFour();
        if (ch === 5 && window.initChapterFive) window.initChapterFive();
        if (window.renderDesktopIcons) window.renderDesktopIcons();
    }
    window.launchStoryChapter = launchCh;
})();
