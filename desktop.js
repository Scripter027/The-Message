(function() {
    const desktopEnv = document.getElementById('desktopEnv');
    const mainMenu = document.getElementById('mainMenu');
    const taskbarClock = document.getElementById('taskbarClock');
    const btnDesktopSettings = document.getElementById('btnDesktopSettings');
    const btnDesktopExit = document.getElementById('btnDesktopExit');
    
    const settingsWindow = document.getElementById('desktopSettingsWindow');
    const btnCloseSettings = document.getElementById('btnCloseDesktopSettings');
    const btnClearData = document.getElementById('btnDesktopClearData');
    const langRu = document.getElementById('desktopLangRu');
    const langEn = document.getElementById('desktopLangEn');

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
        settingsWindow.classList.remove('hidden');
        syncActiveStates();
    });

    btnCloseSettings.addEventListener('click', () => {
        settingsWindow.classList.add('hidden');
    });

    function syncActiveStates() {
        const currentGfx = document.body.classList.contains('gfx-low') ? 'low' : 
                           document.body.classList.contains('gfx-medium') ? 'medium' : 'high';
        
        settingsWindow.querySelectorAll('[data-gfx]').forEach(btn => {
            if (btn.getAttribute('data-gfx') === currentGfx) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    settingsWindow.addEventListener('click', function(e) {
        const target = e.target;
        
        if (target.hasAttribute('data-gfx')) {
            const siblings = target.parentElement.querySelectorAll('.select-btn');
            siblings.forEach(s => s.classList.remove('active'));
            target.classList.add('active');
            
            const level = target.getAttribute('data-gfx');
            document.body.classList.remove('gfx-low', 'gfx-medium', 'gfx-high');
            document.body.classList.add('gfx-' + level);
            
            const menuGfxBtn = document.querySelector(`#panelSettings [data-lang="graphics_${level}"]`);
            if (menuGfxBtn) {
                const menuSiblings = menuGfxBtn.parentElement.querySelectorAll('.select-btn');
                menuSiblings.forEach(s => s.classList.remove('active'));
                menuGfxBtn.classList.add('active');
            }
        }
    });

    langRu.addEventListener('click', () => {
        if (window.switchLanguage) window.switchLanguage('ru');
    });

    langEn.addEventListener('click', () => {
        if (window.switchLanguage) window.switchLanguage('en');
    });

    btnClearData.addEventListener('click', () => {
        location.reload();
    });

    btnDesktopExit.addEventListener('click', () => {
        settingsWindow.classList.add('hidden');
        desktopEnv.classList.remove('visible');
        setTimeout(() => {
            desktopEnv.classList.add('hidden');
            if (window.triggerLoading) {
                window.triggerLoading(() => {
                    mainMenu.classList.remove('hidden');
                    setTimeout(() => {
                        mainMenu.classList.add('visible');
                    }, 50);
                });
            }
        }, 1000);
    });
})();
