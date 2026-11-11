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
        credits_soon: "No credits yet ;)",
        news_text: "Development of «The Message» is in full swing!"
    }
};

const gfxOrder = ['low', 'medium', 'high'];
const langOrder = ['en', 'ru'];

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
        syncSettingsUI();
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
        const lockIcon = firstBtn.querySelector(".lock-icon");
        const comingSoon = firstBtn.querySelector(".coming-soon");
        if (lockIcon) lockIcon.remove();
        if (comingSoon) comingSoon.remove();
    }
}
