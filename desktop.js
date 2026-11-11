(function() {
    const desktopEnv = document.getElementById('desktopEnv');
    const mainMenu = document.getElementById('mainMenu');
    const taskbarClock = document.getElementById('taskbarClock');
    const btnDesktopSettings = document.getElementById('btnDesktopSettings');
    const btnDesktopExit = document.getElementById('btnDesktopExit');
    
    const settingsWindow = document.getElementById('desktopSettingsWindow');
    const btnCloseSettings = document.getElementById('btnCloseDesktopSettings');
    const btnClearData = document.getElementById('btnDesktopClearData');

    const deskGfxPrev = document.getElementById('deskGfxPrev');
    const deskGfxNext = document.getElementById('deskGfxNext');
    const deskLangPrev = document.getElementById('deskLangPrev');
    const deskLangNext = document.getElementById('deskLangNext');

    const gfxLevels = ['low', 'medium', 'high'];
    const langList = ['en', 'ru'];

    let clockInterval = null;

    window.startClock = function() {
        if (clockInterval) clearInterval(clockInterval);
        const update = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            if (taskbarClock) taskbarClock.textContent = `${hours}:${minutes}:${seconds}`;
        };
        update();
        clockInterval = setInterval(update, 1000);
    };

    function getCurrentGfx() {
        if (document.body.classList.contains('gfx-low')) return 'low';
        if (document.body.classList.contains('gfx-medium')) return 'medium';
        return 'high';
    }

    btnDesktopSettings.addEventListener('click', () => {
        settingsWindow.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(settingsWindow);
        if (window.syncSettingsUI) window.syncSettingsUI();
    });

    btnCloseSettings.addEventListener('click', () => {
        settingsWindow.classList.add('hidden');
    });

    deskGfxPrev.addEventListener('click', () => {
        const idx = gfxLevels.indexOf(getCurrentGfx());
        if (idx > 0 && window.updateGraphics) {
            window.updateGraphics(gfxLevels[idx - 1]);
        }
    });

    deskGfxNext.addEventListener('click', () => {
        const idx = gfxLevels.indexOf(getCurrentGfx());
        if (idx < gfxLevels.length - 1 && window.updateGraphics) {
            window.updateGraphics(gfxLevels[idx + 1]);
        }
    });

    deskLangPrev.addEventListener('click', () => {
        const currentLang = document.documentElement.lang || 'ru';
        const idx = langList.indexOf(currentLang);
        if (idx > 0 && window.switchLanguage) {
            window.switchLanguage(langList[idx - 1]);
        }
    });

    deskLangNext.addEventListener('click', () => {
        const currentLang = document.documentElement.lang || 'ru';
        const idx = langList.indexOf(currentLang);
        if (idx < langList.length - 1 && window.switchLanguage) {
            window.switchLanguage(langList[idx + 1]);
        }
    });

    btnClearData.addEventListener('click', () => {
        if (window.AppConfig && window.AppConfig.resetToDesktopDefault) {
            window.AppConfig.resetToDesktopDefault();
        }
        settingsWindow.classList.add('hidden');
        document.querySelectorAll('.desktop-window').forEach(win => win.classList.add('hidden'));
        if (window.renderDesktopIcons) window.renderDesktopIcons();
        if (window.renderExplorerContents) window.renderExplorerContents();
    });

    btnDesktopExit.addEventListener('click', () => {
        settingsWindow.classList.add('hidden');
        if (window.YandexModule) {
            window.YandexModule.stopGameplay();
        }
        desktopEnv.classList.remove('visible');
        setTimeout(() => {
            desktopEnv.classList.add('hidden');
            const exitToMenu = () => {
                if (window.triggerLoading) {
                    window.triggerLoading(() => {
                        mainMenu.classList.remove('hidden');
                        setTimeout(() => {
                            mainMenu.classList.add('visible');
                        }, 50);
                    });
                }
            };
            if (window.YandexModule) {
                window.YandexModule.showAd(exitToMenu);
            } else {
                exitToMenu();
            }
        }, 1000);
    });
})();
