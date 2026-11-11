(function() {
    const desktopEnv = document.getElementById('desktopEnv');
    const mainMenu = document.getElementById('mainMenu');
    const taskbarClock = document.getElementById('taskbarClock');
    const btnDesktopSettings = document.getElementById('btnDesktopSettings');
    const btnDesktopExit = document.getElementById('btnDesktopExit');
    
    const settingsWindow = document.getElementById('desktopSettingsWindow');
    const btnCloseSettings = document.getElementById('btnCloseDesktopSettings');
    const btnClearData = document.getElementById('btnDesktopClearData');

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

    btnDesktopSettings.addEventListener('click', () => {
        settingsWindow.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(settingsWindow);
        if (window.syncSettingsUI) window.syncSettingsUI();
    });

    btnCloseSettings.addEventListener('click', () => {
        settingsWindow.classList.add('hidden');
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
