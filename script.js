const videos = [
    'company_disclaimer.mp4',
    'title_intro.mp4'
];

const translations = {
    ru: {
        prompt: "НАЖМИТЕ НА ЭКРАН ДЛЯ СТАРТА",
        start: "Начать игру",
        free: "Свободная игра",
        settings: "Настройки",
        settings_title: "Настройки",
        graphics: "Графика:",
        graphics_low: "Низкая",
        graphics_med: "Средняя",
        graphics_high: "Высокая",
        language: "Язык:",
        clear_data: "Стереть все данные",
        back: "Назад",
        chapters_title: "Главы",
        ch1: "Глава 1",
        ch2: "Глава 2",
        ch3: "Глава 3",
        ch4: "Глава 4",
        ch5: "Глава 5",
        soon: "скоро",
        loading: "ЗАГРУЗКА...",
        exit: "Выход"
    },
    en: {
        prompt: "CLICK ON SCREEN TO START",
        start: "Start Game",
        free: "Free Play",
        settings: "Settings",
        settings_title: "Settings",
        graphics: "Graphics:",
        graphics_low: "Low",
        graphics_med: "Medium",
        graphics_high: "High",
        language: "Language:",
        clear_data: "Wipe all data",
        back: "Back",
        chapters_title: "Chapters",
        ch1: "Chapter 1",
        ch2: "Chapter 2",
        ch3: "Chapter 3",
        ch4: "Chapter 4",
        ch5: "Chapter 5",
        soon: "soon",
        loading: "LOADING...",
        exit: "Exit"
    }
};

let currentVideoIndex = 0;
let isGameStarted = false;
let settingsContext = 'menu';

const videoContainer = document.getElementById('videoContainer');
const videoElement = document.getElementById('introVideo');
const mainMenu = document.getElementById('mainMenu');
const startPrompt = document.getElementById('startPrompt');

const menuContent = document.getElementById('menuContent');
const mainButtonsList = document.getElementById('mainButtonsList');
const btnStart = document.getElementById('btnStart');
const btnFree = document.getElementById('btnFree');
const btnSettings = document.getElementById('btnSettings');

const panelSettings = document.getElementById('panelSettings');
const panelStart = document.getElementById('panelStart');
const btnClearData = document.getElementById('btnClearData');
const langRu = document.getElementById('langRu');
const langEn = document.getElementById('langEn');

function initGameLaunch() {
    if (isGameStarted) return;
    isGameStarted = true;
    startPrompt.classList.add('fade-out');
    setTimeout(() => {
        startPrompt.style.display = 'none';
        playNextVideo();
        setupSkipListeners();
        updateGraphics('high');
        if (window.startClock) {
            window.startClock();
        }
    }, 500);
}

function playNextVideo() {
    if (currentVideoIndex < videos.length) {
        videoElement.pause();
        videoElement.removeAttribute('src');
        videoElement.load();
        videoElement.src = videos[currentVideoIndex];
        videoElement.load();
        videoElement.muted = false;
        const onCanPlay = () => {
            let playPromise = videoElement.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    videoElement.muted = true;
                    videoElement.play().catch(() => {
                        transitionToMenu();
                    });
                });
            }
            videoElement.removeEventListener('canplaythrough', onCanPlay);
        };
        videoElement.addEventListener('canplaythrough', onCanPlay);
        currentVideoIndex++;
    } else {
        transitionToMenu();
    }
}

function skipCurrentVideo() {
    if (!isGameStarted || videoContainer.style.display === 'none') return;
    playNextVideo();
}

function setupSkipListeners() {
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            skipCurrentVideo();
        }
    });
    videoContainer.addEventListener('click', (e) => {
        if (e.target !== startPrompt && !startPrompt.contains(e.target)) {
            skipCurrentVideo();
        }
    });
}

function transitionToMenu() {
    videoElement.pause();
    videoContainer.style.transition = 'opacity 1.0s ease';
    videoContainer.style.opacity = '0';
    setTimeout(() => {
        videoContainer.style.display = 'none';
        mainMenu.classList.remove('hidden');
        setTimeout(() => mainMenu.classList.add('visible'), 50);
    }, 1000);
}

function openPanel(clickedButton, targetPanel) {
    if (settingsContext === 'menu') {
        mainButtonsList.classList.add('has-active');
        if (clickedButton) clickedButton.classList.add('clicked');
        menuContent.classList.add('shifted');
    }
    targetPanel.classList.remove('hidden');
    setTimeout(() => targetPanel.classList.add('visible'), 50);
}

function closeAllPanels() {
    if (settingsContext === 'menu') {
        mainButtonsList.classList.remove('has-active');
        document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('clicked'));
        menuContent.classList.remove('shifted');
    }
    const openPanels = document.querySelectorAll('.side-panel.visible');
    openPanels.forEach(panel => {
        panel.classList.remove('visible');
        setTimeout(() => {
            if (!panel.classList.contains('visible')) {
                panel.classList.add('hidden');
            }
        }, 800);
    });
}

function switchLanguage(lang) {
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
}

function updateGraphics(level) {
    document.body.classList.remove('gfx-low', 'gfx-medium', 'gfx-high');
    if (level === 'low') document.body.classList.add('gfx-low');
    if (level === 'medium') document.body.classList.add('gfx-medium');
    if (level === 'high') document.body.classList.add('gfx-high');
}

btnSettings.addEventListener('click', () => {
    settingsContext = 'menu';
    panelSettings.style.zIndex = "4";
    openPanel(btnSettings, panelSettings);
});

btnStart.addEventListener('click', () => {
    settingsContext = 'menu';
    openPanel(btnStart, panelStart);
});

btnFree.addEventListener('click', () => {
    mainMenu.classList.remove('visible');
    setTimeout(() => {
        mainMenu.classList.add('hidden');
        if (window.triggerLoading) {
            window.triggerLoading(() => {
                const desktopEnv = document.getElementById('desktopEnv');
                desktopEnv.classList.remove('hidden');
                setTimeout(() => desktopEnv.classList.add('visible'), 50);
            });
        } else {
            const desktopEnv = document.getElementById('desktopEnv');
            desktopEnv.classList.remove('hidden');
            desktopEnv.classList.add('visible');
        }
    }, 1000);
});

document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllPanels();
    });
});

document.querySelectorAll('.setting-options .select-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const siblings = this.parentElement.querySelectorAll('.select-btn');
        siblings.forEach(s => s.classList.remove('active'));
        this.classList.add('active');
        const text = this.getAttribute('data-lang') || this.textContent.toLowerCase();
        if (text.includes('low') || text.includes('низк')) updateGraphics('low');
        if (text.includes('med') || text.includes('сред')) updateGraphics('medium');
        if (text.includes('high') || text.includes('выс')) updateGraphics('high');
    });
});

langRu.addEventListener('click', () => switchLanguage('ru'));
langEn.addEventListener('click', () => switchLanguage('en'));
btnClearData.addEventListener('click', () => location.reload());

videoElement.addEventListener('ended', playNextVideo);
startPrompt.addEventListener('click', initGameLaunch);
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
        initGameLaunch();
    }
}, { once: true });

window.setSettingsContext = function(context) {
    settingsContext = context;
};
window.getSettingsPanel = function() {
    return panelSettings;
};
window.openGlobalPanel = function(btn, panel) {
    openPanel(btn, panel);
};
