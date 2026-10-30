const videos = [
    'video/company_disclaimer.mp4',
    'video/title_intro.mp4'
];

let currentVideoIndex = 0;

const videoContainer = document.getElementById('videoContainer');
const videoElement = document.getElementById('introVideo');
const mainMenu = document.getElementById('mainMenu');

function playNextVideo() {
    if (currentVideoIndex < videos.length) {
        videoElement.src = videos[currentVideoIndex];
        videoElement.load();
        
        let playPromise = videoElement.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                window.addEventListener('click', startInitialPlayback, { once: true });
                window.addEventListener('keydown', startInitialPlayback, { once: true });
            });
        }
        
        currentVideoIndex++;
    } else {
        transitionToMenu();
    }
}

function startInitialPlayback() {
    videoElement.play();
}

function transitionToMenu() {
    videoContainer.style.transition = 'opacity 1.5s ease';
    videoContainer.style.opacity = '0';
    
    setTimeout(() => {
        videoContainer.style.display = 'none';
        mainMenu.classList.remove('hidden');
        
        setTimeout(() => {
            mainMenu.classList.add('visible');
        }, 50);
        
    }, 1500);
}

videoElement.addEventListener('ended', playNextVideo);

window.addEventListener('DOMContentLoaded', () => {
    playNextVideo();
});
