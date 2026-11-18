const videos = [
    'company_disclaimer.mp4',
    'title_intro.mp4'
];

const translations = {
    ru: {
        prompt: "НАЖМИТЕ НА ЭКРАН ДЛЯ СТАРТА",
        continue: "Продолжить",
        start: "Главы",
        free: "Свободная игра",
        settings: "Настройки",
        settings_title: "Настройки",
        graphics: "Графика:",
        graphics_low: "Низкая",
        graphics_med: "Средняя",
        graphics_high: "Высокая",
        language: "Язык:",
        sound: "Звуки:",
        vibration: "Вибрация:",
        text_speed: "Текст:",
        crt_lines: "Полосы ЭЛТ:",
        brightness: "Яркость:",
        on: "Вкл",
        off: "Выкл",
        speed_slow: "Медленно",
        speed_norm: "Норма",
        speed_fast: "Быстро",
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
        credits_soon: "Титров пока нет ;)"
    },
    en: {
        prompt: "CLICK ON SCREEN TO START",
        continue: "Continue",
        start: "Chapters",
        free: "Free Play",
        settings: "Settings",
        settings_title: "Settings",
        graphics: "Graphics:",
        graphics_low: "Low",
        graphics_med: "Medium",
        graphics_high: "High",
        language: "Language:",
        sound: "Sound:",
        vibration: "Vibration:",
        text_speed: "Text Speed:",
        crt_lines: "CRT Lines:",
        brightness: "Brightness:",
        on: "On",
        off: "Off",
        speed_slow: "Slow",
        speed_norm: "Normal",
        speed_fast: "Fast",
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
        credits_soon: "No credits yet ;)"
    }
};

const gfxLevels = ['low', 'medium', 'high'];
const gfxLangKeys = { low: 'graphics_low', medium: 'graphics_med', high: 'graphics_high' };
const langOrder = ['en', 'ru'];
const speedLevels = ['slow', 'normal', 'fast'];
const speedLangKeys = { slow: 'speed_slow', normal: 'speed_norm', fast: 'speed_fast' };
const brightLevels = [0.75, 0.9, 1.0, 1.15, 1.3];

const savedPrefs = (() => {
    try {
        return JSON.parse(localStorage.getItem('kpr_user_prefs') || '{}');
    } catch (e) {
        return {};
    }
})();

let currentGfxIndex = typeof savedPrefs.gfx === 'number' ? savedPrefs.gfx : 2;
let currentLangIndex = typeof savedPrefs.lang === 'number' ? savedPrefs.lang : 1;
let soundEnabled = savedPrefs.sound !== undefined ? !!savedPrefs.sound : true;
let vibrationEnabled = savedPrefs.vib !== undefined ? !!savedPrefs.vib : true;
let currentSpeedIndex = typeof savedPrefs.speed === 'number' ? savedPrefs.speed : 1;
let crtEnabled = savedPrefs.crt !== undefined ? !!savedPrefs.crt : true;
let currentBrightIndex = typeof savedPrefs.bright === 'number' ? savedPrefs.bright : 2;

let currentVideoIndex = 0;
let isGameStarted = false;
let isIntroFinished = false;
let settingsContext = 'menu';
let audioCtx = null;

window.GamePrefs = {
    isSoundOn: () => soundEnabled,
    isVibOn: () => vibrationEnabled,
    getTextDelay: () => (currentSpeedIndex === 0 ? 42 : currentSpeedIndex === 2 ? 12 : 26),
    getSavedChapter: () => Math.max(1, Math.min(5, parseInt(localStorage.getItem('kpr_saved_chapter') || '1', 10))),
    saveChapterProgress: (ch) => {
        const prev = window.GamePrefs.getSavedChapter();
        if (ch > prev) {
            localStorage.setItem('kpr_saved_chapter', String(Math.min(5, ch)));
        }
        updateContinueButton();
    },
    playTone: (freq = 520, duration = 0.045, type = 'square', vol = 0.04) => {
        if (!soundEnabled) return;
        try {
            if (!audioCtx) {
                const Ctx = window.AudioContext || window.webkitAudioContext;
                if (Ctx) audioCtx = new Ctx();
            }
            if (!audioCtx) return;
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(vol, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {}
    },
    vibrate: (ms = 14) => {
        if (!vibrationEnabled) return;
        if (navigator.vibrate) {
            try { navigator.vibrate(ms); } catch (e) {}
        }
    }
};

function saveUserPrefs() {
    localStorage.setItem('kpr_user_prefs', JSON.stringify({
        gfx: currentGfxIndex,
        lang: currentLangIndex,
        sound: soundEnabled,
        vib: vibrationEnabled,
        speed: currentSpeedIndex,
        crt: crtEnabled,
        bright: currentBrightIndex
    }));
}

function updateContinueButton() {
    const btn = document.getElementById('btnContinue');
    if (!btn) return;
    const savedCh = window.GamePrefs.getSavedChapter();
    const lang = langOrder[currentLangIndex] || 'ru';
    if (savedCh > 1) {
        btn.style.display = 'inline-block';
        btn.textContent = lang === 'ru' ? `Продолжить (Глава ${savedCh})` : `Continue (Ch. ${savedCh})`;
    } else {
        btn.style.display = 'none';
    }
}
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

function applyVisualPrefs() {
    document.body.classList.toggle('no-crt', !crtEnabled);
    const bVal = brightLevels[currentBrightIndex] || 1.0;
    document.documentElement.style.setProperty('--crt-brightness', String(bVal));
}

function initGameLaunch() {
    if (isGameStarted) return;
    isGameStarted = true;
    window.GamePrefs.playTone(620, 0.06);
    window.GamePrefs.vibrate(18);
    startPrompt.classList.add('fade-out');
    setTimeout(() => {
        startPrompt.style.display = 'none';
        playNextVideo();
        setupSkipListeners();
        updateGraphics(gfxLevels[currentGfxIndex] || 'high');
        applyVisualPrefs();
        if (window.startClock) {
            try { window.startClock(); } catch(e){}
        }
    }, 450);
}

function playNextVideo() {
    if (isIntroFinished) return;
    if (currentVideoIndex < videos.length) {
        videoElement.pause();
        videoElement.src = videos[currentVideoIndex];
        videoElement.muted = false;
        currentVideoIndex++;
        
        const onCanPlay = () => {
            videoElement.removeEventListener('canplaythrough', onCanPlay);
            videoElement.play().catch(() => {
                videoElement.muted = true;
                videoElement.play().catch(() => {
                    transitionToMenu();
                });
            });
        };
        
        videoElement.addEventListener('canplaythrough', onCanPlay, { once: true });
        videoElement.onerror = () => {
            playNextVideo();
        };
    } else {
        transitionToMenu();
    }
}

function skipCurrentVideo() {
    if (!isGameStarted || isIntroFinished) return;
    playNextVideo();
}

function setupSkipListeners() {
    const onSkipKey = (e) => {
        if (isIntroFinished) {
            window.removeEventListener('keydown', onSkipKey);
            return;
        }
        if (e.code === 'Space') {
            e.preventDefault();
            skipCurrentVideo();
        }
    };
    window.addEventListener('keydown', onSkipKey);
    videoContainer.addEventListener('click', (e) => {
        if (e.target !== startPrompt && !startPrompt.contains(e.target)) {
            skipCurrentVideo();
        }
    });
}

function transitionToMenu() {
    if (isIntroFinished) return;
    isIntroFinished = true;
    currentVideoIndex = 999;
    videoElement.pause();
    videoElement.removeAttribute('src');
    videoElement.load();
    videoContainer.style.transition = 'opacity 0.8s ease';
    videoContainer.style.opacity = '0';
    setTimeout(() => {
        videoContainer.style.display = 'none';
        mainMenu.classList.remove('hidden');
        setTimeout(() => {
            mainMenu.classList.add('visible');
            unlockFirstChapterButton();
            if (window.syncChapterTitles) window.syncChapterTitles();
            switchLanguage(langOrder[currentLangIndex] || 'ru');
            updateContinueButton();
            if (window.YandexModule) {
                window.YandexModule.gameReady();
            }
        }, 40);
    }, 800);
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
    setTimeout(() => targetPanel.classList.add('visible'), 30);
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
        }, 360);
    });
}

function syncSettingsUI() {
    const lang = langOrder[currentLangIndex] || 'ru';
    const t = translations[lang];
    const gfx = gfxLevels[currentGfxIndex] || 'high';
    const spd = speedLevels[currentSpeedIndex] || 'normal';
    const brightPct = Math.round((brightLevels[currentBrightIndex] || 1.0) * 100) + '%';

    const setVal = (ids, val) => ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    });
    const setDis = (ids, dis) => ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = dis;
    });

    setVal(['menuGfxValue', 'desktopGfxValue'], t[gfxLangKeys[gfx]]);
    setVal(['menuLangValue', 'desktopLangValue'], lang === 'ru' ? 'Русский' : 'English');
    setVal(['menuSoundValue', 'desktopSoundValue'], soundEnabled ? t.on : t.off);
    setVal(['menuVibValue', 'desktopVibValue'], vibrationEnabled ? t.on : t.off);
    setVal(['menuSpeedValue', 'desktopSpeedValue'], t[speedLangKeys[spd]]);
    setVal(['menuCrtValue', 'desktopCrtValue'], crtEnabled ? t.on : t.off);
    setVal(['menuBrightValue', 'desktopBrightValue'], brightPct);

    setDis(['menuGfxPrev', 'desktopGfxPrev'], currentGfxIndex <= 0);
    setDis(['menuGfxNext', 'desktopGfxNext'], currentGfxIndex >= gfxLevels.length - 1);
    setDis(['menuLangPrev', 'desktopLangPrev'], currentLangIndex <= 0);
    setDis(['menuLangNext', 'desktopLangNext'], currentLangIndex >= langOrder.length - 1);
    setDis(['menuSpeedPrev', 'desktopSpeedPrev'], currentSpeedIndex <= 0);
    setDis(['menuSpeedNext', 'desktopSpeedNext'], currentSpeedIndex >= speedLevels.length - 1);
    setDis(['menuBrightPrev', 'desktopBrightPrev'], currentBrightIndex <= 0);
    setDis(['menuBrightNext', 'desktopBrightNext'], currentBrightIndex >= brightLevels.length - 1);
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
    updateContinueButton();
    if (window.syncChapterTitles) window.syncChapterTitles();
    if (window.renderDesktopIcons) window.renderDesktopIcons();
    if (window.renderExplorerContents) window.renderExplorerContents();
    if (window.renderTrashContents) window.renderTrashContents();
    if (window.renderStoreContents) window.renderStoreContents();
    saveUserPrefs();
    syncSettingsUI();
}

function updateGraphics(level) {
    const idx = gfxLevels.indexOf(level);
    if (idx !== -1) currentGfxIndex = idx;
    document.body.classList.remove('gfx-low', 'gfx-medium', 'gfx-high');
    document.body.classList.add('gfx-' + level);
    saveUserPrefs();
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
                        if (window.YandexModule) window.YandexModule.startGameplay();
                        if (window.initChapterOne) window.initChapterOne();
                    }, 40);
                });
            }
        };
        if (window.YandexModule) {
            window.YandexModule.showAd(startChapter);
        } else {
            startChapter();
        }
    }, 700);
}

function showOverlayMessage(textKey) {
    const lang = document.documentElement.lang || 'ru';
    if (creditsText && translations[lang] && translations[lang][textKey]) {
        creditsText.textContent = translations[lang][textKey];
    }
    creditsOverlay.classList.remove('hidden');
    setTimeout(() => creditsOverlay.classList.add('visible'), 40);
    setTimeout(() => {
        creditsOverlay.classList.remove('visible');
        setTimeout(() => creditsOverlay.classList.add('hidden'), 400);
    }, 2500);
}
document.addEventListener('click', function(e) {
    const target = e.target;
    const btn = target.closest("button");
    
    if (target === startPrompt || startPrompt.contains(target)) {
        initGameLaunch();
        return;
    }

    if (!btn) return;
    window.GamePrefs.playTone(btn.classList.contains('back-btn') ? 380 : 540, 0.035);
    window.GamePrefs.vibrate(10);

    const id = btn.id;
    if (id === 'menuGfxPrev' || id === 'desktopGfxPrev') {
        if (currentGfxIndex > 0) updateGraphics(gfxLevels[currentGfxIndex - 1]);
        return;
    }
    if (id === 'menuGfxNext' || id === 'desktopGfxNext') {
        if (currentGfxIndex < gfxLevels.length - 1) updateGraphics(gfxLevels[currentGfxIndex + 1]);
        return;
    }
    if (id === 'menuLangPrev' || id === 'desktopLangPrev') {
        if (currentLangIndex > 0) switchLanguage(langOrder[currentLangIndex - 1]);
        return;
    }
    if (id === 'menuLangNext' || id === 'desktopLangNext') {
        if (currentLangIndex < langOrder.length - 1) switchLanguage(langOrder[currentLangIndex + 1]);
        return;
    }
    if (id === 'menuSoundPrev' || id === 'menuSoundNext' || id === 'desktopSoundPrev' || id === 'desktopSoundNext') {
        soundEnabled = !soundEnabled;
        saveUserPrefs();
        syncSettingsUI();
        return;
    }
    if (id === 'menuVibPrev' || id === 'menuVibNext' || id === 'desktopVibPrev' || id === 'desktopVibNext') {
        vibrationEnabled = !vibrationEnabled;
        if (vibrationEnabled) window.GamePrefs.vibrate(25);
        saveUserPrefs();
        syncSettingsUI();
        return;
    }
    if (id === 'menuSpeedPrev' || id === 'desktopSpeedPrev') {
        if (currentSpeedIndex > 0) { currentSpeedIndex--; saveUserPrefs(); syncSettingsUI(); }
        return;
    }
    if (id === 'menuSpeedNext' || id === 'desktopSpeedNext') {
        if (currentSpeedIndex < speedLevels.length - 1) { currentSpeedIndex++; saveUserPrefs(); syncSettingsUI(); }
        return;
    }
    if (id === 'menuCrtPrev' || id === 'menuCrtNext' || id === 'desktopCrtPrev' || id === 'desktopCrtNext') {
        crtEnabled = !crtEnabled;
        applyVisualPrefs();
        saveUserPrefs();
        syncSettingsUI();
        return;
    }
    if (id === 'menuBrightPrev' || id === 'desktopBrightPrev') {
        if (currentBrightIndex > 0) { currentBrightIndex--; applyVisualPrefs(); saveUserPrefs(); syncSettingsUI(); }
        return;
    }
    if (id === 'menuBrightNext' || id === 'desktopBrightNext') {
        if (currentBrightIndex < brightLevels.length - 1) { currentBrightIndex++; applyVisualPrefs(); saveUserPrefs(); syncSettingsUI(); }
        return;
    }
    if (id === 'btnContinue') {
        const ch = window.GamePrefs.getSavedChapter();
        if (ch >= 2 && window.launchStoryChapter) {
            mainMenu.classList.remove('visible');
            setTimeout(() => {
                mainMenu.classList.add('hidden');
                window.triggerLoading(() => window.launchStoryChapter(ch));
            }, 450);
        } else {
            launchChapterOneProcess();
        }
        return;
    }
    if (id === 'btnSettings') {
        settingsContext = 'menu';
        openPanel(btn, panelSettings);
        return;
    }
    if (id === 'btnStart') {
        settingsContext = 'menu';
        openPanel(btn, panelStart);
        return;
    }
    if (btn.classList.contains('chapter-btn-active')) {
        closeAllPanels();
        launchChapterOneProcess();
        return;
    }
    if (id === 'btnCredits') {
        showOverlayMessage('credits_soon');
        return;
    }
    if (id === 'btnFree') {
        if (window.resetStoryChaptersState) window.resetStoryChaptersState();
        if (window.stopChapterOneState) window.stopChapterOneState();
        if (window.AppConfig) window.AppConfig.load();
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
                            if (window.renderDesktopIcons) window.renderDesktopIcons();
                            if (window.YandexModule) window.YandexModule.startGameplay();
                        }, 40);
                    });
                }
            };
            if (window.YandexModule) {
                window.YandexModule.showAd(startFreePlay);
            } else {
                startFreePlay();
            }
        }, 700);
        return;
    }
    if (btn.classList.contains('back-btn')) {
        closeAllPanels();
        return;
    }
    if (id === 'btnClearData') {
        if (window.AppConfig) window.AppConfig.resetToDesktopDefault();
        if (window.StoryEngine && window.StoryEngine.resetGraveClicks) window.StoryEngine.resetGraveClicks();
        localStorage.removeItem('kpr_dino_highscore');
        localStorage.removeItem('kpr_saved_chapter');
        updateContinueButton();
        showOverlayMessage('clear_data');
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

applyVisualPrefs();
updateContinueButton();
window.switchLanguage = switchLanguage;
window.updateGraphics = updateGraphics;
window.syncSettingsUI = syncSettingsUI;
