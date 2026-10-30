const videos = [
    'company_disclaimer.mp4',
    'title_intro.mp4'
];

let currentVideoIndex = 0;
let isGameStarted = false;

const videoContainer = document.getElementById('videoContainer');
const videoElement = document.getElementById('introVideo');
const mainMenu = document.getElementById('mainMenu');
const startPrompt = document.getElementById('startPrompt');

function initGameLaunch() {
    if (isGameStarted) return;
    isGameStarted = true;
    
    startPrompt.classList.add('fade-out');
    
    setTimeout(() => {
        startPrompt.style.display = 'none';
        playNextVideo();
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

function transitionToMenu() {
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

videoElement.addEventListener('ended', playNextVideo);

videoElement.addEventListener('error', () => {
    transitionToMenu();
});

startPrompt.addEventListener('click', initGameLaunch);
window.addEventListener('keydown', initGameLaunch, { once: true });
