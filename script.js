const videos = [
    'company_disclaimer.mp4',
    'company_disclaimer.mp4'
];

let currentVideoIndex = 0;
let isGameStarted = false;

const videoContainer = document.getElementById('videoContainer');
const videoElement = document.getElementById('introVideo');
const mainMenu = document.getElementById('mainMenu');
const startPrompt = document.getElementById('startPrompt');
const blackOverlay = document.getElementById('blackOverlay');

const menuContent = document.getElementById('menuContent');
const mainButtonsList = document.getElementById('mainButtonsList');
const btnStart = document.getElementById('btnStart');
const btnFree = document.getElementById('btnFree');
const btnSettings = document.getElementById('btnSettings');

const panelSettings = document.getElementById('panelSettings');
const panelStart = document.getElementById('panelStart');
const btnClearData = document.getElementById('btnClearData');

function initGameLaunch() {
    if (isGameStarted) return;
    isGameStarted = true;
    
    startPrompt.classList.add('fade-out');
    
    setTimeout(() => {
        startPrompt.style.display = 'none';
        playNextVideo();
        setupSkipListeners();
    }, 500);
}

function playNextVideo() {
    if (currentVideoIndex < videos.length) {
        videoElement.src = videos[currentVideoIndex];
        videoElement.load();
        
        videoElement.muted = false;
        let playPromise = videoElement.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                videoElement.muted = true;
                videoElement.play().catch(() => {
                    transitionToMenu();
                });
            });
        }
        
        currentVideoIndex++;
    } else {
        transitionToMenu();
    }
}

function skipCurrentVideo() {
    if (!isGameStarted || videoContainer.style.display === 'none') return;
    videoElement.pause();
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
        
        setTimeout(() => {
            mainMenu.classList.add('visible');
        }, 50);
        
    }, 1000);
}

function openPanel(clickedButton, targetPanel) {
    mainButtonsList.classList.add('has-active');
    clickedButton.classList.add('clicked');
    menuContent.classList.add('shifted');
    
    targetPanel.classList.remove('hidden');
    setTimeout(() => {
        targetPanel.classList.add('visible');
    }, 50);
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
        }, 800);
    });
}

btnSettings.addEventListener('click', () => {
    openPanel(btnSettings, panelSettings);
});

btnStart.addEventListener('click', () => {
    openPanel(btnStart, panelStart);
});

btnFree.addEventListener('click', () => {
    mainButtonsList.classList.add('has-active');
    btnFree.classList.add('clicked');
    
    blackOverlay.classList.add('active');
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
    });
});

btnClearData.addEventListener('click', () => {
    location.reload();
});

videoElement.addEventListener('ended', playNextVideo);
videoElement.addEventListener('error', () => { transitionToMenu(); });

startPrompt.addEventListener('click', initGameLaunch);
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
        initGameLaunch();
    }
}, { once: true });
