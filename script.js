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
        ch1: 'Глава 1: "Динозаврик и Ссылка"',
        ch2: "Глава 2",
        ch3: "Глава 3",
        ch4: "Глава 4",
        ch5: "Глава 5",
        soon: "скоро",
        loading: "ЗАГРУЗКА...",
        exit: "Выход",
        credits: "Титры",
        news: "Новости",
        credits_soon: "Титров пока нет ;)",
        news_text: "Разработка игры «The Message» идет полным ходом!"
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
        ch1: 'Chapter 1: "Dino and Link"',
        ch2: "Chapter 2",
        ch3: "Chapter 3",
        ch4: "Chapter 4",
        ch5: "Chapter 5",
        soon: "soon",
        loading: "LOADING...",
        exit: "Exit",
        credits: "Credits",
        news: "News",
        credits_soon: "No credits yet ;)",
        news_text: "Development of «The Message» is in full swing!"
    }
};

const gfxLevels = ['low', 'medium', 'high'];
const gfxLangKeys = { low: 'graphics_low', medium: 'graphics_med', high: 'graphics_high' };
const langOrder = ['en', 'ru'];

let currentGfxIndex = 2;
let currentLangIndex = 1;
let currentVideoIndex = 0;
let isGameStarted = false;
let settingsContext = 'menu';

const videoContainer = document.getElementById('videoContainer');
const videoElement = document.getElementById('introVideo');
const mainMenu = document.getElementById('mainMenu');
const startPrompt = document.getElementById('startPrompt');
const creditsOverlay = document.getElementById('creditsOverlay');
const creditsText = document.getElementById('creditsText');

const menuContent = document.getElementById('menuContent');
const mainButtonsList = document.getElementById('mainButtonsList');
const panelSettings = document.getElementById('panelSettings');
const panelStart = document.getElementById('panelStart');

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
            try { window.startClock(); } catch(e){}
        }
    }, 500);
}

function playNextVideo() {
    if (currentVideoIndex < videos.length) {
        videoElement.pause();
        videoElement.src = videos[currentVideoIndex];
        videoElement.muted = false;
        
        const onCanPlay = () => {
            videoElement.play().catch(() => {
                videoElement.muted = true;
                videoElement.play().catch(() => {
                    transitionToMenu();
                });
            });
        };
        
        videoElement.oncanplaythrough = onCanPlay;
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
    currentVideoIndex = 999;
    videoElement.pause();
    videoElement.src = '';
    videoContainer.style.transition = 'opacity 1.0s ease';
    videoContainer.style.opacity = '0';
    setTimeout(() => {
        videoContainer.style.display = 'none';
        mainMenu.classList.remove('hidden');
        setTimeout(() => {
            mainMenu.classList.add('visible');
            unlockFirstChapterButton();
            syncSettingsUI();
            if (window.YandexModule) {
                window.YandexModule.gameReady();
            }
        }, 50);
    }, 1000);
}

function unlockFirstChapterButton() {
    const grid = panelStart.querySelector(".chapters-grid");
    if (!grid) return;
    const firstBtn = grid.querySelector("button");
    if (firstBtn) {
        firstBtn.classList.remove("locked");
        firstBtn.classList.add("chapter-btn-active");
        firstBtn.style.justifyContent = "center";
        firstBtn.style.textAlign = "center";
        const lockIcon = firstBtn.querySelector(".lock-icon");
        const comingSoon = firstBtn.querySelector(".coming-soon");
        if (lockIcon) lockIcon.remove();
        if (comingSoon) comingSoon.remove();
    }
}
function openPanel(clickedButton, targetPanel) {
    if (settingsContext === 'menu') {
        mainButtonsList.classList.add('has-active');
        if (clickedButton) clickedButton.classList.add('clicked');
        menuContent.classList.add('shifted');
    }
    syncSettingsUI();
    targetPanel.classList.remove('hidden');
    setTimeout(() => targetPanel.classList.add('visible'), 50);
}

function closeAllPanels() {
    mainButtonsList.classList.remove('has-active');
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('clicked'));
    menuContent.classList.remove('shifted');
    
    const openPanels = document.querySelectorAll('.side-panel.visible');
    openPanels.forEach(panel => {
        panel.classList.remove('visible');
        setTimeout(() => {
            if (!panel.classList.contains('visible')) {
                panel.classList.add('hidden');
            }
        }, 450);
    });
}

function syncSettingsUI() {
    const lang = langOrder[currentLangIndex] || 'ru';
    const gfx = gfxLevels[currentGfxIndex] || 'high';
    const gfxText = translations[lang][gfxLangKeys[gfx]];
    const langText = lang === 'ru' ? 'Русский' : 'English';

    ['menuGfxValue', 'desktopGfxValue'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = gfxText;
    });

    ['menuLangValue', 'desktopLangValue'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = langText;
    });

    ['menuGfxPrev', 'desktopGfxPrev'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = currentGfxIndex <= 0;
    });

    ['menuGfxNext', 'desktopGfxNext'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = currentGfxIndex >= gfxLevels.length - 1;
    });

    ['menuLangPrev', 'desktopLangPrev'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = currentLangIndex <= 0;
    });

    ['menuLangNext', 'desktopLangNext'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = currentLangIndex >= langOrder.length - 1;
    });
}

function switchLanguage(lang) {
    const idx = langOrder.indexOf(lang);
    if (idx !== -1) currentLangIndex = idx;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    syncSettingsUI();
}

function updateGraphics(level) {
    const idx = gfxLevels.indexOf(level);
    if (idx !== -1) currentGfxIndex = idx;
    document.body.classList.remove('gfx-low', 'gfx-medium', 'gfx-high');
    document.body.classList.add('gfx-' + level);
    syncSettingsUI();
}

function launchChapterOneProcess() {
    if (window.AppConfig) {
        window.AppConfig.setupChapterOneMode();
    }
    mainMenu.classList.remove('visible');
    setTimeout(() => {
        mainMenu.classList.add('hidden');
        const startChapter = () => {
            if (window.triggerLoading) {
                window.triggerLoading(() => {
                    const desktopEnv = document.getElementById('desktopEnv');
                    desktopEnv.style.display = 'flex';
                    desktopEnv.style.filter = 'none';
                    desktopEnv.classList.remove('hidden');
                    setTimeout(() => {
                        desktopEnv.classList.add('visible');
                        if (window.YandexModule) {
                            window.YandexModule.startGameplay();
                        }
                        if (window.initChapterOne) {
                            window.initChapterOne();
                        }
                    }, 50);
                });
            }
        };
        if (window.YandexModule) {
            window.YandexModule.showAd(startChapter);
        } else {
            startChapter();
        }
    }, 1000);
}

function showOverlayMessage(textKey) {
    const lang = document.documentElement.lang || 'ru';
    if (creditsText && translations[lang] && translations[lang][textKey]) {
        creditsText.textContent = translations[lang][textKey];
    }
    creditsOverlay.classList.remove('hidden');
    setTimeout(() => creditsOverlay.classList.add('visible'), 50);
    setTimeout(() => {
        creditsOverlay.classList.remove('visible');
        setTimeout(() => creditsOverlay.classList.add('hidden'), 500);
    }, 3000);
}

document.addEventListener('click', function(e) {
    const target = e.target;
    const btn = target.closest("button");
    
    if (target === startPrompt || startPrompt.contains(target)) {
        initGameLaunch();
        return;
    }

    if (btn && (btn.id === 'menuGfxPrev' || btn.id === 'desktopGfxPrev')) {
        if (currentGfxIndex > 0) updateGraphics(gfxLevels[currentGfxIndex - 1]);
        return;
    }

    if (btn && (btn.id === 'menuGfxNext' || btn.id === 'desktopGfxNext')) {
        if (currentGfxIndex < gfxLevels.length - 1) updateGraphics(gfxLevels[currentGfxIndex + 1]);
        return;
    }

    if (btn && (btn.id === 'menuLangPrev' || btn.id === 'desktopLangPrev')) {
        if (currentLangIndex > 0) switchLanguage(langOrder[currentLangIndex - 1]);
        return;
    }

    if (btn && (btn.id === 'menuLangNext' || btn.id === 'desktopLangNext')) {
        if (currentLangIndex < langOrder.length - 1) switchLanguage(langOrder[currentLangIndex + 1]);
        return;
    }
    
    if (btn && btn.id === 'btnSettings') {
        settingsContext = 'menu';
        openPanel(btn, panelSettings);
        return;
    }
    
    if (btn && btn.id === 'btnStart') {
        settingsContext = 'menu';
        openPanel(btn, panelStart);
        return;
    }
    
    if (btn && btn.classList.contains('chapter-btn-active')) {
        closeAllPanels();
        launchChapterOneProcess();
        return;
    }
    
    if (btn && btn.id === 'btnCredits') {
        showOverlayMessage('credits_soon');
        return;
    }
    
    if (btn && btn.id === 'btnFree') {
        if (window.AppConfig) {
            window.AppConfig.resetToDesktopDefault();
        }
        mainMenu.classList.remove('visible');
        setTimeout(() => {
            mainMenu.classList.add('hidden');
            const startFreePlay = () => {
                if (window.triggerLoading) {
                    window.triggerLoading(() => {
                        const desktopEnv = document.getElementById('desktopEnv');
                        desktopEnv.style.display = 'flex';
                        desktopEnv.style.filter = 'none';
                        desktopEnv.classList.remove('hidden');
                        setTimeout(() => {
                            desktopEnv.classList.add('visible');
                            if (window.renderDesktopIcons) {
                                window.renderDesktopIcons();
                            }
                            if (window.YandexModule) {
                                window.YandexModule.startGameplay();
                            }
                        }, 50);
                    });
                }
            };
            if (window.YandexModule) {
                window.YandexModule.showAd(startFreePlay);
            } else {
                startFreePlay();
            }
        }, 1000);
        return;
    }
    
    if (btn && btn.classList.contains('back-btn')) {
        closeAllPanels();
        return;
    }
    
    if (btn && btn.id === 'btnClearData') {
        if (window.AppConfig) {
            window.AppConfig.resetToDesktopDefault();
        }
        localStorage.removeItem('kpr_dino_highscore');
        showOverlayMessage('clear_data');
        return;
    }
    
    if (btn && btn.id === 'btnNews') {
        showOverlayMessage('news_text');
        return;
    }
});

videoElement.addEventListener('ended', playNextVideo);

window.addEventListener('keydown', function onAnyKeyStart(e) {
    if (isGameStarted) {
        window.removeEventListener('keydown', onAnyKeyStart);
        return;
    }
    if (e.ctrlKey || e.key === 'Control' || e.code === 'F5' || e.key === 'F5' || e.altKey || e.metaKey || e.key === 'Shift') {
        return;
    }
    e.preventDefault();
    window.removeEventListener('keydown', onAnyKeyStart);
    initGameLaunch();
});

window.switchLanguage = switchLanguage;
window.updateGraphics = updateGraphics;
window.syncSettingsUI = syncSettingsUI;
