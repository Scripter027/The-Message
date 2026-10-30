(function() {
    const desktopEnv = document.getElementById('desktopEnv');
    const mainMenu = document.getElementById('mainMenu');
    const taskbarClock = document.getElementById('taskbarClock');
    const btnDesktopSettings = document.getElementById('btnDesktopSettings');
    const btnDesktopExit = document.getElementById('btnDesktopExit');

    window.startClock = function() {
        setInterval(() => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            taskbarClock.textContent = `${hours}:${minutes}:${seconds}`;
        }, 1000);
    };

    btnDesktopSettings.addEventListener('click', () => {
        if (window.setSettingsContext && window.getSettingsPanel && window.openGlobalPanel) {
            window.setSettingsContext('desktop');
            const panel = window.getSettingsPanel();
            panel.style.zIndex = "8";
            window.openGlobalPanel(null, panel);
        }
    });

    btnDesktopExit.addEventListener('click', () => {
        desktopEnv.classList.remove('visible');
        setTimeout(() => {
            desktopEnv.classList.add('hidden');
            if (window.triggerLoading) {
                window.triggerLoading(() => {
                    mainMenu.classList.remove('hidden');
                    setTimeout(() => mainMenu.classList.add('visible'), 50);
                });
            }
        }, 1000);
    });
})();
