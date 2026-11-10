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
        exit: "Выход",
        credits: "Титры",
        news: "Новости",
        credits_soon: "Титров пока нет ;)"
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
        exit: "Exit",
        credits: "Credits",
        news: "News",
        credits_soon: "No credits yet ;)"
    }
};

const graphicsLevels = ['low', 'medium', 'high'];
const languages = ['ru', 'en'];

let currentGfxIndex = 2;
let currentLangIndex = 0;

let currentVideoIndex = 0;
let isGameStarted = false;
let settingsContext = 'menu';

const videoContainer = document.getElementById('videoContainer');
const videoElement = document.getElementById('introVideo');
const mainMenu = document.getElementById('mainMenu');
const startPrompt = document.getElementById('startPrompt');
const creditsOverlay = document.getElementById('creditsOverlay');

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
    videoContainer.addEventListener('touchstart', (e) => {
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
            buildArrowSettings();
        }, 50);
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
        }, 600);
    });
}

function switchLanguage(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    updateArrowValuesDisplay();
}

function updateGraphics(level) {
    document.body.classList.remove('gfx-low', 'gfx-medium', 'gfx-high');
    document.body.classList.add('gfx-' + level);
}

function buildArrowSettings() {
    const rows = panelSettings.querySelectorAll('.setting-row');
    
    rows.forEach(row => {
        const optionsContainer = row.querySelector('.setting-options');
        if (!optionsContainer) return;
        
        const isGfx = row.querySelector('[data-lang="graphics"]');
        optionsContainer.innerHTML = '';
        
        const prevBtn = document.createElement('button');
        prevBtn.classList.add('arrow-btn');
        prevBtn.textContent = '◀';
        
        const valueDisplay = document.createElement('span');
        valueDisplay.classList.add('current-value');
        valueDisplay.id = isGfx ? 'gfxValueDisplay' : 'langValueDisplay';
        
        const nextBtn = document.createElement('button');
        nextBtn.classList.add('arrow-btn');
        nextBtn.textContent = '▶';
        
        if (isGfx) {
            prevBtn.addEventListener('click', () => changeGfxSetting(-1));
            nextBtn.addEventListener('click', () => changeGfxSetting(1));
        } else {
            prevBtn.addEventListener('click', () => changeLangSetting(-1));
            nextBtn.addEventListener('click', () => changeLangSetting(1));
        }
        
        optionsContainer.appendChild(prevBtn);
        optionsContainer.appendChild(valueDisplay);
        optionsContainer.appendChild(nextBtn);
    });
    
    updateArrowValuesDisplay();
}

function changeGfxSetting(dir) {
    currentGfxIndex = (currentGfxIndex + dir + graphicsLevels.length) % graphicsLevels.length;
    const level = graphicsLevels[currentGfxIndex];
    updateGraphics(level);
    updateArrowValuesDisplay();
}

function changeLangSetting(dir) {
    currentLangIndex = (currentLangIndex + dir + languages.length) % languages.length;
    const lang = languages[currentLangIndex];
    switchLanguage(lang);
}

function updateArrowValuesDisplay() {
    const lang = document.documentElement.lang || 'ru';
    
    const gfxDisplay = document.getElementById('gfxValueDisplay');
    if (gfxDisplay) {
        const level = graphicsLevels[currentGfxIndex];
        gfxDisplay.textContent = translations[lang]['graphics_' + (level === 'medium' ? 'med' : level)];
    }
    
    const langDisplay = document.getElementById('langValueDisplay');
    if (langDisplay) {
        langDisplay.textContent = languages[currentLangIndex] === 'ru' ? 'Русский' : 'English';
    }
}

document.addEventListener('click', function(e) {
    const target = e.target;
    
    if (target === startPrompt || startPrompt.contains(target)) {
        initGameLaunch();
        return;
    }
    
    if (target.id === 'btnSettings') {
        settingsContext = 'menu';
        openPanel(target, panelSettings);
        return;
    }
    
    if (target.id === 'btnStart') {
        settingsContext = 'menu';
        openPanel(target, panelStart);
        return;
    }
    
    if (target.id === 'btnCredits') {
        creditsOverlay.classList.remove('hidden');
        setTimeout(() => creditsOverlay.classList.add('visible'), 50);
        setTimeout(() => {
            creditsOverlay.classList.remove('visible');
            setTimeout(() => creditsOverlay.classList.add('hidden'), 500);
        }, 3000);
        return;
    }
    
    if (target.id === 'btnFree') {
        mainMenu.classList.remove('visible');
        setTimeout(() => {
            mainMenu.classList.add('hidden');
            if (window.triggerLoading) {
                window.triggerLoading(() => {
                    const desktopEnv = document.getElementById('desktopEnv');
                    desktopEnv.classList.remove('hidden');
                    setTimeout(() => desktopEnv.classList.add('visible'), 50);
                });
            }
        }, 1000);
        return;
    }
    
    if (target.classList.contains('back-btn')) {
        closeAllPanels();
        return;
    }
    
    if (target.id === 'btnClearData') {
        location.reload();
        return;
    }
});

videoElement.addEventListener('ended', playNextVideo);

window.addEventListener('keydown', (e) => {
    if (!isGameStarted && (e.code === 'Space' || e.code === 'Enter')) {
        initGameLaunch();
    }
}, { once: true });

window.switchLanguage = switchLanguage;
